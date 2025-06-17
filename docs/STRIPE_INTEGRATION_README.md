# Stripe Payment Integration

This document outlines the Stripe payment integration implemented in the Force Dowels checkout system.

## Overview

The integration uses **Stripe Checkout** (hosted payment page) for secure payment processing. This approach provides:
- PCI compliance out of the box
- Support for multiple payment methods
- Built-in fraud protection
- Mobile-optimized payment experience
- Automatic receipt generation

## Architecture

### Frontend Flow
1. User fills out shipping/billing information
2. Clicks "Proceed to Payment" button
3. System creates Stripe Checkout session
4. User is redirected to Stripe's hosted checkout page
5. After payment, user is redirected back to success/cancel page
6. Success page verifies payment status and clears cart

### Backend Flow
1. `/api/stripe/create-checkout-session` creates payment session
2. Stripe processes payment on their servers
3. Stripe sends webhook to `/api/stripe/webhooks`
4. Webhook handler creates orders and sends confirmation email
5. `/api/stripe/session-status` verifies payment completion

## Files Created/Modified

### New Files
- `lib/stripe.ts` - Stripe configuration and utilities
- `app/api/stripe/create-checkout-session/route.ts` - Creates checkout sessions
- `app/api/stripe/webhooks/route.ts` - Handles Stripe webhooks
- `app/api/stripe/session-status/route.ts` - Verifies payment status
- `app/checkout/success/page.tsx` - Payment success page

### Modified Files
- `app/checkout/page.tsx` - Updated to use Stripe instead of manual card fields
- `lib/memory-db.ts` - Added payment status and Stripe session tracking
- `package.json` - Added Stripe dependency

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Stripe Keys (get from Stripe Dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URL (for redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install stripe
```

### 2. Stripe Account Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add the keys to your environment variables

### 3. Webhook Configuration
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Testing
Use Stripe's test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- More test cards: https://stripe.com/docs/testing

## Security Features

1. **PCI Compliance**: Payment data never touches your servers
2. **Webhook Verification**: All webhooks are cryptographically verified
3. **Environment Variables**: Sensitive keys stored securely
4. **HTTPS Required**: Stripe requires HTTPS in production
5. **Metadata Validation**: Order data is validated before processing

## Error Handling

The system handles various error scenarios:
- Payment failures (card declined, insufficient funds, etc.)
- Network timeouts
- Webhook delivery failures
- Invalid session IDs
- Authentication errors

## Production Considerations

1. **Replace Test Keys**: Use live Stripe keys in production
2. **HTTPS Required**: Stripe requires HTTPS for live mode
3. **Webhook Reliability**: Implement retry logic for failed webhooks
4. **Monitoring**: Set up alerts for payment failures
5. **Compliance**: Ensure your privacy policy covers payment processing

## Customization Options

### Payment Methods
Add more payment methods in the checkout session:
```typescript
payment_method_types: ['card', 'apple_pay', 'google_pay']
```

### Shipping Options
Configure shipping rates in Stripe Dashboard and enable:
```typescript
shipping_options: [
  {
    shipping_rate: 'shr_standard',
  },
]
```

### Tax Calculation
Enable automatic tax calculation:
```typescript
automatic_tax: {
  enabled: true,
}
```

## Troubleshooting

### Common Issues
1. **Webhook not receiving events**: Check endpoint URL and firewall settings
2. **Payment not completing**: Verify webhook secret and event handling
3. **Redirect issues**: Ensure success/cancel URLs are correct
4. **Test mode**: Make sure you're using test keys for development

### Debugging
- Check Stripe Dashboard logs for API calls
- Monitor webhook delivery attempts
- Use Stripe CLI for local webhook testing:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhooks
  ```

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test your integration: https://stripe.com/docs/testing
