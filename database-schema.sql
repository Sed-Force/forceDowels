-- Force Dowels Database Schema
-- Complete schema for orders, distribution requests, and distributors

-- =====================================================
-- 1. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  tier VARCHAR(100) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  shipping_info JSONB NOT NULL,
  billing_info JSONB NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. DISTRIBUTION REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS distribution_requests (
  id SERIAL PRIMARY KEY,
  unique_id UUID UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  website VARCHAR(500),
  business_type VARCHAR(100) NOT NULL,
  business_type_other VARCHAR(255),
  years_in_business VARCHAR(50) NOT NULL,
  territory TEXT NOT NULL,
  purchase_volume VARCHAR(100) NOT NULL,
  sells_similar_products VARCHAR(10) NOT NULL,
  similar_products_details TEXT,
  hear_about_us VARCHAR(100) NOT NULL,
  hear_about_us_other VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. DISTRIBUTORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS distributors (
  id SERIAL PRIMARY KEY,
  distribution_request_id INTEGER REFERENCES distribution_requests(id),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  website VARCHAR(500),
  business_type VARCHAR(100) NOT NULL,
  territory TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. PERFORMANCE INDEXES
-- =====================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Distribution requests indexes
CREATE INDEX IF NOT EXISTS idx_distribution_requests_unique_id ON distribution_requests(unique_id);
CREATE INDEX IF NOT EXISTS idx_distribution_requests_status ON distribution_requests(status);

-- Distributors indexes
CREATE INDEX IF NOT EXISTS idx_distributors_location ON distributors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_distributors_active ON distributors(is_active);

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check table row counts (should all be 0 for new database)
SELECT 
  'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 
  'distribution_requests' as table_name, COUNT(*) as row_count FROM distribution_requests
UNION ALL
SELECT 
  'distributors' as table_name, COUNT(*) as row_count FROM distributors;

-- Check indexes
SELECT 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
