# Getting Started with Force Dowels

Get Force Dowels up and running quickly! This guide covers everything from initial setup to development workflow.

## 📋 Prerequisites

### System Requirements
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm or yarn** - Package manager (npm comes with Node.js)
- **Git** - Version control system
- **Code Editor** - VS Code recommended with TypeScript extensions

### Required Accounts & API Keys
You'll need accounts and API keys from these services:

1. **Clerk** (Authentication) - [clerk.com](https://clerk.com)
2. **Stripe** (Payments) - [stripe.com](https://stripe.com)
3. **Resend** (Email) - [resend.com](https://resend.com)
4. **Neon** (Database) - [neon.tech](https://neon.tech) (recommended)

## 🚀 Quick Setup (5 Minutes)

### 1. Clone & Install
```bash
git clone https://github.com/cartermccann/forceDowels.git
cd force-dowel
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

**Minimum required variables for development:**
```env
# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database (get from Neon dashboard)
DATABASE_URL=postgresql://username:password@host/database

# Clerk Authentication (get from Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret

# Stripe Payments (get from Stripe dashboard - TEST MODE)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Service (get from Resend dashboard)
RESEND_API_KEY=re_your_resend_key
```

### 3. Initialize Database
```bash
npm run db:init
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🔧 Development Features

### Test Data
- **Stripe Test Cards**: Use `4242 4242 4242 4242` for testing payments
- **Clerk Auth**: Create test accounts directly in the app
- **Database**: Automatically initialized with required tables

### Available Routes
- `/` - Homepage with product showcase
- `/order` - Product ordering (requires auth)
- `/checkout` - Checkout process with Stripe integration
- `/videos` - Product demonstration videos
- `/distributor-application` - Become a distributor
- `/contact` - Contact form
- `/admin/database` - Database management (development only)

## 📚 Detailed Service Setup

### Clerk Authentication Setup
1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your keys from the API Keys section
4. Configure sign-in/sign-up pages in your Clerk dashboard

### Stripe Payment Setup
1. Go to [stripe.com](https://stripe.com) and create an account
2. **Switch to Test Mode** (toggle in left sidebar)
3. Go to **Developers → API Keys**
4. Copy your test keys (pk_test_... and sk_test_...)
5. Set up webhooks pointing to your local development server

### Resend Email Setup
1. Go to [resend.com](https://resend.com) and create an account
2. Generate an API key
3. Verify your domain (optional for development)

### Database Setup (Neon)
1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from your dashboard
4. The database will be automatically initialized when you run `npm run db:init`
- `/sign-in` - User authentication
- `/checkout` - Payment processing

## 🛠️ Key Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 📱 Testing the Application

### 1. Homepage
- Should load with Force Dowels branding
- Interactive product gallery
- Animated statistics and testimonials

### 2. Authentication
- Visit `/sign-in` to test Clerk integration
- Create a test account
- Verify protected routes work

### 3. E-commerce Flow
1. Browse products on homepage
2. Click "Order" (requires sign-in)
3. Add items to cart
4. Proceed to checkout
5. Use test card: `4242 4242 4242 4242`

### 4. Distributor Application
- Visit `/distributor-application`
- Fill out the comprehensive form
- Test email delivery

## 🎯 What's Working Out of the Box

✅ **Frontend**
- Responsive design
- Interactive components
- Smooth animations
- Mobile-friendly navigation

✅ **Authentication**
- Sign up/sign in flows
- Protected routes
- User sessions

✅ **E-commerce**
- Product showcase
- Shopping cart
- Stripe checkout integration

✅ **Business Features**
- Contact forms
- Distributor applications
- Email notifications

## 🔍 Configuration Check

Visit these URLs to verify setup:

- **Homepage**: `http://localhost:3000/` - Should load cleanly
- **Auth Check**: `http://localhost:3000/sign-in` - Clerk integration
- **Stripe Config**: `http://localhost:3000/stripe-config` - Payment setup
- **API Health**: Check browser console for errors

## 📚 Next Steps

Once you have the basic setup running:

1. **[Environment Setup](environment-setup.md)** - Configure all services
2. **[Development Guide](../development/development-guide.md)** - Learn the codebase
3. **[Feature Documentation](../features/)** - Understand each system
4. **[API Documentation](../api/)** - Explore the backend

## 🆘 Quick Troubleshooting

**App won't start?**
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for port conflicts

**Authentication not working?**
- Verify Clerk keys in `.env.local`
- Check Clerk dashboard configuration

**Payments failing?**
- Ensure Stripe test keys are set
- Use test card numbers only
- Check Stripe dashboard for errors

**Need help?** Check the [full troubleshooting guide](../development/troubleshooting.md) or contact support.

---

**🎉 You're ready to start developing with Force Dowels!**
