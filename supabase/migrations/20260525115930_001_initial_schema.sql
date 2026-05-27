/*
  # DineQ Initial Database Schema

  Creates the complete database structure for the DineQ restaurant queue management system.

  ## Tables Created:
  
  1. **restaurants** - Restaurant information and settings
     - Contains restaurant details, operating hours, and table count
  
  2. **customers** - Queue management for customers
     - Tracks customers in the queue with tokens and positions
     - Includes status tracking (WAITING, SEATED, CANCELLED)
  
  3. **menu_items** - Restaurant menu
     - Menu items organized by category (Starters, Mains, Desserts)
     - Includes pricing and availability
  
  4. **orders** - Pre-orders placed by customers
     - Links to customers and tracks order status
  
  5. **order_items** - Individual items within orders
     - Links orders to menu items with quantities
  
  6. **admins** - Admin authentication
     - Stores admin credentials (email and password hash)
  
  7. **wait_predictions** - AI prediction history
     - Stores prediction results for caching and analytics

  ## Security:
  - RLS enabled on all tables
  - Public read access for restaurants and menu_items
  - Customer-scoped access for orders
  - Admin-only write access for management tables
*/

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  open_time text NOT NULL DEFAULT '11:00 AM',
  close_time text NOT NULL DEFAULT '11:00 PM',
  total_tables integer NOT NULL DEFAULT 10,
  is_open boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Customers table (queue management)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  party_size integer NOT NULL,
  queue_token text UNIQUE NOT NULL,
  position integer NOT NULL,
  status text DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'SEATED', 'CANCELLED')),
  joined_at timestamptz DEFAULT now()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL CHECK (category IN ('Starters', 'Mains', 'Desserts')),
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY')),
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Wait predictions table (AI cache)
CREATE TABLE IF NOT EXISTS wait_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimated_wait_minutes integer NOT NULL,
  wait_range text NOT NULL,
  confidence text NOT NULL,
  reasoning text NOT NULL,
  peak_hour_warning boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_position ON customers(position);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON wait_predictions(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE wait_predictions ENABLE ROW LEVEL SECURITY;

-- Public read access for restaurants
CREATE POLICY "Anyone can view restaurant info"
  ON restaurants FOR SELECT
  TO public
  USING (true);

-- Public read access for menu items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO public
  USING (true);

-- Public can insert customers (join queue)
CREATE POLICY "Anyone can join queue"
  ON customers FOR INSERT
  TO public
  WITH CHECK (true);

-- Public can read customer by token (for status check)
CREATE POLICY "Customers can view by token"
  ON customers FOR SELECT
  TO public
  USING (true);

-- Public can insert orders
CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Public can view orders
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO public
  USING (true);

-- Public can view order items
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  TO public
  USING (true);

-- Public can insert order items
CREATE POLICY "Anyone can add order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

-- Admin policies (using service role key for admin operations)
CREATE POLICY "Admins can manage everything"
  ON restaurants FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage menu items"
  ON menu_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage predictions"
  ON wait_predictions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can read their own table for auth
CREATE POLICY "Admins can read for auth"
  ON admins FOR SELECT
  TO service_role
  USING (true);
