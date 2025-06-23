import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing order creation...')

    // Create a test order
    const testOrder = await createOrder({
      userId: 'test-user-123',
      userEmail: 'test@example.com',
      userName: 'Test User',
      quantity: 100,
      tier: 'Test Tier',
      totalPrice: 99.99,
      shippingInfo: { test: 'shipping data' },
      billingInfo: { test: 'billing data' },
      paymentStatus: 'paid',
      stripeSessionId: 'test-session-' + Date.now()
    })

    console.log('✅ Test order created successfully:', testOrder.id)

    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      orderId: testOrder.id,
      data: testOrder
    })

  } catch (error) {
    console.error('❌ Test order creation failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database connection...')
    
    // Import query function to test connection
    const { query } = await import('@/lib/db')
    
    // Test basic connection
    const result = await query('SELECT NOW() as current_time, COUNT(*) as order_count FROM orders')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      data: {
        currentTime: result.rows[0].current_time,
        orderCount: result.rows[0].order_count,
        databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...'
      }
    })

  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
