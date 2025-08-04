import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Stripe API: Processing checkout session...')

    const body = await request.json()
    const { items, shippingInfo, billingInfo, shippingOption, orderTotal, guestInfo } = body

    // Check if this is a guest checkout or authenticated user
    const user = await currentUser()
    const isGuestCheckout = !user && guestInfo

    let userId: string
    let userEmail: string
    let userName: string

    if (isGuestCheckout) {
      // Guest checkout - use provided guest information
      userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      userEmail = guestInfo.email
      userName = guestInfo.name
      console.log('🔐 Stripe API: Guest checkout detected:', { userId, userEmail, userName })
    } else if (user) {
      // Authenticated user
      userId = user.id
      userEmail = user.emailAddresses?.[0]?.emailAddress || ''
      userName = user.firstName || user.username || userEmail.split('@')[0]
      console.log('🔐 Stripe API: Authenticated user:', { userId, userEmail, userName })
    } else {
      console.error('❌ Stripe API: No user or guest info provided')
      return NextResponse.json({ error: 'User authentication or guest information required' }, { status: 401 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    console.log('✅ Stripe API: Processing checkout session for:', isGuestCheckout ? 'guest user' : 'authenticated user')
    console.log('📦 Creating checkout session for order:', {
      itemCount: items.length,
      subtotal: orderTotal?.subtotal,
      shipping: orderTotal?.shipping,
      tax: orderTotal?.tax?.amount,
      total: orderTotal?.total,
      shippingOption,
      userEmail,
      isGuest: isGuestCheckout
    })

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

    // Add shipping as a line item if there's a cost
    if (orderTotal?.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: `${shippingOption} shipping`,
          },
          unit_amount: formatAmountForStripe(orderTotal.shipping),
        },
        quantity: 1,
      })
    }

    // Note: Tax is now handled automatically by Stripe, so we don't add it as a line item

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'], // Add us_bank_account for ACH
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout?canceled=true`,
      customer_email: userEmail,
      // Enable automatic tax calculation
      // Stripe will calculate tax based on shipping address (if collected) or billing address
      automatic_tax: {
        enabled: true,
      },
      // ACH-specific configuration
      payment_method_options: {
        us_bank_account: {
          verification_method: 'automatic', // Use automatic verification for better UX
        },
      },
      metadata: {
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        isGuest: isGuestCheckout.toString(),
        shippingInfo: JSON.stringify(shippingInfo),
        billingInfo: JSON.stringify(billingInfo),
        cartItems: JSON.stringify(items),
        shippingOption: shippingOption || 'standard',
        subtotal: orderTotal?.subtotal?.toString() || '0',
        shippingCost: orderTotal?.shipping?.toString() || '0',
        // Remove manual tax fields since Stripe will calculate automatically
        orderTotal: orderTotal?.total?.toString() || '0',
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX'],
      },
      billing_address_collection: 'required',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
