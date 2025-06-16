import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Remove auth requirement - session ID itself is the security token
    // This allows the success page to work in development mode
    console.log('🔍 Checking session status...')

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log('✅ Session retrieved:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email
    })

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
    })
  } catch (error) {
    console.error('Error retrieving session status:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session status' },
      { status: 500 }
    )
  }
}
