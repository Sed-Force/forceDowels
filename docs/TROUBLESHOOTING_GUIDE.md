# Troubleshooting Guide

This guide covers common issues and solutions for the Force Dowels application setup and development.

## 🚨 Quick Diagnostics

### Environment Check
```bash
npm run env:check    # Check environment variables
npm run db:init      # Test database connection
npm run dev          # Start development server
```

### Health Check URLs
- **Homepage**: `http://localhost:3000/` - Should load cleanly
- **Auth Check**: `http://localhost:3000/sign-in` - Clerk integration
- **Database**: `http://localhost:3000/admin/database` - Database status
- **Stripe Config**: `http://localhost:3000/stripe-config` - Payment setup

## 🔧 Setup Issues

### Node.js and Dependencies

#### Issue: `npm install` fails
```bash
Error: Cannot resolve dependency tree
```
**Solutions:**
1. Check Node.js version: `node --version` (requires 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and package-lock.json: `rm -rf node_modules package-lock.json`
4. Reinstall: `npm install`

#### Issue: Development server won't start
```bash
Error: Port 3000 is already in use
```
**Solutions:**
1. Kill process on port 3000: `lsof -ti:3000 | xargs kill -9`
2. Use different port: `npm run dev -- -p 3001`
3. Check for other Next.js instances running

### Environment Variables

#### Issue: Missing environment variables
```bash
Error: Missing required environment variable: CLERK_SECRET_KEY
```
**Solutions:**
1. Verify `.env.local` exists in project root
2. Check variable names match exactly (case-sensitive)
3. Ensure no spaces around `=` in env file
4. Restart development server after changes

#### Issue: Environment variables not loading
```bash
Error: process.env.VARIABLE_NAME is undefined
```
**Solutions:**
1. Prefix client-side variables with `NEXT_PUBLIC_`
2. Restart development server
3. Check file is named `.env.local` (not `.env`)
4. Verify file is in project root directory

## 🗄️ Database Issues

### Connection Problems

#### Issue: Database connection failed
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solutions:**
1. **For Neon Database:**
   - Verify DATABASE_URL format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`
   - Check Neon dashboard for connection string
   - Ensure SSL mode is included

2. **For Local PostgreSQL:**
   - Start PostgreSQL service: `brew services start postgresql`
   - Create database: `createdb force_dowels`
   - Check connection: `psql -d force_dowels`

#### Issue: SSL connection errors
```bash
Error: self signed certificate in certificate chain
```
**Solutions:**
1. Add SSL configuration to DATABASE_URL: `?sslmode=require`
2. For development, use: `?sslmode=disable` (not recommended for production)

### Table and Schema Issues

#### Issue: Table does not exist
```bash
Error: relation "orders" does not exist
```
**Solutions:**
1. Run database initialization: `npm run db:init`
2. Check database connection in admin panel: `/admin/database`
3. Manually create tables using SQL scripts in `scripts/init-database.js`

#### Issue: Database initialization fails
```bash
Error: permission denied for schema public
```
**Solutions:**
1. Check database user permissions
2. Verify DATABASE_URL has correct credentials
3. For Neon: ensure user has full access to database

## 🔐 Authentication Issues

### Clerk Configuration

#### Issue: Clerk authentication not working
```bash
Error: Clerk: Missing publishable key
```
**Solutions:**
1. Verify Clerk keys in `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
2. Check Clerk dashboard for correct keys
3. Ensure development domain is added to Clerk allowed origins

#### Issue: Redirect loops on sign-in
```bash
Error: Too many redirects
```
**Solutions:**
1. Check Clerk redirect URLs configuration
2. Verify middleware.ts configuration
3. Ensure sign-in/sign-up URLs match Clerk settings:
   ```env
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

#### Issue: Protected routes not working
```bash
Error: User not authenticated but accessing protected route
```
**Solutions:**
1. Check middleware.ts includes protected routes
2. Verify Clerk middleware is properly configured
3. Test authentication flow manually

## 💳 Payment Issues

### Stripe Configuration

#### Issue: Stripe payments failing
```bash
Error: No such payment_intent
```
**Solutions:**
1. Verify Stripe test keys are being used:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
2. Check Stripe dashboard for test mode
3. Use valid test card numbers:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`

#### Issue: Webhook verification failed
```bash
Error: Webhook signature verification failed
```
**Solutions:**
1. Check webhook secret in environment variables
2. Verify webhook endpoint URL in Stripe dashboard
3. Ensure webhook events are properly configured
4. For development, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhooks`

#### Issue: Checkout session creation fails
```bash
Error: Invalid request
```
**Solutions:**
1. Verify product data format
2. Check price calculations
3. Ensure success/cancel URLs are valid
4. Review Stripe API documentation for required fields

## 📧 Email Issues

### Resend Configuration

#### Issue: Emails not sending
```bash
Error: Unauthorized
```
**Solutions:**
1. Verify Resend API key: `RESEND_API_KEY=re_...`
2. Check API key permissions in Resend dashboard
3. Verify sender domain is configured
4. Check rate limits in Resend dashboard

#### Issue: Email delivery failures
```bash
Error: Email address not verified
```
**Solutions:**
1. **For Development**: Use default sender or verify domain
2. **For Production**: Verify domain in Resend dashboard
3. Check recipient email addresses are valid
4. Review Resend delivery logs

#### Issue: Email templates not rendering
```bash
Error: React Email component error
```
**Solutions:**
1. Check React Email component syntax
2. Verify all props are passed correctly
3. Test templates in React Email preview
4. Check for missing imports in email components

## 🌐 Deployment Issues

### Vercel Deployment

#### Issue: Build failures on Vercel
```bash
Error: Build failed
```
**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set in Vercel
3. Test build locally: `npm run build`
4. Check for TypeScript errors
5. Verify all dependencies are in package.json

#### Issue: Environment variables not working in production
```bash
Error: Missing environment variable in production
```
**Solutions:**
1. Set environment variables in Vercel dashboard
2. Ensure production values are different from development
3. Redeploy after adding environment variables
4. Check variable names match exactly

#### Issue: Database connection fails in production
```bash
Error: Connection timeout
```
**Solutions:**
1. Verify production DATABASE_URL
2. Check database service is running
3. Ensure SSL configuration is correct
4. Verify database allows connections from Vercel IPs

## 🔍 Debugging Techniques

### Browser Console Debugging
1. Open browser developer tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API requests
4. Verify environment variables in client-side code

### Server-Side Debugging
```bash
# Check server logs
npm run dev    # Development logs in terminal

# Add debug logging
console.log('Debug info:', { variable, context });

# Check API responses
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Database Debugging
```sql
-- Check table structure
\d orders
\d distribution_requests
\d distributors

-- Check data
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
SELECT * FROM distribution_requests WHERE status = 'pending';

-- Check indexes
\di
```

## 📞 Getting Help

### Self-Help Resources
1. **Check Documentation**: Review relevant docs in `/docs` folder
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Service Dashboards**: Check Clerk, Stripe, Resend dashboards for errors
4. **Logs**: Review application logs and error messages

### Support Channels
1. **GitHub Issues**: Create issue with detailed error information
2. **Email Support**: cjmccann00@gmail.com
3. **Service Support**: Contact Clerk, Stripe, or Resend support for service-specific issues

### Creating Effective Bug Reports
Include the following information:
- **Environment**: Development/Production
- **Error Message**: Complete error text
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Browser/OS**: If relevant
- **Screenshots**: If applicable

### Emergency Contacts
- **Production Issues**: cjmccann00@gmail.com
- **Database Issues**: Check Neon dashboard first
- **Payment Issues**: Check Stripe dashboard first
- **Email Issues**: Check Resend dashboard first

## 🔄 Recovery Procedures

### Database Recovery
```bash
# Backup current data
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql

# Reset to clean state
npm run db:init
```

### Environment Reset
```bash
# Reset environment
rm .env.local
cp .env.example .env.local
# Edit with correct values

# Reset dependencies
rm -rf node_modules package-lock.json
npm install
```

### Cache Clearing
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Clear browser cache
# Use browser developer tools
```

Remember: Most issues are environment-related. Double-check your environment variables and service configurations first!
