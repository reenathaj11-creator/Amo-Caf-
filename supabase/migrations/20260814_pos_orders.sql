-- Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED', -- COMPLETED, CANCELLED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view orders from their company" ON orders FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE company_id = orders.company_id));
CREATE POLICY "Users can insert orders for their company" ON orders FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE company_id = orders.company_id));

-- Order Items Table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view order items from their company" ON order_items FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM orders WHERE id = order_items.order_id)));
CREATE POLICY "Users can insert order items for their company" ON order_items FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM orders WHERE id = order_items.order_id)));
