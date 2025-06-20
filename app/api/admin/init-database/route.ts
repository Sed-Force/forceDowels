import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { initializeOrdersTable } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database initialization via API...')

    // Test database connection first
    console.log('1. Testing database connection...')
    const connectionTest = await query('SELECT NOW() as current_time, version() as db_version')
    console.log('✅ Database connection successful!')

    // Initialize orders table
    console.log('2. Initializing orders table...')
    await initializeOrdersTable()
    console.log('✅ Orders table initialized!')

    // Verify table exists and get structure
    console.log('3. Verifying table structure...')
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)

    // Check indexes
    console.log('4. Checking indexes...')
    const indexes = await query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'orders' AND schemaname = 'public'
      ORDER BY indexname
    `)

    // Get current order count
    const orderCount = await query('SELECT COUNT(*) as count FROM orders')

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        connectionTime: connectionTest.rows[0].current_time,
        databaseVersion: connectionTest.rows[0].db_version.split(' ')[0],
        tableStructure: tableInfo.rows,
        indexes: indexes.rows.map(idx => idx.indexname),
        currentOrderCount: parseInt(orderCount.rows[0].count)
      }
    })

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Checking database status...')

    // Test connection
    const connectionTest = await query('SELECT NOW() as current_time')
    
    // Check if orders table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'orders'
    `)

    let orderCount = 0
    let tableStructure = []
    let indexes = []

    if (tableCheck.rows.length > 0) {
      // Get order count
      const countResult = await query('SELECT COUNT(*) as count FROM orders')
      orderCount = parseInt(countResult.rows[0].count)

      // Get table structure
      const structureResult = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'orders' AND table_schema = 'public'
        ORDER BY ordinal_position
      `)
      tableStructure = structureResult.rows

      // Get indexes
      const indexResult = await query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'orders' AND schemaname = 'public'
        ORDER BY indexname
      `)
      indexes = indexResult.rows.map(idx => idx.indexname)
    }

    return NextResponse.json({
      success: true,
      data: {
        connectionWorking: true,
        connectionTime: connectionTest.rows[0].current_time,
        ordersTableExists: tableCheck.rows.length > 0,
        currentOrderCount: orderCount,
        tableStructure,
        indexes,
        databaseReady: tableCheck.rows.length > 0
      }
    })

  } catch (error) {
    console.error('❌ Database status check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
