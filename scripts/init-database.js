#!/usr/bin/env node

/**
 * Database Initialization Script
 *
 * This script initializes the database for the Force Dowels application.
 * It creates the necessary tables and indexes for handling orders.
 */

// Load environment variables from .env.local (development) or use existing env vars (production)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

const { Pool } = require('pg');

// Create a new pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for hosted databases like Neon, Supabase, etc.
  }
});

async function query(text, params) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Error executing query', error);
    throw error;
  }
}

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const connectionTest = await query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Database connection successful!');
    console.log(`   Time: ${connectionTest.rows[0].current_time}`);
    console.log(`   Version: ${connectionTest.rows[0].db_version.split(' ')[0]}\n`);

    // Create orders table
    console.log('2. Creating orders table...');
    await query(`
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
      )
    `);
    console.log('✅ Orders table created successfully!\n');

    // Create indexes
    console.log('3. Creating database indexes...');
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
    `);
    console.log('✅ Index on user_id created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id)
    `);
    console.log('✅ Index on stripe_session_id created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)
    `);
    console.log('✅ Index on payment_status created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)
    `);
    console.log('✅ Index on created_at created\n');

    // Verify table structure
    console.log('4. Verifying table structure...');
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    console.log('✅ Orders table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Check indexes
    console.log('\n5. Verifying indexes...');
    const indexes = await query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'orders' AND schemaname = 'public'
      ORDER BY indexname
    `);

    console.log('✅ Available indexes:');
    indexes.rows.forEach(idx => {
      console.log(`   ${idx.indexname}`);
    });

    // Create distribution_requests table
    console.log('\n6. Creating distribution_requests table...');
    await query(`
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
      )
    `);
    console.log('✅ Distribution requests table created successfully!');

    // Create distributors table
    console.log('\n7. Creating distributors table...');
    await query(`
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
      )
    `);
    console.log('✅ Distributors table created successfully!');

    // Create distribution indexes
    console.log('\n8. Creating distribution indexes...');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_distribution_requests_unique_id ON distribution_requests(unique_id)
    `);
    console.log('✅ Index on distribution_requests.unique_id created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_distribution_requests_status ON distribution_requests(status)
    `);
    console.log('✅ Index on distribution_requests.status created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_distributors_location ON distributors(latitude, longitude)
    `);
    console.log('✅ Index on distributors location created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_distributors_active ON distributors(is_active)
    `);
    console.log('✅ Index on distributors.is_active created');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Orders table created');
    console.log('   ✅ Distribution requests table created');
    console.log('   ✅ Distributors table created');
    console.log('   ✅ All indexes created');
    console.log('   ✅ Ready to handle incoming orders and distribution requests');

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log('\n📝 Please set your DATABASE_URL in your .env.local file:');
  console.log('   DATABASE_URL=postgresql://username:password@host:port/database');
  console.log('\n💡 For local development, you can use:');
  console.log('   - PostgreSQL locally: postgresql://postgres:password@localhost:5432/force_dowels');
  console.log('   - Neon (cloud): Get from https://neon.tech');
  console.log('   - Supabase: Get from https://supabase.com');
  console.log('   - Railway: Get from https://railway.app');
  process.exit(1);
}

// Run the initialization
initializeDatabase();
