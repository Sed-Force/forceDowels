import { NextRequest, NextResponse } from 'next/server'
import { updateOrdersPaymentStatusBySession, updateOrderPaymentStatus } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stripeSessionId, orderId, paymentStatus } = body

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'paymentStatus is required' },
        { status: 400 }
      )
    }

    if (!stripeSessionId && !orderId) {
      return NextResponse.json(
        { error: 'Either stripeSessionId or orderId is required' },
        { status: 400 }
      )
    }

    let result

    if (stripeSessionId) {
      console.log('Updating payment status for all orders in session:', stripeSessionId, 'to:', paymentStatus)
      result = await updateOrdersPaymentStatusBySession(stripeSessionId, paymentStatus)
    } else if (orderId) {
      console.log('Updating payment status for order:', orderId, 'to:', paymentStatus)
      result = await updateOrderPaymentStatus(orderId, paymentStatus)
    }

    return NextResponse.json({
      success: true,
      message: 'Order payment status updated successfully',
      data: result
    })

  } catch (error) {
    console.error('Error updating order payment status:', error)
    return NextResponse.json(
      { error: 'Failed to update order payment status', details: (error as Error).message },
      { status: 500 }
    )
  }
}
