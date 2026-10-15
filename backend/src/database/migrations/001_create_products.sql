CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'product_category'
  ) THEN
    CREATE TYPE product_category AS ENUM (
      'electronics',
      'fashion',
      'groceries',
      'accessories',
      'office',
      'other'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS products (
  prod_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  prod_name TEXT NOT NULL,

  prod_quantity INT NOT NULL DEFAULT 0
    CHECK (prod_quantity >= 0),

  prod_cat product_category NOT NULL DEFAULT 'other',

  prod_price NUMERIC(10,2) NOT NULL
    CHECK (prod_price >= 0),

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
