# Payment Integration

The Force Dowels application uses Stripe for secure payment processing, implementing Stripe Checkout for a seamless and PCI-compliant payment experience.

## Overview

The payment integration provides:
- **PCI Compliance** out of the box
- **Multiple Payment Methods** support
- **Built-in Fraud Protection**
- **Mobile-Optimized** payment experience
- **Automatic Receipt Generation**
- **Webhook-Based Order Processing**

## Architecture

### Payment Flow

#### Frontend Flow
1. User fills out shipping/billing information
2. Clicks "Proceed to Payment" button
3. System creates Stripe Checkout session
4. User is redirected to Stripe's hosted checkout page
5. After payment, user is redirected back to success/cancel page
6. Success page verifies payment status and clears cart

#### Backend Flow
1. `/api/stripe/create-checkout-session` creates payment session
2. Stripe processes payment on their servers
3. Stripe sends webhook to `/api/stripe/webhooks`
4. Webhook handler creates orders and sends confirmation email
5. `/api/stripe/session-status` verifies payment completion

## Implementation Files

### New Files Created
- `lib/stripe.ts` - Stripe configuration and utilities
- `app/api/stripe/create-checkout-session/route.ts` - Creates checkout sessions
- `app/api/stripe/webhooks/route.ts` - Handles Stripe webhooks
- `app/api/stripe/session-status/route.ts` - Verifies payment status
- `app/checkout/success/page.tsx` - Payment success page

### Modified Files
- `app/checkout/page.tsx` - Updated to use Stripe instead of manual card fields
- `lib/memory-db.ts` - Added payment status and Stripe session tracking
- `package.json` - Added Stripe dependency

## Environment Configuration

### Development (Test Mode)
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production (Live Mode)
```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://forcedowels.com
```

## Setup Instructions

### 1. Stripe Account Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add the keys to your environment variables

### 2. Webhook Configuration
1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Development Testing
Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Lost Card**: `4000 0000 0000 9987`

**Test Details:**
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any valid ZIP code

## Development vs Production

### Development Mode (Test Keys)
- ✅ No real money charged
- ✅ Use test cards
- ✅ Webhooks optional (can skip for basic testing)
- ✅ Safe to experiment

### Production Mode (Live Keys)
- ⚠️ Real money will be charged
- ⚠️ Webhooks required
- ⚠️ HTTPS required
- ⚠️ Use real payment methods only

## Security Features

### Built-in Security
1. **PCI Compliance**: Payment data never touches your servers
2. **Webhook Verification**: All webhooks are cryptographically verified
3. **Environment Variables**: Sensitive keys stored securely
4. **HTTPS Required**: Stripe requires HTTPS in production
5. **Metadata Validation**: Order data is validated before processing

### Best Practices
- Use environment-specific keys
- Verify webhook signatures
- Validate all payment data
- Monitor for suspicious activity
- Implement proper error handling

## Error Handling

The system handles various error scenarios:
- Payment failures (card declined, insufficient funds, etc.)
- Network timeouts
- Webhook delivery failures
- Invalid session IDs
- Authentication errors

### Error Response Examples
```typescript
// Payment declined
{
  error: "payment_failed",
  message: "Your card was declined.",
  code: "card_declined"
}

// Invalid session
{
  error: "invalid_session",
  message: "Payment session not found or expired."
}
```

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

## Advanced Development Setup

### Using Stripe CLI for Local Webhooks

If you want to test webhooks locally:

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

4. **Copy the webhook secret** from the CLI output and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_cli_webhook_secret
   ```

## Production Considerations

### Deployment Checklist
1. **Replace Test Keys**: Use live Stripe keys in production
2. **HTTPS Required**: Stripe requires HTTPS for live mode
3. **Webhook Reliability**: Implement retry logic for failed webhooks
4. **Monitoring**: Set up alerts for payment failures
5. **Compliance**: Ensure your privacy policy covers payment processing

### Monitoring & Analytics
- Monitor payment success rates
- Track failed payments and reasons
- Set up alerts for unusual activity
- Review Stripe Dashboard regularly

## Troubleshooting

### Common Issues

**Webhook not receiving events**
- Check endpoint URL and firewall settings
- Verify webhook secret matches
- Test webhook delivery in Stripe Dashboard

**Payment not completing**
- Verify webhook secret and event handling
- Check browser console for errors
- Review Stripe Dashboard logs

**Redirect issues**
- Ensure success/cancel URLs are correct
- Verify environment variables
- Check for HTTPS requirements

### Debugging Steps
1. Check Stripe Dashboard logs for API calls
2. Monitor webhook delivery attempts
3. Use browser developer tools
4. Test with Stripe CLI
5. Verify environment variables are loaded

### Debug Checklist
- [ ] Switch to test mode in Stripe Dashboard
- [ ] Copy test keys to .env.local
- [ ] Set localhost URL in .env.local
- [ ] Restart development server
- [ ] Test with test card numbers
- [ ] Check configuration page shows "TEST" mode

## API Reference

### Create Checkout Session
**Endpoint**: `POST /api/stripe/create-checkout-session`

**Request Body**:
```json
{
  "items": [
    {
      "name": "Force Dowels Kit",
      "price": 2999,
      "quantity": 1
    }
  ],
  "customerEmail": "customer@example.com"
}
```

### Session Status
**Endpoint**: `GET /api/stripe/session-status?session_id={session_id}`

**Response**:
```json
{
  "status": "complete",
  "customer_email": "customer@example.com",
  "payment_status": "paid"
}
```

## Support Resources

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Test Integration**: [stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Webhook Guide**: [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
