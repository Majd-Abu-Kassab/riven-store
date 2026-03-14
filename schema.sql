-- =============================================
-- RIVEN E-COMMERCE STORE — SUPABASE DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE
-- Auto-created when users sign up via the trigger below
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can do everything on profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Categories are public" ON categories
  FOR SELECT USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sku TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Active products are public" ON products
  FOR SELECT USING (true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  delivery_method TEXT CHECK (delivery_method IN ('delivery', 'pickup')) DEFAULT 'delivery',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can view own orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Customers can create own orders
CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Admins can do everything on orders
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- If you can view the order, you can view the items
CREATE POLICY "View items if can view order" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Customers can insert items when creating an order
CREATE POLICY "Customers can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Admins can manage all
CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are public" ON reviews
  FOR SELECT USING (true);

-- Customers can create reviews
CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can update own reviews
CREATE POLICY "Customers can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Customers can delete own reviews
CREATE POLICY "Customers can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = customer_id);


-- 7. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(customer_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Customers can view own wishlist
CREATE POLICY "Customers can view own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = customer_id);

-- Customers can add to wishlist
CREATE POLICY "Customers can add to wishlist" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can remove from wishlist
CREATE POLICY "Customers can remove from wishlist" ON wishlists
  FOR DELETE USING (auth.uid() = customer_id);


-- 8. STORAGE BUCKETS (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS:
-- CREATE POLICY "Public read for product images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Admins can upload product images" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- =============================================
-- SEED DATA (optional — remove in production)
-- =============================================

-- Sample categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Electronics', 'electronics', 'Latest gadgets, audio gear, and smart devices', 1),
  ('Fashion', 'fashion', 'Trending styles, accessories, and footwear', 2),
  ('Home & Living', 'home-living', 'Decor, furniture, and lifestyle products', 3),
  ('Sports & Outdoors', 'sports', 'Fitness gear, activewear, and equipment', 4),
  ('Beauty & Health', 'beauty-health', 'Skincare, wellness, and personal care', 5),
  ('Books & Stationery', 'books', 'Books, planners, and office supplies', 6)
ON CONFLICT (slug) DO NOTHING;

-- Sample products
INSERT INTO products (name, slug, description, price, compare_at_price, category_id, stock_quantity, is_featured, sku) VALUES
  ('Wireless Headphones Pro', 'wireless-headphones-pro', 'Premium noise-canceling headphones with 40-hour battery life', 89.99, 129.99, (SELECT id FROM categories WHERE slug = 'electronics'), 15, true, 'WHP-001'),
  ('Minimalist Watch', 'minimalist-watch', 'Elegant timepiece for everyday wear', 149.99, NULL, (SELECT id FROM categories WHERE slug = 'fashion'), 8, true, 'MW-001'),
  ('Smart Water Bottle', 'smart-water-bottle', 'Tracks your hydration throughout the day', 34.99, 49.99, (SELECT id FROM categories WHERE slug = 'home-living'), 30, true, 'SWB-001'),
  ('Yoga Mat Premium', 'yoga-mat-premium', 'Non-slip exercise mat for yoga and workouts', 45.00, NULL, (SELECT id FROM categories WHERE slug = 'sports'), 22, false, 'YMP-001'),
  ('Leather Backpack', 'leather-backpack', 'Handcrafted genuine leather backpack', 199.99, 249.99, (SELECT id FROM categories WHERE slug = 'fashion'), 5, true, 'LB-001'),
  ('Portable Speaker', 'portable-speaker', 'Waterproof bluetooth speaker with 360° sound', 59.99, NULL, (SELECT id FROM categories WHERE slug = 'electronics'), 18, false, 'PS-001'),
  ('Scented Candle Set', 'scented-candle-set', 'Set of 3 luxury aromatherapy candles', 28.99, NULL, (SELECT id FROM categories WHERE slug = 'home-living'), 40, false, 'SCS-001'),
  ('Running Shoes', 'running-shoes', 'Lightweight performance running shoes', 119.99, 159.99, (SELECT id FROM categories WHERE slug = 'sports'), 12, false, 'RS-001')
ON CONFLICT (slug) DO NOTHING;


-- =============================================
-- TO MAKE A USER AN ADMIN:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
-- =============================================
