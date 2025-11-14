// tracker.js
(function() {
  const WSS_ENDPOINT = 'wss://YOUR-BACKEND-DOMAIN/ws/events';

  const hasDNT = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const consentKey = 'bns_consent';

  function getSessionId() {
    const existing = localStorage.getItem('bns_session');
    if (existing) return existing;
    const s = 'sess_' + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem('bns_session', s);
    return s;
  }
  const sessionId = getSessionId();

  // Minimal consent banner hookup (assumes you added the banner HTML)
  function allowed() {
    if (hasDNT) return false;
    return localStorage.getItem(consentKey) === 'yes';
  }

  // Open WS lazily when needed
  let ws = null;
  function ensureWS() {
    if (ws && ws.readyState === 1) return ws;
    ws = new WebSocket(WSS_ENDPOINT);
    ws.onopen = () => {};
    ws.onclose = () => {};
    ws.onerror = () => {};
    return ws;
  }

  function sendEvent(evt) {
    if (!allowed()) return;
    const sock = ensureWS();
    const payload = {
      type: 'event',
      data: {
        consent: 'yes',
        session_id: sessionId,
        event_type: evt.event_type,
        target: evt.target,
        email: evt.email || undefined,
        metadata: evt.metadata || {}
      }
    };
    const trySend = () => {
      if (sock.readyState === 1) {
        sock.send(JSON.stringify(payload));
      } else {
        setTimeout(trySend, 50);
      }
    };
    trySend();
  }

  // Page view
  document.addEventListener('DOMContentLoaded', () => {
    const utm = Object.fromEntries(new URLSearchParams(window.location.search));
    sendEvent({
      event_type: 'page_view',
      target: window.location.pathname,
      metadata: {
        path: window.location.pathname,
        referrer: document.referrer || null,
        utm
      }
    });
  });

  // CTA clicks
  const CTA_TEXTS = ['Notify Me','Apply Now','Learn More'];
  document.addEventListener('click', (e) => {
    const t = e.target;
    const text = (t.innerText || '').trim();
    if (CTA_TEXTS.includes(text)) {
      sendEvent({
        event_type: 'click',
        target: text,
        metadata: { path: window.location.pathname }
      });
    }
  });

  // Early access email submit
  const notifyForm = document.querySelector('.notify-form');
  notifyForm && notifyForm.addEventListener('submit', () => {
    const email = notifyForm.querySelector('input[name="email"]')?.value || null;
    sendEvent({
      event_type: 'form_submit',
      target: 'notify_form',
      email,
      metadata: { path: window.location.pathname }
    });
  });

  // Join team mailto capture
  const applyForm = document.querySelector('.apply-form');
  applyForm && applyForm.addEventListener('submit', () => {
    const email = applyForm.querySelector('input[name="email"]')?.value || null;
    sendEvent({
      event_type: 'form_submit',
      target: 'apply_form_mailto',
      email,
      metadata: { path: window.location.pathname }
    });
  });
})();
