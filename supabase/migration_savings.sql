-- Migration: Add savings tracking columns to price_alerts
-- Run this in the Supabase SQL Editor

ALTER TABLE price_alerts
  ADD COLUMN IF NOT EXISTS price_at_creation NUMERIC,
  ADD COLUMN IF NOT EXISTS savings NUMERIC;
