-- Migration: Create price_alerts table for Target Price Alert feature
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'triggered', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ,
  CHECK (target_price > 0)
);

-- Speed up cron job lookups: find all active alerts by product
CREATE INDEX IF NOT EXISTS idx_price_alerts_active
  ON price_alerts (product_id, status)
  WHERE status = 'active';

-- RLS: users manage only their own alerts
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running migration
DROP POLICY IF EXISTS "Users can manage their own alerts" ON price_alerts;

CREATE POLICY "Users can manage their own alerts"
  ON price_alerts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
