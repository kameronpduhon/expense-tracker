-- Seed pre-loaded data

-- Categories
INSERT INTO categories (name) VALUES
  ('Business'),
  ('Wedding'),
  ('Personal'),
  ('Custom')
ON CONFLICT (name) DO NOTHING;

-- Businesses
INSERT INTO businesses (name) VALUES
  ('Wedding Vendor HQ'),
  ('HVAC Platform')
ON CONFLICT (name) DO NOTHING;

-- Payment Methods
INSERT INTO payment_methods (name) VALUES
  ('Cash'),
  ('Card'),
  ('Bank'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
