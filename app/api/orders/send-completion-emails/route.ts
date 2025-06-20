import { NextRequest, NextResponse } from 'next/server'
import { sendOrderCompletionEmails } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stripeSessionId } = body

    if (!stripeSessionId) {
      return NextResponse.json(
        { error: 'stripeSessionId is required' },
        { status: 400 }
      )
    }

    console.log('Manually triggering order completion emails for session:', stripeSessionId)
    
    await sendOrderCompletionEmails(stripeSessionId)
    
    return NextResponse.json({
      success: true,
      message: 'Order completion emails sent successfully'
    })

  } catch (error) {
    console.error('Error sending order completion emails:', error)
    return NextResponse.json(
      { error: 'Failed to send order completion emails', details: (error as Error).message },
      { status: 500 }
    )
  }
}
