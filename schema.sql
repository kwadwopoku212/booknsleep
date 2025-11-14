-- schema.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  ip INET,
  org_name TEXT,
  org_domain TEXT,
  email TEXT,
  fingerprint TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('page_view','click','form_submit')),
  target TEXT,
  metadata JSONB,
  occurred_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curiosity_signals (
  id BIGSERIAL PRIMARY KEY,
  visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
  signal_type TEXT,
  value NUMERIC,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curiosity_scores (
  id BIGSERIAL PRIMARY KEY,
  visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
  score NUMERIC,
  label TEXT,
  explanation TEXT,
  computed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_visitor_time ON events(visitor_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_visitors_org ON visitors(org_domain, org_name);
CREATE INDEX IF NOT EXISTS idx_curiosity_signals_visitor ON curiosity_signals(visitor_id);
