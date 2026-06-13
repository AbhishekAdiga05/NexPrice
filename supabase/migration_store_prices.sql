-- Store Prices table for multi-store price comparison
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
