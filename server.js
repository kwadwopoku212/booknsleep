// server.js
require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { z } = require('zod');

const app = express();
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const WATCHLIST = [
  'booking.com','bookingholdings.com','airbnb.com','expedia.com','expediagroup.com',
  'hotels.com','agoda.com','priceline.com','vrbo.com','tripadvisor.com'
];

const ORIGIN_ALLOWLIST = (process.env.ORIGIN_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean);

// Health
app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve admin static page
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Create HTTP server and attach WS
const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Backend running on port', server.address().port);
});

const wss = new WebSocketServer({ noServer: true });
const adminWSS = new WebSocketServer({ noServer: true });

const eventSchema = z.object({
  type: z.literal('event'),
  data: z.object({
    session_id: z.string().min(8),
    event_type: z.enum(['page_view','click','form_submit']),
    target: z.string().min(1),
    metadata: z.record(z.any()).optional(),
    email: z.string().email().optional(),
    fingerprint: z.string().optional(),
    consent: z.enum(['yes','no']).optional()
  })
});

// Upgrade handling for two WS paths
server.on('upgrade', (req, socket, head) => {
  const { url, headers } = req;
  const origin = headers.origin || '';
  const allowed = ORIGIN_ALLOWLIST.length === 0 || ORIGIN_ALLOWLIST.includes(origin);

  if (!allowed) {
    socket.destroy();
    return;
  }

  if (url === '/ws/events') {
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
  } else if (url === '/ws/admin') {
    adminWSS.handleUpgrade(req, socket, head, ws => adminWSS.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});

// Admin auth via token query ?token=...
adminWSS.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  if (token !== process.env.ADMIN_TOKEN) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  ws.send(JSON.stringify({ type: 'welcome', time: new Date().toISOString() }));
});

// Utility
function clientIP(req) {
  const xf = req.headers['x-forwarded-for'];
  return (xf ? xf.split(',')[0].trim() : req.socket.remoteAddress) || '0.0.0.0';
}

function resolveOrgFromEmail(email) {
  if (!email || !email.includes('@')) return null;
  const org_domain = email.split('@')[1].toLowerCase();
  return { org_domain, org_name: org_domain.split('.')[0] };
}

// Curiosity scoring
async function computeCuriosityScore(visitor_id) {
  const { rows } = await pool.query(
    `SELECT signal_type, SUM(value) AS v
     FROM curiosity_signals
     WHERE visitor_id = $1
     GROUP BY signal_type`, [visitor_id]
  );

  const weights = {
    ip_org_match: 5,
    email_domain_watchlist: 4,
    repeat_visit: 3,
    cta_click: 2,
    deep_scroll: 1.5,
    page_view: 0.5
  };

  let score = 0;
  for (const r of rows) score += (weights[r.signal_type] || 0) * Number(r.v);

  let label = 'low_interest';
  if (score >= 10) label = 'industry_watch';
  else if (score >= 6) label = 'high_interest';
  else if (score >= 3) label = 'medium_interest';

  const explanation = `Score=${score}. Signals=${rows.map(r => r.signal_type).join(', ')}`;

  await pool.query(
    `INSERT INTO curiosity_scores (visitor_id, score, label, explanation)
     VALUES ($1, $2, $3, $4)`,
    [visitor_id, score, label, explanation]
  );

  return { score, label, explanation };
}

// Broadcast to all admin clients
function broadcastAdmin(message) {
  const msg = JSON.stringify(message);
  adminWSS.clients.forEach(c => {
    if (c.readyState === 1) c.send(msg);
  });
}

// Event WS
wss.on('connection', (ws, req) => {
  const ip = clientIP(req);

  ws.on('message', async (raw) => {
    let parsed;
    try {
      parsed = eventSchema.parse(JSON.parse(raw.toString()));
    } catch {
      // invalid payload
      return;
    }

    if (parsed.data.consent && parsed.data.consent !== 'yes') {
      // Respect decline
      return;
    }

    const p = parsed.data;
    const orgInfo = resolveOrgFromEmail(p.email);
    const orgDomain = orgInfo?.org_domain || null;
    const orgName = orgDomain && WATCHLIST.includes(orgDomain) ? 'WATCHLIST_MATCH' : orgInfo?.org_name || null;

    // Upsert visitor
    const v = await pool.query(
      `INSERT INTO visitors (session_id, ip, email, org_name, org_domain, fingerprint)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (session_id) DO UPDATE SET
         ip = EXCLUDED.ip,
         email = EXCLUDED.email,
         org_name = EXCLUDED.org_name,
         org_domain = EXCLUDED.org_domain,
         fingerprint = EXCLUDED.fingerprint,
         updated_at = NOW()
       RETURNING *`,
      [p.session_id, ip, p.email || null, orgName, orgDomain, p.fingerprint || null]
    );
    const visitor = v.rows[0];

    // Insert event
    await pool.query(
      `INSERT INTO events (visitor_id, event_type, target, metadata, occurred_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [visitor.id, p.event_type, p.target, p.metadata || {}]
    );

    // Derive signals
    const signals = [];

    if (orgDomain && WATCHLIST.includes(orgDomain)) {
      signals.push({ type: 'email_domain_watchlist', value: 1, context: { domain: orgDomain } });
    }
    if (p.event_type === 'click' && ['Notify Me','Apply Now','Learn More'].includes(p.target)) {
      signals.push({ type: 'cta_click', value: 1, context: { target: p.target } });
    }
    if (p.event_type === 'page_view' && p.metadata?.path) {
      signals.push({ type: 'page_view', value: 1, context: { path: p.metadata.path } });
      const pvCount = await pool.query(
        `SELECT COUNT(*) AS c FROM events WHERE visitor_id = $1 AND event_type = 'page_view'`,
        [visitor.id]
      );
      if (Number(pvCount.rows[0].c) >= 3) {
        signals.push({ type: 'repeat_visit', value: 1, context: { count: Number(pvCount.rows[0].c) } });
      }
    }

    for (const s of signals) {
      await pool.query(
        `INSERT INTO curiosity_signals (visitor_id, signal_type, value, context)
         VALUES ($1, $2, $3, $4)`,
        [visitor.id, s.type, s.value, s.context]
      );
    }

    const curiosity = await computeCuriosityScore(visitor.id);

    // Acknowledge client minimally
    ws.send(JSON.stringify({ type: 'ack', label: curiosity.label }));

    // Broadcast to admins (live feed)
    broadcastAdmin({
      type: 'curiosity_update',
      visitor_id: visitor.id,
      org_domain: orgDomain,
      label: curiosity.label,
      score: curiosity.score,
      target: p.target,
      event_type: p.event_type,
      time: dayjs().toISOString()
    });
  });

  ws.on('error', () => {});
});
