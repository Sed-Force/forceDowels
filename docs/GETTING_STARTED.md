# Getting Started with Force Dowels

This comprehensive guide will help new developers set up the Force Dowels application from scratch and understand the development workflow.

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
5. **GitHub** (Version Control) - [github.com](https://github.com)

## 🚀 Quick Setup (5 Minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/cartermccann/forceDowels.git
cd force-dowel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys (see detailed setup below):
```env
# Minimum required for development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_test_key
STRIPE_SECRET_KEY=your_stripe_test_secret
RESEND_API_KEY=your_resend_key
```

### 4. Database Setup
```bash
npm run db:init
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🔧 Detailed Setup Instructions

### Step 1: Database Setup (Neon)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub (recommended)
   - Create a new project named "force-dowels"

2. **Get Connection String**
   - In your Neon dashboard, go to "Connection Details"
   - Copy the connection string
   - It looks like: `postgresql://username:password@host.neon.tech/database?sslmode=require`

3. **Add to Environment**
   ```env
   DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require
   ```

### Step 2: Authentication Setup (Clerk)

1. **Create Clerk Application**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application
   - Choose "Next.js" as the framework

2. **Configure Settings**
   - **Application Name**: Force Dowels
   - **Sign-in Options**: Email + Social (Google, GitHub recommended)
   - **Redirect URLs**: 
     - Development: `http://localhost:3000`
     - Production: `https://forcedowels.com`

3. **Get API Keys**
   - Copy the Publishable Key and Secret Key
   - Add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
   ```

### Step 3: Payment Setup (Stripe)

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Create account and verify business details
   - Switch to **Test Mode** for development

2. **Get API Keys**
   - Go to Developers → API Keys
   - Copy Publishable and Secret keys
   - Add to `.env.local`:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. **Setup Webhooks** (for production)
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy webhook secret:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Step 4: Email Setup (Resend)

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up and verify email

2. **Generate API Key**
   - Go to API Keys section
   - Create new API key
   - Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_...
   ```

3. **Domain Verification** (optional for development)
   - For production, verify your domain
   - Development works with default sender

## 🗄️ Database Initialization

### Automatic Setup
```bash
npm run db:init
```

This creates all required tables:
- `orders` - Customer orders and payments
- `distribution_requests` - Distributor applications
- `distributors` - Approved distributors

### Manual Verification
1. Start the development server: `npm run dev`
2. Visit: `http://localhost:3000/admin/database`
3. Check that all tables are created successfully

### Database Schema Overview
- **Orders Table**: Stores customer purchases with Stripe integration
- **Distribution Requests**: Manages distributor applications with unique IDs
- **Distributors**: Approved distributors for the find-a-distributor map

## 🧪 Testing Your Setup

### 1. Homepage Test
- Visit `http://localhost:3000`
- Should load with Force Dowels branding
- Interactive product gallery should work
- Navigation should be responsive

### 2. Authentication Test
- Visit `http://localhost:3000/sign-in`
- Create a test account
- Verify sign-in/sign-out works
- Check protected routes redirect properly

### 3. E-commerce Test
1. Sign in to your test account
2. Visit the order page
3. Add items to cart
4. Proceed to checkout
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete payment
7. Verify order confirmation

### 4. Distribution System Test
1. Visit `http://localhost:3000/distributor-application`
2. Fill out the application form
3. Submit application
4. Check email for notifications
5. Test accept/decline workflow

## 🔍 Development Workflow

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:init      # Initialize database
npm run env:check    # Check environment variables
```

### Key Development URLs
- **Homepage**: `http://localhost:3000/`
- **Admin Dashboard**: `http://localhost:3000/admin/database`
- **Stripe Config**: `http://localhost:3000/stripe-config`
- **API Health**: Check browser console for errors

### File Structure Overview
```
app/
├── (auth)/              # Authentication pages
├── admin/               # Admin dashboard
├── api/                 # API endpoints
├── cart/                # Shopping cart
├── checkout/            # Payment processing
├── distribution/        # Distribution management
├── distributor-application/  # Distributor signup
├── find-a-distributor/  # Distributor locator
└── orders/              # Order management

components/              # Reusable UI components
├── ui/                  # shadcn/ui components
├── email-templates/     # Email templates
└── [feature-components] # Feature-specific components

lib/                     # Utility functions
├── db.ts               # Database connection
├── stripe.ts           # Stripe integration
├── email.ts            # Email utilities
└── distribution.ts     # Distribution logic
```

## 🚨 Common Issues & Solutions

### Environment Variables
**Issue**: Missing environment variable errors
**Solution**: Ensure all required variables are set in `.env.local`

### Database Connection
**Issue**: Database connection failed
**Solution**: Check DATABASE_URL format and network connectivity

### Authentication Issues
**Issue**: Clerk authentication not working
**Solution**: Verify Clerk keys and domain configuration

### Payment Issues
**Issue**: Stripe payments failing
**Solution**: Ensure test mode is enabled and use test card numbers

### Email Delivery
**Issue**: Emails not sending
**Solution**: Verify Resend API key and check rate limits

## 📚 Next Steps

Once your development environment is running:

1. **Explore the Codebase** - Review the file structure and key components
2. **Read Feature Documentation** - Understand each system in detail
3. **Run Tests** - Execute the test suite to verify functionality
4. **Make Your First Change** - Try modifying a component or adding a feature
5. **Deploy to Staging** - Set up a staging environment on Vercel

## 🆘 Getting Help

### Documentation Resources
- [Project Overview](PROJECT_OVERVIEW.md) - Architecture and features
- [Distribution System](features/distributor-system.md) - Distribution workflow
- [API Documentation](api/api-overview.md) - API endpoints and usage
- [Troubleshooting Guide](development/troubleshooting.md) - Common issues

### Support Channels
- **GitHub Issues** - Bug reports and feature requests
- **Email Support** - cjmccann00@gmail.com
- **Documentation Issues** - Create GitHub issue with "documentation" label

---

**🎉 Welcome to the Force Dowels development team!**

You're now ready to start contributing to the revolutionary cabinetry fastener system that's transforming the industry.
