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

// Get orders by payment status
export async function getOrdersByPaymentStatus(paymentStatus: string): Promise<Order[]> {
  try {
    const result = await query('SELECT * FROM orders WHERE payment_status = $1 ORDER BY created_at DESC', [paymentStatus])

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
    console.error('Error getting orders by payment status:', error)
    throw error
  }
}



// Update order payment status and trigger email if paid
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
    const updatedOrder = {
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

    // If order is now marked as paid, trigger email sending
    if (paymentStatus === 'paid') {
      console.log('Order marked as paid, triggering email for order:', orderId)
      await sendOrderCompletionEmails(updatedOrder.stripeSessionId)
    }

    return updatedOrder
  } catch (error) {
    console.error('Error updating order payment status:', error)
    throw error
  }
}

// Update all orders for a Stripe session to paid status
export async function updateOrdersPaymentStatusBySession(
  stripeSessionId: string,
  paymentStatus: string
): Promise<Order[]> {
  try {
    const result = await query(`
      UPDATE orders
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE stripe_session_id = $2
      RETURNING *
    `, [paymentStatus, stripeSessionId])

    const updatedOrders = result.rows.map(row => ({
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

    // If orders are now marked as paid, trigger email sending
    if (paymentStatus === 'paid' && updatedOrders.length > 0) {
      console.log('Orders marked as paid, triggering emails for session:', stripeSessionId)
      await sendOrderCompletionEmails(stripeSessionId)
    }

    return updatedOrders
  } catch (error) {
    console.error('Error updating orders payment status by session:', error)
    throw error
  }
}

// Send order completion emails based on database order data
export async function sendOrderCompletionEmails(stripeSessionId: string): Promise<void> {
  try {
    console.log('Sending order completion emails for session:', stripeSessionId)

    // Get the order for this session (should be just one now)
    const orders = await getOrdersByStripeSessionId(stripeSessionId)

    if (orders.length === 0) {
      console.warn('No orders found for session:', stripeSessionId)
      return
    }

    // Get the single comprehensive order
    const order = orders[0] // Should only be one order now

    // Extract order details from the billing info where we stored them
    const orderDetails = order.billingInfo.orderDetails
    if (!orderDetails) {
      console.warn('No order details found in billing info for session:', stripeSessionId)
      return
    }

    // Prepare email data - consolidate all items into one line item
    const totalQuantity = orderDetails.cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const totalItemPrice = orderDetails.cartItems.reduce((sum: number, item: any) => sum + (item.quantity * item.pricePerUnit), 0)

    // Create tier description showing all tiers and quantities
    const tierDescription = orderDetails.cartItems.length > 1
      ? orderDetails.cartItems.map((item: any) => `${item.tier} (${item.quantity.toLocaleString()})`).join(', ')
      : orderDetails.cartItems[0].tier

    // Create single consolidated order item
    const orderItems = [{
      name: 'Force Dowels',
      quantity: totalQuantity,
      tier: tierDescription,
      pricePerUnit: totalItemPrice / totalQuantity // Average price per unit
    }]

    const shippingInfo = order.shippingInfo
    const billingInfo = order.billingInfo
    const subtotal = orderDetails.subtotal
    const shippingCost = orderDetails.shippingCost
    const taxAmount = orderDetails.taxAmount
    const shippingOption = shippingInfo.shippingOption || 'Standard'

    // Send customer confirmation email
    try {
      console.log('Sending customer confirmation email to:', order.userEmail)

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItems,
          subtotal,
          shippingCost,
          shippingOption,
          taxAmount,
          taxRate: orderDetails.taxRate || 0,
          totalPrice: order.totalPrice,
          shippingInfo,
          billingInfo,
          userEmail: order.userEmail,
          userName: order.userName,
          stripeSessionId: order.stripeSessionId,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!emailResponse.ok) {
        console.warn('Failed to send customer confirmation email, status:', emailResponse.status)
        const errorText = await emailResponse.text()
        console.warn('Customer email error response:', errorText)
      } else {
        console.log('Customer confirmation email sent successfully')
      }
    } catch (emailError) {
      console.warn('Error sending customer confirmation email:', emailError)
    }

    // Add delay between emails to help with rate limiting
    await new Promise(resolve => setTimeout(resolve, 700))

    // Send admin notification email
    try {
      console.log('Sending admin notification email for order from:', order.userEmail)

      // Create AbortController for timeout
      const adminController = new AbortController()
      const adminTimeoutId = setTimeout(() => adminController.abort(), 30000) // 30 second timeout

      const adminEmailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-admin-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: order.userName,
          customerEmail: order.userEmail,
          orderItems,
          subtotal,
          shippingCost,
          shippingOption,
          taxAmount,
          totalPrice: order.totalPrice,
          shippingInfo,
          billingInfo,
          stripeSessionId: order.stripeSessionId,
        }),
        signal: adminController.signal,
      })

      clearTimeout(adminTimeoutId)

      if (!adminEmailResponse.ok) {
        console.warn('Failed to send admin notification email, status:', adminEmailResponse.status)
        const errorText = await adminEmailResponse.text()
        console.warn('Admin email error response:', errorText)
      } else {
        console.log('Admin notification email sent successfully')
      }
    } catch (adminEmailError) {
      console.warn('Error sending admin notification email:', adminEmailError)
    }

  } catch (error) {
    console.error('Error sending order completion emails:', error)
    // Don't throw - we don't want email failures to break order processing
  }
}
