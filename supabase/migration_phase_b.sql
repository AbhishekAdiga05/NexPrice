-- Phase B: Price Predictions + Watchlist

-- 1. Price predictions cache (avoids re-calling Gemini on every page load)
CREATE TABLE IF NOT EXISTS price_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  predicted_price NUMERIC NOT NULL,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  timeframe TEXT,
  reasoning TEXT,
  source TEXT DEFAULT 'gemini',
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day')
);

CREATE INDEX IF NOT EXISTS idx_price_predictions_product ON price_predictions(product_id);

ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;

-- RLS: users can read predictions for their own products (via product ownership)
CREATE POLICY "Users read predictions for their products"
  ON price_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_predictions.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Cron cleanup: remove expired predictions
SELECT cron.schedule(
  'cleanup-expired-predictions',
  '0 0 * * *',
  $$DELETE FROM price_predictions WHERE expires_at < NOW()$$
);

-- 2. Watchlist (prioritized product shortlist)
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_priority ON watchlist(user_id, priority DESC);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own watchlist"
  ON watchlist FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
