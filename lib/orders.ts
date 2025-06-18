import { query } from './db'

export interface OrderData {
  userId: string
  userEmail: string
  userName: string
  quantity: number
  tier: string
  totalPrice: number
  shippingInfo: any
  billingInfo: any
  paymentStatus: string
  stripeSessionId: string
}

export interface Order extends OrderData {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Initialize orders table
export async function initializeOrdersTable() {
  try {
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
    `)
    
    // Create index on user_id for faster queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
    `)
    
    // Create index on stripe_session_id for webhook lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id)
    `)
    
    console.log('Orders table initialized successfully')
  } catch (error) {
    console.error('Error initializing orders table:', error)
    throw error
  }
}

// Create a new order
export async function createOrder(orderData: OrderData): Promise<Order> {
  try {
    const result = await query(`
      INSERT INTO orders (
        user_id, user_email, user_name, quantity, tier, total_price,
        shipping_info, billing_info, payment_status, stripe_session_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      orderData.userId,
      orderData.userEmail,
      orderData.userName,
      orderData.quantity,
      orderData.tier,
      orderData.totalPrice,
      JSON.stringify(orderData.shippingInfo),
      JSON.stringify(orderData.billingInfo),
      orderData.paymentStatus,
      orderData.stripeSessionId
    ])

    const row = result.rows[0]
    return {
      id: row.id.toString(),
      userId: row.user_id,
      userEmail: row.user_email,
      userName: row.user_name,
      quantity: row.quantity,
      tier: row.tier,
      totalPrice: parseFloat(row.total_price),
      shippingInfo: row.shipping_info,
      billingInfo: row.billing_info,
      paymentStatus: row.payment_status,
      stripeSessionId: row.stripe_session_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const result = await query('SELECT * FROM orders WHERE id = $1', [orderId])
    
    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id.toString(),
      userId: row.user_id,
      userEmail: row.user_email,
      userName: row.user_name,
      quantity: row.quantity,
      tier: row.tier,
      totalPrice: parseFloat(row.total_price),
      shippingInfo: row.shipping_info,
      billingInfo: row.billing_info,
      paymentStatus: row.payment_status,
      stripeSessionId: row.stripe_session_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  } catch (error) {
    console.error('Error getting order by ID:', error)
    throw error
  }
}

// Get orders by user ID
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    return result.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id,
      userEmail: row.user_email,
      userName: row.user_name,
      quantity: row.quantity,
      tier: row.tier,
      totalPrice: parseFloat(row.total_price),
      shippingInfo: row.shipping_info,
      billingInfo: row.billing_info,
      paymentStatus: row.payment_status,
      stripeSessionId: row.stripe_session_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  } catch (error) {
    console.error('Error getting orders by user ID:', error)
    throw error
  }
}

// Get orders by Stripe session ID
export async function getOrdersByStripeSessionId(sessionId: string): Promise<Order[]> {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE stripe_session_id = $1 ORDER BY created_at DESC',
      [sessionId]
    )

    return result.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id,
      userEmail: row.user_email,
      userName: row.user_name,
      quantity: row.quantity,
      tier: row.tier,
      totalPrice: parseFloat(row.total_price),
      shippingInfo: row.shipping_info,
      billingInfo: row.billing_info,
      paymentStatus: row.payment_status,
      stripeSessionId: row.stripe_session_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  } catch (error) {
    console.error('Error getting orders by Stripe session ID:', error)
    throw error
  }
}

// Update order payment status
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string
): Promise<Order | null> {
  try {
    const result = await query(`
      UPDATE orders 
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [paymentStatus, orderId])

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id.toString(),
      userId: row.user_id,
      userEmail: row.user_email,
      userName: row.user_name,
      quantity: row.quantity,
      tier: row.tier,
      totalPrice: parseFloat(row.total_price),
      shippingInfo: row.shipping_info,
      billingInfo: row.billing_info,
      paymentStatus: row.payment_status,
      stripeSessionId: row.stripe_session_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  } catch (error) {
    console.error('Error updating order payment status:', error)
    throw error
  }
}
