# Quick Start Guide

Get Force Dowels up and running in under 5 minutes!

## 🚀 Express Setup

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
# For basic functionality
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Add your API keys (get from respective dashboards)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
RESEND_API_KEY=your_resend_key
```

### 3. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🔧 Development Mode Features

### Test Accounts
- **Stripe Test Cards**: Use `4242 4242 4242 4242` for testing payments
- **Clerk Auth**: Create test accounts directly in the app

### Available Routes
- `/` - Homepage with product showcase
- `/order` - Product ordering (requires auth)
- `/videos` - Product demonstration videos
- `/distributor-application` - Become a distributor
- `/contact` - Contact form
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
