-- Seed pre-loaded data

-- Categories
INSERT INTO categories (name) VALUES
  ('Business'),
  ('Personal'),
  ('Custom')
ON CONFLICT (name) DO NOTHING;

-- Businesses (example placeholders — edit to your own)
INSERT INTO businesses (name) VALUES
  ('Side Project A'),
  ('Side Project B')
ON CONFLICT (name) DO NOTHING;

-- Payment Methods
INSERT INTO payment_methods (name) VALUES
  ('Cash'),
  ('Card'),
  ('Bank'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
