import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createOrder } from '@/lib/memory-db'

export async function POST(request: NextRequest) {
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

  // Extract metadata
  const metadata = session.metadata
  if (!metadata) {
    console.error('No metadata found in session')
    return
  }

  const userId = metadata.userId
  const userName = metadata.userName
  const userEmail = metadata.userEmail
  const shippingInfo = JSON.parse(metadata.shippingInfo || '{}')
  const billingInfo = JSON.parse(metadata.billingInfo || '{}')
  const cartItems = JSON.parse(metadata.cartItems || '[]')

  // Extract order details from metadata
  const shippingOption = metadata.shippingOption || 'standard'
  const subtotal = parseFloat(metadata.subtotal || '0')
  const shippingCost = parseFloat(metadata.shippingCost || '0')
  const taxAmount = parseFloat(metadata.taxAmount || '0')
  const taxRate = parseFloat(metadata.taxRate || '0')
  const orderTotal = parseFloat(metadata.orderTotal || '0')

  console.log('Creating orders with details:', {
    itemCount: cartItems.length,
    subtotal,
    shippingCost,
    taxAmount,
    orderTotal,
    shippingOption
  })

  // Create orders for each cart item
  for (const item of cartItems) {
    const order = await createOrder({
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      quantity: item.quantity,
      tier: item.tier,
      totalPrice: item.quantity * item.pricePerUnit,
      shippingInfo: shippingInfo,
      billingInfo: billingInfo,
      paymentStatus: 'paid',
      stripeSessionId: session.id,
    })

    console.log('Created order:', order.id, 'for item:', item.name)
  }

  // Create a summary order record with totals
  const summaryOrder = await createOrder({
    userId: userId,
    userEmail: userEmail,
    userName: userName,
    quantity: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
    tier: 'ORDER_SUMMARY',
    totalPrice: orderTotal,
    shippingInfo: {
      ...shippingInfo,
      shippingOption: shippingOption,
      shippingCost: shippingCost
    },
    billingInfo: billingInfo,
    paymentStatus: 'paid',
    stripeSessionId: session.id,
  })

  console.log('Created summary order:', summaryOrder.id)

  // Send confirmation email with complete order details
  try {
    console.log('Sending order confirmation email to:', userEmail)

    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderItems: cartItems,
        subtotal: subtotal,
        shippingCost: shippingCost,
        shippingOption: shippingOption,
        taxAmount: taxAmount,
        taxRate: taxRate,
        totalPrice: orderTotal,
        shippingInfo: shippingInfo,
        billingInfo: billingInfo,
        userEmail: userEmail,
        userName: userName,
        stripeSessionId: session.id,
      }),
    })

    if (!emailResponse.ok) {
      console.warn('Failed to send order confirmation email, status:', emailResponse.status)
      const errorText = await emailResponse.text()
      console.warn('Email error response:', errorText)
    } else {
      console.log('Order confirmation email sent successfully')
    }
  } catch (emailError) {
    console.warn('Error sending confirmation email:', emailError)
  }

  // Send admin notification email
  try {
    console.log('Sending admin notification email for order from:', userEmail)

    const adminEmailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-admin-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: userName,
        customerEmail: userEmail,
        orderItems: cartItems,
        subtotal: subtotal,
        shippingCost: shippingCost,
        shippingOption: shippingOption,
        taxAmount: taxAmount,
        totalPrice: orderTotal,
        shippingInfo: shippingInfo,
        billingInfo: billingInfo,
        stripeSessionId: session.id,
      }),
    })

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
}
