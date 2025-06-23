import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting distributor cleanup via API (v2)...')

    // Check current data counts
    console.log('1. Checking current data...')
    
    const distributorCount = await query('SELECT COUNT(*) as count FROM distributors')
    const requestCount = await query('SELECT COUNT(*) as count FROM distribution_requests')
    
    console.log(`Current distributors: ${distributorCount.rows[0].count}`)
    console.log(`Current distribution requests: ${requestCount.rows[0].count}`)

    if (distributorCount.rows[0].count === '0' && requestCount.rows[0].count === '0') {
      return NextResponse.json({
        success: true,
        message: 'No distributor data found. Database is already clean!',
        data: {
          distributorsRemoved: 0,
          requestsRemoved: 0,
          finalDistributorCount: 0,
          finalRequestCount: 0
        }
      })
    }

    // Clean distributors table (delete all records)
    console.log('2. Cleaning distributors table...')
    const deletedDistributors = await query('DELETE FROM distributors')
    console.log(`Removed ${deletedDistributors.rowCount} distributors`)

    // Clean distribution_requests table (delete all records)
    console.log('3. Cleaning distribution_requests table...')
    const deletedRequests = await query('DELETE FROM distribution_requests')
    console.log(`Removed ${deletedRequests.rowCount} distribution requests`)

    // Reset auto-increment sequences
    console.log('4. Resetting ID sequences...')
    await query('ALTER SEQUENCE distributors_id_seq RESTART WITH 1')
    console.log('Reset distributors ID sequence')
    
    await query('ALTER SEQUENCE distribution_requests_id_seq RESTART WITH 1')
    console.log('Reset distribution_requests ID sequence')

    // Verify cleanup
    console.log('5. Verifying cleanup...')
    const finalDistributorCount = await query('SELECT COUNT(*) as count FROM distributors')
    const finalRequestCount = await query('SELECT COUNT(*) as count FROM distribution_requests')

    return NextResponse.json({
      success: true,
      message: 'Distributor data cleanup completed successfully',
      data: {
        distributorsRemoved: deletedDistributors.rowCount || 0,
        requestsRemoved: deletedRequests.rowCount || 0,
        finalDistributorCount: parseInt(finalDistributorCount.rows[0].count),
        finalRequestCount: parseInt(finalRequestCount.rows[0].count)
      }
    })

  } catch (error) {
    console.error('❌ Distributor cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Checking distributor data status...')

    // Get current counts
    const distributorCount = await query('SELECT COUNT(*) as count FROM distributors')
    const requestCount = await query('SELECT COUNT(*) as count FROM distribution_requests')

    // Get sample distributor data
    const sampleDistributors = await query(`
      SELECT id, business_name, contact_name, city, state, is_active 
      FROM distributors 
      ORDER BY created_at DESC 
      LIMIT 5
    `)

    // Get sample request data
    const sampleRequests = await query(`
      SELECT id, business_name, full_name, city, state, status 
      FROM distribution_requests 
      ORDER BY created_at DESC 
      LIMIT 5
    `)

    return NextResponse.json({
      success: true,
      data: {
        distributorCount: parseInt(distributorCount.rows[0].count),
        requestCount: parseInt(requestCount.rows[0].count),
        sampleDistributors: sampleDistributors.rows,
        sampleRequests: sampleRequests.rows,
        needsCleaning: parseInt(distributorCount.rows[0].count) > 0 || parseInt(requestCount.rows[0].count) > 0
      }
    })

  } catch (error) {
    console.error('❌ Distributor status check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
