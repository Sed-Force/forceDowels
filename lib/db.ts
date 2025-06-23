import { Pool } from 'pg';

// Create a new pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon DB connections
  }
});

// Function to execute a query
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
}

// Check if tables exist
export async function checkTablesExist() {
  try {
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('orders', 'distributors', 'distribution_requests')
    `);
    return result.rows.length === 3; // All three tables should exist
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Initialize the database by creating tables if they don't exist
export async function initializeDatabase() {
  try {
    // Import and initialize orders table
    const { initializeOrdersTable } = await import('./orders');
    await initializeOrdersTable();

    // Import and initialize distribution tables
    const { initializeDistributionTables } = await import('./distribution');
    await initializeDistributionTables();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database', error);
    throw error;
  }
}

// Ensure database is initialized (safe to call multiple times)
export async function ensureDatabaseInitialized() {
  try {
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      console.log('Tables missing, initializing database...');
      await initializeDatabase();
    }
  } catch (error) {
    console.error('Error ensuring database initialization:', error);
    // Don't throw here to prevent breaking the app if DB init fails
  }
}
