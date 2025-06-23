#!/usr/bin/env node

/**
 * Database State Checker
 *
 * This script checks the current state of all tables in the database
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
    return res;
  } catch (error) {
    console.error('❌ Error executing query', error);
    throw error;
  }
}

async function checkDatabaseState() {
  console.log('🔍 Checking database state...\n');

  try {
    // Test database connection
    console.log('1. Database Connection:');
    const connectionTest = await query('SELECT NOW() as current_time, current_database() as db_name');
    console.log(`   ✅ Connected to: ${connectionTest.rows[0].db_name}`);
    console.log(`   ✅ Time: ${connectionTest.rows[0].current_time}`);
    console.log(`   ✅ DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);

    // Check all tables
    console.log('\n2. Table Existence:');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   Found ${tables.rows.length} tables:`);
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Check distributors table
    console.log('\n3. Distributors Table:');
    try {
      const distributorCount = await query('SELECT COUNT(*) as count FROM distributors');
      console.log(`   ✅ Count: ${distributorCount.rows[0].count}`);
      
      if (distributorCount.rows[0].count > 0) {
        const distributors = await query('SELECT id, business_name, is_active FROM distributors LIMIT 5');
        console.log('   📋 Sample records:');
        distributors.rows.forEach(dist => {
          console.log(`      - ID: ${dist.id}, Name: ${dist.business_name}, Active: ${dist.is_active}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Check distribution_requests table
    console.log('\n4. Distribution Requests Table:');
    try {
      const requestCount = await query('SELECT COUNT(*) as count FROM distribution_requests');
      console.log(`   ✅ Count: ${requestCount.rows[0].count}`);
      
      if (requestCount.rows[0].count > 0) {
        const requests = await query('SELECT id, business_name, status FROM distribution_requests LIMIT 5');
        console.log('   📋 Sample records:');
        requests.rows.forEach(req => {
          console.log(`      - ID: ${req.id}, Name: ${req.business_name}, Status: ${req.status}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Check orders table
    console.log('\n5. Orders Table:');
    try {
      const orderCount = await query('SELECT COUNT(*) as count FROM orders');
      console.log(`   ✅ Count: ${orderCount.rows[0].count}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n✅ Database state check completed!');

  } catch (error) {
    console.error('\n❌ Database state check failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

// Run the check
checkDatabaseState();
