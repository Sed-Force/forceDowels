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

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'] // Expand payment intent to get more details
    })

    console.log('✅ Session retrieved:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      payment_intent_status: session.payment_intent?.status
    })

    // For ACH payments, check the payment intent status as well
    let effectivePaymentStatus = session.payment_status
    if (session.payment_intent && session.payment_intent.status) {
      const piStatus = session.payment_intent.status
      console.log('🏦 Payment intent status:', piStatus)

      if (piStatus === 'succeeded') {
        effectivePaymentStatus = 'paid'
      } else if (piStatus === 'processing') {
        effectivePaymentStatus = 'processing'
      } else if (piStatus === 'requires_payment_method') {
        effectivePaymentStatus = 'unpaid'
      } else if (piStatus === 'requires_confirmation' || piStatus === 'requires_action') {
        // ACH payments often start in these states
        effectivePaymentStatus = 'processing'
      }
    }

    // Special handling for ACH payments that are complete but unpaid
    // This is the normal state for ACH payments that have been initiated
    if (session.status === 'complete' && session.payment_status === 'unpaid') {
      // Check if this is an ACH payment by looking at payment method types
      const paymentMethodTypes = session.payment_method_types || []
      if (paymentMethodTypes.includes('us_bank_account')) {
        console.log('🏦 Detected ACH payment - session complete but payment unpaid (normal)')
        effectivePaymentStatus = 'ach_initiated'
      }
    }

    console.log('📊 Final payment status determination:', {
      original: session.payment_status,
      effective: effectivePaymentStatus,
      session_status: session.status,
      payment_intent_status: session.payment_intent?.status
    })

    return NextResponse.json({
      status: session.status,
      payment_status: effectivePaymentStatus,
      original_payment_status: session.payment_status,
      payment_intent_status: session.payment_intent?.status,
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
