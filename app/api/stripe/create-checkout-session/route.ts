import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Stripe API: Checking authentication...')

    // Get user first since currentUser() is working reliably
    const user = await currentUser()
    console.log('🔐 Stripe API: currentUser():', user ? 'found' : 'not found')

    if (!user) {
      console.error('❌ Stripe API: currentUser() returned null')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Use user.id as the userId since auth() is not working as expected
    const userId = user.id
    console.log('🔐 Stripe API: Using userId from user object:', userId)

    const body = await request.json()
    const { items, shippingInfo, billingInfo, shippingOption, orderTotal } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    console.log('✅ Stripe API: User authenticated successfully with userId:', userId)
    console.log('📦 Creating checkout session for order:', {
      itemCount: items.length,
      subtotal: orderTotal?.subtotal,
      shipping: orderTotal?.shipping,
      tax: orderTotal?.tax?.amount,
      total: orderTotal?.total,
      shippingOption,
      userEmail: user.emailAddresses?.[0]?.emailAddress
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

    // Add tax as a line item if there's tax
    if (orderTotal?.tax?.amount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            description: `Sales tax (${(orderTotal.tax.rate * 100).toFixed(1)}%)`,
          },
          unit_amount: formatAmountForStripe(orderTotal.tax.amount),
        },
        quantity: 1,
      })
    }

    // Get user email
    const userEmail = user.emailAddresses?.[0]?.emailAddress || ''

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        userName: user.firstName || user.username || userEmail.split('@')[0],
        userEmail: userEmail,
        shippingInfo: JSON.stringify(shippingInfo),
        billingInfo: JSON.stringify(billingInfo),
        cartItems: JSON.stringify(items),
        shippingOption: shippingOption || 'standard',
        subtotal: orderTotal?.subtotal?.toString() || '0',
        shippingCost: orderTotal?.shipping?.toString() || '0',
        taxAmount: orderTotal?.tax?.amount?.toString() || '0',
        taxRate: orderTotal?.tax?.rate?.toString() || '0',
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
