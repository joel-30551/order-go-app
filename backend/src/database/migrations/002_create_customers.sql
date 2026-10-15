CREATE TABLE IF NOT EXISTS customers (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT UNIQUE,
  customer_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
