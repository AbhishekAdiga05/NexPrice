-- ─── NexPrice: Full Database Migration ───────────────────────────────────────
-- Run this once in the Supabase SQL Editor.
-- All tables use IF NOT EXISTS so it is safe to re-run.

-- 1. Products ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_url ON products(user_id, url);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own products"
  ON products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Price History ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_checked ON price_history(product_id, checked_at ASC);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read price history for their products"
  ON price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_history.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert price history for their products"
  ON price_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_history.product_id
      AND products.user_id = auth.uid()
    )
  );

-- 3. Price Alerts ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'triggered', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ,
  price_at_creation NUMERIC,
  savings NUMERIC,
  CHECK (target_price > 0)
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_active
  ON price_alerts (product_id, status)
  WHERE status = 'active';

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own alerts" ON price_alerts;

CREATE POLICY "Users can manage their own alerts"
  ON price_alerts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Store Prices (multi-store comparison) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS store_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, store_name)
);

CREATE INDEX IF NOT EXISTS idx_store_prices_product ON store_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_store_prices_price ON store_prices(product_id, price ASC);

ALTER TABLE store_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read store prices for their products"
  ON store_prices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = store_prices.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert store prices for their products"
  ON store_prices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = store_prices.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update store prices for their products"
  ON store_prices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = store_prices.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete store prices for their products"
  ON store_prices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = store_prices.product_id
      AND products.user_id = auth.uid()
    )
  );

-- 5. User Settings ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weekly_digest BOOLEAN DEFAULT true,
  digest_day TEXT DEFAULT 'sunday',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Price Predictions ───────────────────────────────────────────────────────

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

CREATE POLICY "Users read predictions for their products"
  ON price_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_predictions.product_id
      AND products.user_id = auth.uid()
    )
  );

-- 7. Watchlist ───────────────────────────────────────────────────────────────

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

-- 8. Notifications ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES price_alerts(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  recipient TEXT,
  price_at_event NUMERIC,
  target_price NUMERIC,
  old_price NUMERIC,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
