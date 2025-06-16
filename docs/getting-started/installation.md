# Installation Guide

This guide will walk you through setting up the Force Dowels application on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js 18.0 or higher** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** - [Download Git](https://git-scm.com/)

### Required Accounts

You'll need accounts with the following services:

- **Stripe** - For payment processing ([stripe.com](https://stripe.com))
- **Clerk** - For authentication ([clerk.com](https://clerk.com))
- **Resend** - For email delivery ([resend.com](https://resend.com))

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cartermccann/forceDowels.git
cd force-dowel
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create your environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and configuration:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Stripe Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Verification

To verify your installation is working correctly:

1. **Visit the homepage** - Should load without errors
2. **Check authentication** - Try accessing `/sign-in`
3. **Test configuration** - Visit `/stripe-config` to verify Stripe setup
4. **Check console** - No error messages should appear

## Next Steps

- [Environment Setup Guide](environment-setup.md) - Detailed configuration
- [Quick Start Guide](quick-start.md) - Get up and running quickly
- [Development Guide](../development/development-guide.md) - Development workflow

## Troubleshooting

### Common Issues

**Node.js Version Error**
```
Error: Node.js version 16.x is not supported
```
Solution: Upgrade to Node.js 18 or higher.

**Missing Environment Variables**
```
Error: Missing required environment variable
```
Solution: Ensure all required variables are set in `.env.local`.

**Port Already in Use**
```
Error: Port 3000 is already in use
```
Solution: Use a different port:
```bash
npm run dev -- -p 3001
```

### Getting Help

If you encounter issues:
1. Check the [Troubleshooting Guide](../development/troubleshooting.md)
2. Review the error messages carefully
3. Ensure all prerequisites are met
4. Contact support at cjmccann00@gmail.com
