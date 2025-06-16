# Development Setup for Stripe Integration

## 🔧 Setting Up Development Environment

### Step 1: Get Your Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Switch to Test Mode** (toggle in left sidebar - should show "Test mode")
3. Go to **Developers → API Keys**
4. Copy your test keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Step 2: Update Your .env.local

Replace the placeholder keys in your `.env.local` file:

```env
# Replace these with your actual test keys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_TEST_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_TEST_KEY

# For development
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### Step 3: Test the Integration

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check configuration**:
   Visit: `http://localhost:3001/stripe-config`

3. **Test checkout**:
   - Add items to cart
   - Go to checkout
   - Use test card: `4242 4242 4242 4242`

## 🧪 Test Cards

Use these test cards for development:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 9987` | Lost card |

**Expiry**: Any future date  
**CVC**: Any 3 digits  
**ZIP**: Any valid ZIP code

## 🔄 Development vs Production

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

## 🚀 Switching to Production

When ready for production:

1. **Update .env.local**:
   ```env
   # Comment out test keys and uncomment live keys
   # STRIPE_SECRET_KEY=sk_test_...
   # STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
   
   NEXT_PUBLIC_BASE_URL=https://forcedowels.com
   ```

2. **Deploy to production**
3. **Test with small real transactions**

## 🛠️ Advanced Development Setup (Optional)

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
   stripe listen --forward-to localhost:3001/api/stripe/webhooks
   ```

4. **Copy the webhook secret** from the CLI output and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_cli_webhook_secret
   ```

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Using wrong keys or wrong environment
2. **Webhook not working**: Missing webhook secret or wrong URL
3. **Payment not completing**: Check browser console for errors

### Debug Steps

1. Check Stripe Dashboard logs
2. Check browser console
3. Check server logs
4. Verify environment variables are loaded

## 📋 Quick Checklist

- [ ] Switch to test mode in Stripe Dashboard
- [ ] Copy test keys to .env.local
- [ ] Set localhost URL in .env.local
- [ ] Restart development server
- [ ] Test with test card numbers
- [ ] Check configuration page shows "TEST" mode
