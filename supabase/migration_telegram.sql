-- Telegram Notifications + Notification History

-- 1. Add telegram_chat_id to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false;

-- 2. Notification history table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES price_alerts(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'target_reached',
    'price_drop'
  )),
  channel TEXT NOT NULL CHECK (channel IN ('telegram', 'email')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  recipient TEXT,
  price_at_event NUMERIC,
  target_price NUMERIC,
  old_price NUMERIC,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_product ON notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());
