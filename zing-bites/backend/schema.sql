-- ============================================
-- ZING BITES FOOD TRUCK - DATABASE SCHEMA
-- ============================================

CREATE DATABASE IF NOT EXISTS zing_bites CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zing_bites;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) UNIQUE NULL,
  phone VARCHAR(15) UNIQUE NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- OTP Table
CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  image_url VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  spice_level ENUM('mild', 'medium', 'hot', 'extra_hot') DEFAULT 'medium',
  prep_time INT DEFAULT 15,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  delivery_type ENUM('pickup', 'delivery') DEFAULT 'pickup',
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Location Table (for live tracking)
CREATE TABLE IF NOT EXISTS truck_location (
  id INT AUTO_INCREMENT PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  area VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Truck Status Table
CREATE TABLE IF NOT EXISTS truck_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  is_open BOOLEAN DEFAULT FALSE,
  open_time TIME DEFAULT '18:00:00',
  close_time TIME DEFAULT '23:00:00',
  status_message VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  admin_reply TEXT,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA
-- ============================================

-- Categories
INSERT IGNORE INTO categories (name, slug, description, icon, sort_order) VALUES
('Fast Moving Street Foods', 'street-foods', 'Hot & crispy street favorites', '🔥', 1),
('Burgers & Sandwiches', 'burgers-sandwiches', 'Juicy burgers & loaded sandwiches', '🍔', 2),
('Snacks & Sides', 'snacks-sides', 'Perfect munchies & sides', '🍟', 3),
('Indian Street Specials', 'indian-specials', 'Authentic Indian street food', '🌶️', 4);

-- Products - Street Foods (1, 10)
INSERT IGNORE INTO products (category_id, name, description, price, image_url, is_vegetarian, spice_level, is_featured) VALUES
(1, 'Masala Pav', 'Spicy bhaji with buttered pav, onions & lemon', 60.00, '/images/products/cat1_masala_pav_realistic_1775193084830.png', TRUE, 'medium', TRUE),
(1, 'Pani Puri (6 pcs)', 'Crispy puris with tangy tamarind water', 50.00, '/images/products/cat1_pani_puri_realistic_1775193102254.png', TRUE, 'hot', TRUE),
(1, 'Bhel Puri', 'Puffed rice, veggies, chutneys - classic street mix', 55.00, '/images/products/cat1_bhel_puri_realistic_1775193117767.png', TRUE, 'mild', FALSE),
(1, 'Corn Chaat', 'Roasted corn with spices, lime & butter', 70.00, '/images/products/cat1_corn_chaat_realistic_1775193134041.png', TRUE, 'medium', FALSE),
(1, 'Samosa (2 pcs)', 'Golden crispy samosas with green chutney', 40.00, '/images/products/cat1_samosa_realistic_1775193151374.png', TRUE, 'medium', FALSE),
(1, 'Vada Pav', 'Spiced potato fritter in a soft bun with chutneys', 45.00, '/images/products/cat1_vada_pav_realistic_1775193177457.png', TRUE, 'medium', TRUE),
(1, 'Sev Puri', 'Crispy papdis topped with spiced potatoes and sev', 55.00, '/images/products/cat1_sev_puri_realistic_1775193193589.png', TRUE, 'medium', FALSE),
(1, 'Dabeli', 'Kutchi Dabeli with pomegranate and spiced peanuts', 50.00, '/images/products/cat1_dabeli_realistic_1775193209817.png', TRUE, 'medium', FALSE),
(1, 'Papdi Chaat', 'Crispy wafers with yogurt, chickpeas and chutneys', 65.00, '/images/products/cat1_papdi_chaat_realistic_1775193227474.png', TRUE, 'medium', FALSE),
(1, 'Ragda Pattice', 'Potato patties with white pea curry and toppings', 75.00, '/images/products/cat1_ragda_pattice_realistic_1775193241254.png', TRUE, 'medium', FALSE);

-- Products - Burgers & Sandwiches (2, 10)
INSERT IGNORE INTO products (category_id, name, description, price, image_url, is_vegetarian, spice_level, is_featured) VALUES
(2, 'Zing Special Burger', 'Signature double-patty with special Zing sauce', 180.00, '/images/products/cat2_zing_special_burger_realistic_1775193304605.png', FALSE, 'medium', TRUE),
(2, 'Aloo Tikki Burger', 'Spiced potato patty with mint chutney & veggies', 120.00, '/images/products/cat2_aloo_tikki_burger_realistic_1775193321828.png', TRUE, 'medium', FALSE),
(2, 'Chicken Crispy Burger', 'Crispy fried chicken with coleslaw & sriracha', 160.00, '/images/products/cat2_chicken_crispy_burger_realistic_1775193336902.png', FALSE, 'hot', TRUE),
(2, 'Grilled Veg Sandwich', 'Loaded veggie sandwich with cheese & pesto', 110.00, '/images/products/cat2_grilled_veg_sandwich_realistic_1775193358307.png', TRUE, 'mild', FALSE),
(2, 'Club Sandwich', 'Triple-decker with chicken, egg, tomato & lettuce', 150.00, '/images/products/cat2_club_sandwich_realistic_1775193372755.png', FALSE, 'mild', FALSE),
(2, 'Paneer Makhani Burger', 'Grilled paneer with creamy makhani sauce', 150.00, '/images/products/cat2_paneer_makhani_burger_realistic_1775193400992.png', TRUE, 'medium', TRUE),
(2, 'BBQ Mushroom Burger', 'Grilled mushrooms with smoky BBQ sauce', 140.00, '/images/products/cat2_bbq_mushroom_burger_realistic_1775193418627.png', TRUE, 'mild', FALSE),
(2, 'Bombay Toastie', 'Spiced potato and veggie toasted sandwich', 90.00, NULL, TRUE, 'medium', FALSE),
(2, 'Peri Peri Chicken Sandwich', 'Spicy peri peri chicken strips in toasted bread', 140.00, NULL, FALSE, 'hot', FALSE),
(2, 'Spicy Fish Fillet Burger', 'Crispy fish fillet with tartar sauce', 170.00, NULL, FALSE, 'medium', FALSE);

-- Products - Snacks & Sides (3, 10)
INSERT IGNORE INTO products (category_id, name, description, price, image_url, is_vegetarian, spice_level) VALUES
(3, 'Loaded Fries', 'Crispy fries with cheese sauce & jalapeños', 120.00, '/images/products/loaded_fries.png', TRUE, 'medium'),
(3, 'Onion Rings (8 pcs)', 'Beer-battered golden onion rings', 90.00, '/images/products/onion_rings.png', TRUE, 'mild'),
(3, 'Chicken Nuggets (6 pcs)', 'Juicy chicken nuggets with dipping sauce', 130.00, '/images/products/chicken_nuggets.png', FALSE, 'mild'),
(3, 'Masala Popcorn', 'Chennai-style spiced caramel popcorn', 60.00, NULL, TRUE, 'medium'),
(3, 'Cheese Balls (6 pcs)', 'Gooey mozzarella cheese balls - crispy', 100.00, NULL, TRUE, 'mild'),
(3, 'Peri Peri Fries', 'Crispy fries tossed in spicy peri peri mix', 95.00, NULL, TRUE, 'hot'),
(3, 'Sweet Potato Wedges', 'Healthy roasted sweet potato wedges', 110.00, NULL, TRUE, 'mild'),
(3, 'Veg Spring Rolls (4 pcs)', 'Crispy rolls with veggie filling', 120.00, NULL, TRUE, 'mild'),
(3, 'Chilli Cheese Toasts', 'Spicy cheese on toasted bread', 100.00, NULL, TRUE, 'medium'),
(3, 'Masala Omelette', 'Indian style egg omelette with spices', 80.00, NULL, FALSE, 'medium');

-- Products - Indian Street Specials (4, 10)
INSERT IGNORE INTO products (category_id, name, description, price, image_url, is_vegetarian, spice_level, is_featured) VALUES
(4, 'Chole Bhature', 'Spicy chickpea curry with fluffy bhature', 130.00, NULL, TRUE, 'hot', TRUE),
(4, 'Dahi Puri (6 pcs)', 'Crispy puris with yogurt and chutneys', 80.00, NULL, TRUE, 'medium', FALSE),
(4, 'Kathi Roll (Veg)', 'Paneer tikka wrap with mint chutney', 120.00, NULL, TRUE, 'medium', FALSE),
(4, 'Chicken Kathi Roll', 'Spiced chicken wrap with onions', 140.00, NULL, FALSE, 'hot', TRUE),
(4, 'Raj Kachori', 'Giant puri bowl with chickpeas and yogurt', 110.00, NULL, TRUE, 'medium', FALSE),
(4, 'Pav Bhaji', 'Mumbai style mashed veg curry with pav', 120.00, NULL, TRUE, 'medium', TRUE),
(4, 'Misal Pav', 'Spicy sprout curry with pav and farsan', 100.00, NULL, TRUE, 'hot', FALSE),
(4, 'Kulcha with Chana', 'Soft kulchas served with spicy chickpeas', 130.00, NULL, TRUE, 'medium', FALSE),
(4, 'Paneer Kathi Roll', 'Grilled paneer wrap specialized with spices', 130.00, NULL, TRUE, 'medium', FALSE),
(4, 'Egg Kathi Roll', 'Classic egg wrap with saut\u00e9ed veggies', 110.00, NULL, FALSE, 'medium', FALSE);

-- Initial Location (Chennai - T Nagar)
INSERT INTO truck_location (latitude, longitude, address, area, is_active) VALUES
(13.0418, 80.2341, 'Pondy Bazaar, T. Nagar, Chennai, Tamil Nadu 600017', 'T. Nagar', TRUE);

-- Truck Status
INSERT INTO truck_status (is_open, open_time, close_time, status_message) VALUES
(FALSE, '18:00:00', '23:00:00', 'We open at 6 PM daily! See you soon 🎉');

-- Admin User (password: Admin@123)
INSERT IGNORE INTO users (name, email, phone, password, is_verified, is_admin) VALUES
('Zing Bites Admin', 'krishkumar3380@gmail.com', '9876543210', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, TRUE);



