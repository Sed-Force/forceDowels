# 🗄️ Database Setup Guide

This guide will help you set up the database for your Force Dowels application to handle incoming orders.

## Quick Setup (Recommended)

### 1. Check Environment Variables
```bash
npm run env:check
```

### 2. Set Up Database URL
If you don't have a `DATABASE_URL` set, choose one of these options:

#### Option A: Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string
4. Add to your `.env.local`:
```env
DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require
```

#### Option B: Supabase (Alternative)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add to your `.env.local`

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Ubuntu

# Create database
createdb force_dowels

# Add to .env.local:
DATABASE_URL=postgresql://postgres:password@localhost:5432/force_dowels
```

### 3. Initialize Database
```bash
npm run db:init
```

### 4. Verify Setup
```bash
npm run dev
```
Then visit: http://localhost:3000/admin/database

## Manual Setup

### 1. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
DATABASE_URL=your_postgresql_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
RESEND_API_KEY=your_resend_key
```

### 2. Database Schema
The database will automatically create this table structure:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  tier VARCHAR(100) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  shipping_info JSONB NOT NULL,
  billing_info JSONB NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

## Troubleshooting

### Database Connection Issues
1. **SSL Error**: Add `?sslmode=require` to your DATABASE_URL
2. **Connection Timeout**: Check if your database service is running
3. **Authentication Failed**: Verify username/password in connection string

### Common Errors
- `relation "orders" does not exist` → Run `npm run db:init`
- `permission denied` → Check database user permissions
- `connection refused` → Verify database host and port

### Testing Database
Use the admin interface:
1. Start your app: `npm run dev`
2. Visit: http://localhost:3000/admin/database
3. Click "Initialize Database" if needed
4. Verify all checks are green

## Database Management

### Available Scripts
```bash
npm run env:check    # Check environment variables
npm run db:init      # Initialize database tables
npm run dev          # Start development server
```

### API Endpoints
- `GET /api/admin/init-database` - Check database status
- `POST /api/admin/init-database` - Initialize database
- `POST /api/orders/update-payment-status` - Update order status
- `POST /api/orders/send-completion-emails` - Send order emails

### Admin Interface
Visit `/admin/database` to:
- Check database connection status
- View table structure and indexes
- See current order count
- Initialize database if needed

## Email Integration

When orders are marked as 'paid' in the database, emails are automatically sent:
1. **Customer confirmation email** - Order details and receipt
2. **Admin notification email** - New order alert

This happens automatically when:
- Webhook processes successful payment
- Manual order status update via API
- Order status changed to 'paid' in database

## Next Steps

1. ✅ Set up environment variables
2. ✅ Initialize database
3. ✅ Test order flow
4. 🔄 Configure Stripe webhooks
5. 🔄 Set up email templates
6. 🔄 Deploy to production

Need help? Check the logs in your terminal or the admin interface for detailed error messages.
