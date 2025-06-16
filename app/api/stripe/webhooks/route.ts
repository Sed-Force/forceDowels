import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createOrder } from '@/lib/memory-db'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

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
        console.log('Payment successful for session:', session.id)

        // Extract metadata
        const metadata = session.metadata
        if (!metadata) {
          console.error('No metadata found in session')
          break
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
