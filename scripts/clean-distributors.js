#!/usr/bin/env node

/**
 * Clean Distributors Script
 *
 * This script removes all distributor data from the database while preserving table structure.
 * It cleans both the distributors and distribution_requests tables.
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

async function cleanDistributors() {
  console.log('🧹 Starting distributor data cleanup...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const connectionTest = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log(`   Time: ${connectionTest.rows[0].current_time}\n`);

    // Check current data counts
    console.log('2. Checking current data...');
    
    const distributorCount = await query('SELECT COUNT(*) as count FROM distributors');
    const requestCount = await query('SELECT COUNT(*) as count FROM distribution_requests');
    
    console.log(`   Current distributors: ${distributorCount.rows[0].count}`);
    console.log(`   Current distribution requests: ${requestCount.rows[0].count}\n`);

    if (distributorCount.rows[0].count === '0' && requestCount.rows[0].count === '0') {
      console.log('✅ No distributor data found. Database is already clean!');
      return;
    }

    // Clean distributors table (delete all records)
    console.log('3. Cleaning distributors table...');
    const deletedDistributors = await query('DELETE FROM distributors');
    console.log(`✅ Removed ${deletedDistributors.rowCount} distributors`);

    // Clean distribution_requests table (delete all records)
    console.log('\n4. Cleaning distribution_requests table...');
    const deletedRequests = await query('DELETE FROM distribution_requests');
    console.log(`✅ Removed ${deletedRequests.rowCount} distribution requests`);

    // Reset auto-increment sequences
    console.log('\n5. Resetting ID sequences...');
    await query('ALTER SEQUENCE distributors_id_seq RESTART WITH 1');
    console.log('✅ Reset distributors ID sequence');
    
    await query('ALTER SEQUENCE distribution_requests_id_seq RESTART WITH 1');
    console.log('✅ Reset distribution_requests ID sequence');

    // Verify cleanup
    console.log('\n6. Verifying cleanup...');
    const finalDistributorCount = await query('SELECT COUNT(*) as count FROM distributors');
    const finalRequestCount = await query('SELECT COUNT(*) as count FROM distribution_requests');
    
    console.log(`   Remaining distributors: ${finalDistributorCount.rows[0].count}`);
    console.log(`   Remaining distribution requests: ${finalRequestCount.rows[0].count}`);

    console.log('\n🎉 Distributor data cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Removed ${deletedDistributors.rowCount} distributors`);
    console.log(`   ✅ Removed ${deletedRequests.rowCount} distribution requests`);
    console.log('   ✅ Reset ID sequences');
    console.log('   ✅ Table structures preserved');
    console.log('   ✅ Database ready for new distributor applications');

  } catch (error) {
    console.error('\n❌ Distributor cleanup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log('\n📝 Please set your DATABASE_URL in your .env.local file');
  process.exit(1);
}

// Run the cleanup
cleanDistributors();
