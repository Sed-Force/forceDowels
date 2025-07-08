import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'

// Test endpoint without authentication - FOR DEVELOPMENT ONLY
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test checkout endpoint called')

    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Test endpoint not available in production' }, { status: 403 })
    }

    const body = await request.json()
    const { items, shippingInfo, billingInfo } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `Tier: ${item.tier}`,
        },
        unit_amount: formatAmountForStripe(item.pricePerUnit),
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session with test data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/test-stripe?canceled=true`,
      customer_email: 'test@example.com',
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true,
      },
      // Update customer addresses for better tax calculation
      customer_update: {
        address: 'auto', // Save billing address to customer
        shipping: 'auto', // Save shipping address to customer
      },
      metadata: {
        userId: 'test-user',
        userName: 'Test User',
        userEmail: 'test@example.com',
        shippingInfo: JSON.stringify(shippingInfo || {
          name: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          country: 'US'
        }),
        billingInfo: JSON.stringify(billingInfo || {
          name: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          country: 'US'
        }),
        cartItems: JSON.stringify(items),
        isTest: 'true'
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX'],
      },
      billing_address_collection: 'required',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating test checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
