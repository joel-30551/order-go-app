-- Clear all existing rows (they have no owner)
TRUNCATE products, customers, orders CASCADE;

-- Add user_id to products
ALTER TABLE products ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE products ALTER COLUMN user_id DROP DEFAULT;

-- Add user_id to customers
ALTER TABLE customers ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE customers ALTER COLUMN user_id DROP DEFAULT;

-- Add user_id to orders
ALTER TABLE orders ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ALTER COLUMN user_id DROP DEFAULT;

-- Indexes for fast per-user lookups
CREATE INDEX ON products(user_id);
CREATE INDEX ON customers(user_id);
CREATE INDEX ON orders(user_id);
