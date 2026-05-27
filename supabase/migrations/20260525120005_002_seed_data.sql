/*
  # DineQ Seed Data

  Populates the database with initial data for the Spice Garden restaurant.

  ## Data Added:

  1. **Restaurant**: Spice Garden - Indian restaurant with 10 tables
     - Open 11:00 AM to 11:00 PM

  2. **Menu Items**: 10 authentic Indian dishes
     - Starters: Samosa, Paneer Tikka, Chicken Tikka, Veg Spring Roll
     - Mains: Butter Chicken, Paneer Butter Masala, Dal Makhani, Biryani
     - Desserts: Gulab Jamun, Kulfi
*/

-- Insert restaurant data
INSERT INTO restaurants (name, description, open_time, close_time, total_tables, is_open)
VALUES (
  'Spice Garden',
  'Authentic Indian cuisine with rich flavors and aromatic spices. Experience the taste of India with our carefully crafted dishes passed down through generations.',
  '11:00 AM',
  '11:00 PM',
  10,
  true
) ON CONFLICT DO NOTHING;

-- Insert admin user with bcrypt hashed password (admin123)
-- Hash generated with: bcrypt.hashSync('admin123', 10)
INSERT INTO admins (email, password_hash)
VALUES (
  'admin@spicegarden.com',
  '$2a$10$ZqXvXQbNcZ8wWVhKqH5ZcOqJ6ZyQhNqGpM4qDqFZxYJHbDcFZhVmK'
) ON CONFLICT (email) DO NOTHING;

-- Starters
INSERT INTO menu_items (name, description, price, category, is_available)
VALUES 
  ('Samosa', 'Crispy pastry filled with spiced potatoes and peas, served with mint chutney', 120.00, 'Starters', true),
  ('Paneer Tikka', 'Cubes of cottage cheese marinated in aromatic spices and grilled to perfection', 280.00, 'Starters', true),
  ('Chicken Tikka', 'Tender chicken pieces marinated in yogurt and spices, char-grilled', 320.00, 'Starters', true),
  ('Veg Spring Roll', 'Crispy rolls filled with fresh vegetables and noodles', 150.00, 'Starters', true);

-- Mains
INSERT INTO menu_items (name, description, price, category, is_available)
VALUES
  ('Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces, served with naan', 380.00, 'Mains', true),
  ('Paneer Butter Masala', 'Cottage cheese cubes in rich, creamy tomato gravy', 320.00, 'Mains', true),
  ('Dal Makhani', 'Black lentils slow-cooked overnight with butter and cream', 260.00, 'Mains', true),
  ('Biryani', 'Fragrant basmati rice layered with spiced meat/vegetables and aromatic spices', 350.00, 'Mains', true);

-- Desserts
INSERT INTO menu_items (name, description, price, category, is_available)
VALUES
  ('Gulab Jamun', 'Soft milk dumplings soaked in rose-flavored sugar syrup', 120.00, 'Desserts', true),
  ('Kulfi', 'Traditional Indian ice cream with pistachios and cardamom', 150.00, 'Desserts', true);
