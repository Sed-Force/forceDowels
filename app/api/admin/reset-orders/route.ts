import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Resetting orders table...')

    // Get current count
    const beforeCount = await query('SELECT COUNT(*) as count FROM orders')
    
    // Delete all orders
    const deleteResult = await query('DELETE FROM orders')
    
    // Reset the sequence
    await query('ALTER SEQUENCE orders_id_seq RESTART WITH 1')
    
    // Get final count
    const afterCount = await query('SELECT COUNT(*) as count FROM orders')

    return NextResponse.json({
      success: true,
      message: 'Orders table reset successfully',
      data: {
        ordersDeleted: parseInt(beforeCount.rows[0].count),
        finalOrderCount: parseInt(afterCount.rows[0].count)
      }
    })

  } catch (error) {
    console.error('❌ Order reset failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
