import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    // Remove auth requirement for config check since it doesn't expose sensitive data

    const config = {
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      stripeKeyType: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 
                    process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST' : 'UNKNOWN',
      environment: process.env.NODE_ENV,
    }

    const warnings = []
    if (!config.hasStripeSecretKey) warnings.push('Missing STRIPE_SECRET_KEY')
    if (!config.hasStripePublishableKey) warnings.push('Missing STRIPE_PUBLISHABLE_KEY')
    if (!config.hasWebhookSecret) warnings.push('Missing STRIPE_WEBHOOK_SECRET - Webhooks will not work')
    if (!config.hasBaseUrl) warnings.push('Missing NEXT_PUBLIC_BASE_URL')
    if (config.stripeKeyType === 'LIVE' && config.environment === 'development') {
      warnings.push('Using LIVE Stripe keys in development - be careful!')
    }

    return NextResponse.json({
      config,
      warnings,
      ready: warnings.length === 0 || (warnings.length === 1 && warnings[0].includes('WEBHOOK_SECRET'))
    })
  } catch (error) {
    console.error('Config check error:', error)
    return NextResponse.json({ error: 'Configuration check failed' }, { status: 500 })
  }
}
