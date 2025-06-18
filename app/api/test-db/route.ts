import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { initializeOrdersTable } from '@/lib/orders'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic database connection
    const result = await query('SELECT NOW() as current_time')
    console.log('Database connection successful:', result.rows[0])
    
    // Test orders table initialization
    console.log('Initializing orders table...')
    await initializeOrdersTable()
    console.log('Orders table initialized successfully')
    
    // Test if table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'orders'
    `)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and orders table working',
      data: {
        currentTime: result.rows[0].current_time,
        ordersTableExists: tableCheck.rows.length > 0
      }
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
