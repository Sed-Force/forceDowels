#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database for the Force Dowels application.
 * It creates the necessary tables and indexes for handling orders.
 */

const { Pool } = require('pg');

// Create a new pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for hosted databases like Neon, Supabase, etc.
  } : false
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

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Orders table created');
    console.log('   ✅ All indexes created');
    console.log('   ✅ Ready to handle incoming orders');

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
