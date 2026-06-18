-- ─── NexPrice v2: Fixes for known issues ─────────────────────────────────────
-- Run this in the Supabase SQL Editor after the base migration.

-- Fix #3: Prevent duplicate active alerts per user+product
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_alerts_active_unique
  ON price_alerts (user_id, product_id)
  WHERE status = 'active';

-- Fix #6: Rate limiting table (serverless-safe)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL DEFAULT 'page',
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ip_hash, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup
  ON rate_limits (window_start);
