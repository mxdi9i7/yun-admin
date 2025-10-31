-- ============================================
-- Comprehensive Database Schema Migration
-- Creates all tables for Customer, Product, Inventory, and Order Management
-- ============================================

-- Create Enums
-- ============================================

-- Order Status Enum
DO $$ BEGIN
  CREATE TYPE "Order Status" AS ENUM ('pending', 'fulfilled', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Product Type Enum
DO $$ BEGIN
  CREATE TYPE "Product Type" AS ENUM ('keys', 'tools', 'parts');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
-- Stores customer information and can be linked to orders
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
-- Stores basic product information
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type "Product Type",
  price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- ============================================
-- INVENTORY TABLE
-- ============================================
-- Stores inventory movements (additions and subtractions)
-- Positive quantities represent stock additions, negative quantities represent stock reductions
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT inventory_product_fkey FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes for inventory table
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);

-- ============================================
-- ORDERS TABLE
-- ============================================
-- Stores order information, linked to customers and inventory records
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer INTEGER NOT NULL,
  inventory INTEGER NOT NULL,
  status "Order Status" DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT orders_customer_fkey FOREIGN KEY (customer) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT orders_inventory_fkey FOREIGN KEY (inventory) REFERENCES inventory(id) ON DELETE CASCADE,
  CONSTRAINT orders_inventory_unique UNIQUE (inventory)
);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer);
CREATE INDEX IF NOT EXISTS idx_orders_inventory ON orders(inventory);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
-- Links products to orders with quantity and price information
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  "order" INTEGER NOT NULL,
  product INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_overwrite NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT order_items_order_fkey FOREIGN KEY ("order") REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_fkey FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items("order");
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE customers IS 'Stores customer information including contact details and notes';
COMMENT ON TABLE products IS 'Stores product catalog information including title, type, and base price';
COMMENT ON TABLE inventory IS 'Tracks inventory movements: positive quantities for additions, negative for reductions';
COMMENT ON TABLE orders IS 'Stores order information linked to customers and inventory records';
COMMENT ON TABLE order_items IS 'Links products to orders with quantity and price override capabilities';

COMMENT ON COLUMN inventory.quantity IS 'Positive values represent stock additions, negative values represent stock reductions';
COMMENT ON COLUMN order_items.price_overwrite IS 'Allows overriding product price at time of order';
COMMENT ON COLUMN orders.inventory IS 'One-to-one relationship with inventory table for tracking order-related inventory changes';

-- ============================================
-- SUMMARY OF TABLES CREATED
-- ============================================
-- 
-- This migration creates the following tables to support the three main features:
--
-- 1. CUSTOMER MANAGEMENT
--    - customers: Stores customer information (name, email, phone, address, notes)
--      * Links to orders via foreign key relationship
--      * Supports customer creation and management
--
-- 2. PRODUCT MANAGEMENT
--    - products: Stores basic product information (title, type, price)
--      * Product types: keys, tools, parts (enum)
--      * Base price information for products
--    - inventory: Tracks inventory movements for products
--      * Stores quantity changes (positive for additions, negative for reductions)
--      * Tracks cost price for inventory entries
--      * Links to products via foreign key
--      * Supports inventory history tracking
--
-- 3. ORDER MANAGEMENT
--    - orders: Stores order information
--      * Links to customers via foreign key (customer)
--      * Links to inventory via foreign key (inventory) - one-to-one relationship
--      * Order status tracking (pending, fulfilled, canceled)
--      * Notes field for additional order information
--    - order_items: Links products to orders
--      * Many-to-many relationship between orders and products
--      * Stores quantity and price override per item
--      * Allows multiple products per order
--
-- RELATIONSHIPS:
--   - customers (1) -> (N) orders
--   - products (1) -> (N) inventory
--   - products (1) -> (N) order_items
--   - orders (1) -> (1) inventory (one-to-one)
--   - orders (1) -> (N) order_items
--
-- ENUMS CREATED:
--   - "Order Status": pending, fulfilled, canceled
--   - "Product Type": keys, tools, parts
--
-- INDEXES:
--   - All foreign keys are indexed for optimal query performance
--   - Common search fields (name, email, phone, title, status, dates) are indexed
-- ============================================

