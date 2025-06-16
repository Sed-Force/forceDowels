import { NextRequest, NextResponse } from 'next/server'
import { sendAdminOrderNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      customerEmail,
      orderItems,
      subtotal,
      shippingCost,
      shippingOption,
      taxAmount,
      totalPrice,
      shippingInfo,
      billingInfo,
      stripeSessionId,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !orderItems || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Sending admin notification for order:', {
      customerName,
      customerEmail,
      itemCount: orderItems.length,
      totalPrice,
      stripeSessionId,
    })

    // Send the admin notification email
    const result = await sendAdminOrderNotification({
      customerName,
      customerEmail,
      orderItems,
      subtotal: subtotal || 0,
      shippingCost: shippingCost || 0,
      shippingOption: shippingOption || 'standard',
      taxAmount: taxAmount || 0,
      totalPrice,
      shippingInfo: shippingInfo || {},
      billingInfo: billingInfo || {},
      stripeSessionId: stripeSessionId || '',
    })

    if (!result.success) {
      console.error('Failed to send admin notification:', result.error)
      return NextResponse.json(
        { error: 'Failed to send admin notification', details: result.error },
        { status: 500 }
      )
    }

    console.log('Admin notification sent successfully')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in admin notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
