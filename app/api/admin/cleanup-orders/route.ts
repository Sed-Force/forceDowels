import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting order cleanup...')

    // Get all orders grouped by stripe_session_id
    const duplicateCheck = await query(`
      SELECT stripe_session_id, COUNT(*) as count, array_agg(id ORDER BY created_at) as order_ids
      FROM orders 
      WHERE stripe_session_id IS NOT NULL
      GROUP BY stripe_session_id
      HAVING COUNT(*) > 2
    `)

    console.log('Found sessions with duplicates:', duplicateCheck.rows.length)

    let cleanedSessions = 0
    let deletedOrders = 0

    for (const row of duplicateCheck.rows) {
      const sessionId = row.stripe_session_id
      const orderIds = row.order_ids
      const count = parseInt(row.count)

      console.log(`Session ${sessionId} has ${count} orders:`, orderIds)

      // Keep only the first 2 orders (1 item + 1 summary), delete the rest
      const ordersToDelete = orderIds.slice(2) // Keep first 2, delete rest

      if (ordersToDelete.length > 0) {
        console.log(`Deleting duplicate orders for session ${sessionId}:`, ordersToDelete)
        
        const deleteResult = await query(`
          DELETE FROM orders 
          WHERE id = ANY($1::int[])
        `, [ordersToDelete])

        deletedOrders += deleteResult.rowCount || 0
        cleanedSessions++
      }
    }

    // Get final count
    const finalCount = await query('SELECT COUNT(*) as count FROM orders')

    return NextResponse.json({
      success: true,
      message: 'Order cleanup completed',
      data: {
        sessionsWithDuplicates: duplicateCheck.rows.length,
        sessionsCleaned: cleanedSessions,
        ordersDeleted: deletedOrders,
        finalOrderCount: parseInt(finalCount.rows[0].count)
      }
    })

  } catch (error) {
    console.error('❌ Order cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Just show duplicate analysis without deleting
    const duplicateCheck = await query(`
      SELECT 
        stripe_session_id, 
        COUNT(*) as count, 
        array_agg(id ORDER BY created_at) as order_ids,
        array_agg(tier ORDER BY created_at) as tiers,
        array_agg(payment_status ORDER BY created_at) as statuses
      FROM orders 
      WHERE stripe_session_id IS NOT NULL
      GROUP BY stripe_session_id
      ORDER BY COUNT(*) DESC
    `)

    const totalOrders = await query('SELECT COUNT(*) as count FROM orders')

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: parseInt(totalOrders.rows[0].count),
        sessionAnalysis: duplicateCheck.rows.map(row => ({
          sessionId: row.stripe_session_id,
          orderCount: parseInt(row.count),
          orderIds: row.order_ids,
          tiers: row.tiers,
          statuses: row.statuses,
          isDuplicate: parseInt(row.count) > 2
        }))
      }
    })

  } catch (error) {
    console.error('❌ Order analysis failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
