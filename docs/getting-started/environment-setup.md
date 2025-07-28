# Environment Setup Guide

This guide covers all environment variables and external service configurations needed for the Force Dowels application.

## Environment Variables Overview

The application uses environment variables for configuration. Create a `.env.local` file in your project root with the following variables:

## 🔐 Authentication (Clerk)

### Required Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Setup Instructions
1. Create account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable and secret keys
4. Configure redirect URLs in Clerk dashboard

### Clerk Dashboard Configuration
- **Allowed redirect URLs**: `http://localhost:3000`, `https://yourdomain.com`
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/`
- **After sign-up URL**: `/`

## 💳 Payment Processing (Stripe)

### Development (Test Mode)
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production (Live Mode)
```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Setup Instructions
1. Create account at [stripe.com](https://stripe.com)
2. Switch to **Test mode** for development
3. Go to **Developers → API Keys**
4. Copy publishable and secret keys
5. Set up webhooks (see webhook section below)

### Webhook Configuration
1. In Stripe Dashboard: **Developers → Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret

### Test Cards
Use these for development testing:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

## 📧 Email Service (Resend)

### Required Variables
```env
RESEND_API_KEY=re_...
```

### Setup Instructions
1. Create account at [resend.com](https://resend.com)
2. Generate API key
3. Verify your domain (optional for development)

### Email Configuration
The application sends emails for:
- Distributor applications
- Order confirmations
- Contact form submissions

Default sender: `Force Dowels <onboarding@resend.dev>`

## 📦 Shipping Services

### UPS API (Required)
```env
UPS_CLIENT_ID=your_ups_client_id
UPS_CLIENT_SECRET=your_ups_client_secret
```

### Setup Instructions
1. Create account at [developer.ups.com](https://developer.ups.com)
2. Create a new application
3. Select "Rating API"
4. Get Client ID and Client Secret

### TQL Freight (Optional - for large orders)
```env
NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY=your_subscription_key
TQL_CLIENT_ID=your_client_id
TQL_CLIENT_SECRET=your_client_secret
TQL_USERNAME=your_username
TQL_PASSWORD=your_password
TQL_BASE_URL=https://public.api.tql.com
```

## 🌐 Application Configuration

### Basic Configuration
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production Configuration
```env
NEXT_PUBLIC_BASE_URL=https://forcedowels.com
```

## 📁 Complete .env.local Template

```env
# ==============================================
# FORCE DOWELS ENVIRONMENT CONFIGURATION
# ==============================================

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Stripe Payment Processing (TEST MODE)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key

# UPS Shipping API
UPS_CLIENT_ID=your_ups_client_id
UPS_CLIENT_SECRET=your_ups_client_secret

# TQL Freight API (Optional - for large orders)
NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY=your_tql_subscription_key
TQL_CLIENT_ID=your_tql_client_id
TQL_CLIENT_SECRET=your_tql_client_secret
TQL_USERNAME=your_tql_username
TQL_PASSWORD=your_tql_password
TQL_BASE_URL=https://public.api.tql.com

# ==============================================
# PRODUCTION OVERRIDES (uncomment for production)
# ==============================================

# NEXT_PUBLIC_BASE_URL=https://forcedowels.com
# STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
# STRIPE_SECRET_KEY=sk_live_your_live_secret_key
# STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

## 🔄 Environment Switching

### Development to Production
1. Update `NEXT_PUBLIC_BASE_URL` to your domain
2. Switch Stripe keys from test to live
3. Update webhook endpoints in Stripe dashboard
4. Verify Clerk production settings

### Testing Environment Variables
Visit these URLs to verify configuration:
- `/stripe-config` - Check Stripe configuration
- `/sign-in` - Test Clerk authentication
- Browser console - Check for missing variables

## 🛡️ Security Best Practices

### Environment File Security
- Never commit `.env.local` to version control
- Use different keys for development/production
- Rotate keys regularly
- Restrict API key permissions

### Key Management
- Store production keys securely
- Use environment-specific keys
- Monitor key usage in service dashboards
- Set up alerts for unusual activity

## 🚨 Troubleshooting

### Common Issues

**Missing Environment Variables**
```
Error: Missing required environment variable: CLERK_SECRET_KEY
```
Solution: Ensure all required variables are set in `.env.local`

**Invalid API Keys**
```
Error: Invalid API key provided
```
Solution: Verify keys are correct and haven't expired

**Webhook Verification Failed**
```
Error: Webhook signature verification failed
```
Solution: Check webhook secret matches Stripe dashboard

### Verification Checklist
- [ ] All required variables are set
- [ ] API keys are valid and active
- [ ] Webhook endpoints are configured
- [ ] Development server restarted after changes
- [ ] No typos in variable names
- [ ] Correct environment (test vs live) keys

## 📞 Support

If you need help with environment setup:
- Check service documentation (Clerk, Stripe, Resend)
- Review error messages in browser console
- Contact support: cjmccann00@gmail.com
