import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createOrder, initializeOrdersTable, updateOrdersPaymentStatusBySession, getOrdersByStripeSessionId } from '@/lib/orders'

// Initialize database tables on first run
let dbInitialized = false

export async function POST(request: NextRequest) {
  // Initialize database tables if not already done
  if (!dbInitialized) {
    try {
      await initializeOrdersTable()
      dbInitialized = true
      console.log('Database tables initialized for webhooks')
    } catch (error) {
      console.error('Failed to initialize database tables:', error)
      // Continue anyway - the error will be caught later if tables don't exist
    }
  }
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
  }

  // In development, webhook secret might not be set (using Stripe CLI or skipping webhooks)
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET is not set - webhook verification will be skipped in development')
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
  }

  let event

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Verify webhook signature in production
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } else {
      // In development without webhook secret, parse the body directly
      console.warn('Webhook signature verification skipped - development mode')
      event = JSON.parse(body)
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Checkout session completed for session:', session.id)
        console.log('Payment status:', session.payment_status)

        // For ACH payments, the session completes but payment might still be processing
        // We'll handle the actual payment completion in payment_intent.succeeded
        if (session.payment_status === 'paid') {
          // Card payments are immediately paid
          await handleSuccessfulPayment(session)
        } else if (session.payment_status === 'unpaid') {
          // ACH payments start as unpaid and will be updated via payment_intent events
          console.log('ACH payment initiated, waiting for payment_intent.succeeded event')
        }
        break

      case 'payment_intent.succeeded':
        // Handle successful ACH payments
        const paymentIntent = event.data.object
        console.log('Payment intent succeeded:', paymentIntent.id)

        // Retrieve the checkout session associated with this payment intent
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1
        })

        if (sessions.data.length > 0) {
          const associatedSession = sessions.data[0]
          console.log('Found associated session for payment intent:', associatedSession.id)
          await handleSuccessfulPayment(associatedSession)
        } else {
          console.warn('No checkout session found for payment intent:', paymentIntent.id)
        }
        break

      case 'payment_intent.processing':
        // ACH payments go through a processing state
        const processingPaymentIntent = event.data.object
        console.log('Payment intent processing (ACH):', processingPaymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Helper function to handle successful payments (both card and ACH)
async function handleSuccessfulPayment(session: any) {
  console.log('Processing successful payment for session:', session.id)

  // Check if orders already exist for this session to prevent duplicates
  const existingOrders = await getOrdersByStripeSessionId(session.id)
  if (existingOrders.length > 0) {
    console.log('Orders already exist for session:', session.id, '- skipping duplicate creation')
    // Just update payment status if orders exist but aren't paid yet
    const unpaidOrders = existingOrders.filter(order => order.paymentStatus !== 'paid')
    if (unpaidOrders.length > 0) {
      console.log('Updating existing orders to paid status...')
      await updateOrdersPaymentStatusBySession(session.id, 'paid')
    }
    return
  }

  // Extract metadata
  const metadata = session.metadata
  if (!metadata) {
    console.error('No metadata found in session')
    return
  }

  const userId = metadata.userId
  const userName = metadata.userName
  const userEmail = metadata.userEmail
  const isGuest = metadata.isGuest === 'true'
  const shippingInfo = JSON.parse(metadata.shippingInfo || '{}')
  const billingInfo = JSON.parse(metadata.billingInfo || '{}')
  const cartItems = JSON.parse(metadata.cartItems || '[]')

  // Extract order details from metadata and session
  const shippingOption = metadata.shippingOption || 'standard'
  const subtotal = parseFloat(metadata.subtotal || '0')
  const shippingCost = parseFloat(metadata.shippingCost || '0')

  // Get tax information from Stripe's automatic tax calculation
  const taxAmount = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0
  const orderTotal = session.amount_total ? session.amount_total / 100 : parseFloat(metadata.orderTotal || '0')

  console.log('💰 Tax calculation details:', {
    stripeTaxAmount: session.total_details?.amount_tax,
    calculatedTaxAmount: taxAmount,
    stripeTotal: session.amount_total,
    calculatedTotal: orderTotal,
    totalDetails: session.total_details
  })

  console.log('Creating single comprehensive order with details:', {
    itemCount: cartItems.length,
    totalQuantity: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
    subtotal,
    shippingCost,
    taxAmount,
    orderTotal,
    shippingOption,
    isGuest,
    userType: isGuest ? 'guest' : 'authenticated'
  })

  // Create one comprehensive order record with all details
  const order = await createOrder({
    userId: userId,
    userEmail: userEmail,
    userName: userName,
    quantity: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0), // Total dowels
    tier: cartItems.map(item => `${item.tier} (${item.quantity})`).join(', '), // All tiers with quantities
    totalPrice: orderTotal, // Full order total including shipping and tax
    shippingInfo: {
      ...shippingInfo,
      shippingOption: shippingOption,
      shippingCost: shippingCost
    },
    billingInfo: {
      ...billingInfo,
      orderDetails: {
        cartItems: cartItems,
        subtotal: subtotal,
        shippingCost: shippingCost,
        taxAmount: taxAmount,
        orderTotal: orderTotal,
        // Store Stripe's tax details for reference
        stripeTaxDetails: session.total_details
      }
    },
    paymentStatus: 'pending',
    stripeSessionId: session.id,
    isGuest: isGuest
  })

  console.log('Created comprehensive order:', order.id, 'with', order.quantity, 'total dowels')

  // Now update all orders for this session to 'paid' status
  // This will trigger the email sending automatically
  console.log('Updating orders to paid status and triggering emails...')
  await updateOrdersPaymentStatusBySession(session.id, 'paid')

  console.log('Orders processed successfully and emails triggered.')
}
