DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  cust_id UUID NOT NULL
    REFERENCES customers(customer_id)
    ON DELETE CASCADE,

  order_total NUMERIC(10,2) NOT NULL,

  order_status order_status DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE order_items (
  order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL
    REFERENCES orders(order_id)
    ON DELETE CASCADE,

  prod_id UUID NOT NULL
    REFERENCES products(prod_id),

  quantity INT NOT NULL CHECK (quantity > 0),

  price_at_purchase NUMERIC(10,2) NOT NULL
);
