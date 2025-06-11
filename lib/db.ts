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

// Initialize the database by creating tables if they don't exist
export async function initializeDatabase() {
  try {
    // Create orders table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT,
        user_name TEXT,
        quantity INTEGER NOT NULL,
        tier TEXT NOT NULL,
        total_price DECIMAL(10, 2),
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database', error);
    throw error;
  }
}

// Function to create a new order
export async function createOrder(orderData: {
  userId: string;
  userEmail?: string;
  userName?: string;
  quantity: number;
  tier: string;
  totalPrice?: number;
}) {
  const { userId, userEmail, userName, quantity, tier, totalPrice } = orderData;
  
  try {
    const result = await query(
      `INSERT INTO orders (user_id, user_email, user_name, quantity, tier, total_price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, userEmail, userName, quantity, tier, totalPrice || 0]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating order', error);
    throw error;
  }
}

// Function to get orders for a specific user
export async function getOrdersByUserId(userId: string) {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting orders', error);
    throw error;
  }
}
