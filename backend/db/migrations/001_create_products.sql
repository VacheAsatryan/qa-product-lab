CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_name_not_empty CHECK (btrim(name) <> ''),
  CONSTRAINT products_price_positive CHECK (price > 0),
  CONSTRAINT products_quantity_nonnegative CHECK (quantity >= 0)
);

CREATE INDEX IF NOT EXISTS products_created_at_id_idx
  ON products (created_at ASC, id ASC);
