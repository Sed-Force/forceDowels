# Production Deployment Guide

This guide covers deploying the Force Dowels application to production environments, with a focus on Vercel deployment.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] ESLint checks passing
- [ ] Build process completes without errors
- [ ] Environment variables documented

### Service Configuration
- [ ] Clerk production app configured
- [ ] Stripe live keys obtained and tested
- [ ] Resend production API key configured
- [ ] Domain DNS configured
- [ ] SSL certificate ready

### Security Review
- [ ] All API keys secured
- [ ] No sensitive data in code
- [ ] CORS policies configured
- [ ] Rate limiting implemented
- [ ] Input validation in place

## Vercel Deployment (Recommended)

### Initial Setup

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Next.js" framework preset

3. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "devCommand": "npm run dev"
   }
   ```

### Environment Variables Configuration

Set the following environment variables in Vercel dashboard:

#### Required Variables
```env
# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Stripe Payment Processing (Live)
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_secret
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Email Service
RESEND_API_KEY=re_your_production_api_key
```

### Domain Configuration

1. **Add Custom Domain**
   - Go to Vercel project settings
   - Navigate to "Domains"
   - Add your custom domain
   - Configure DNS records as instructed

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working after DNS propagation

### Deployment Process

1. **Automatic Deployment**
   ```bash
   # Push to main branch triggers deployment
   git push origin main
   ```

2. **Manual Deployment**
   ```bash
   # Using Vercel CLI
   npm install -g vercel
   vercel --prod
   ```

3. **Preview Deployments**
   - Every pull request gets a preview deployment
   - Test changes before merging to main

## Alternative Deployment Options

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   COPY package.json package-lock.json ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   ENV NEXT_TELEMETRY_DISABLED 1
   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   # Build image
   docker build -t force-dowels .

   # Run container
   docker run -p 3000:3000 --env-file .env.production force-dowels
   ```

### AWS Deployment

1. **Using AWS Amplify**
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables
   - Deploy automatically

2. **Using EC2 with PM2**
   ```bash
   # Install PM2
   npm install -g pm2

   # Start application
   pm2 start npm --name "force-dowels" -- start

   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

## Post-Deployment Configuration

### Service Configuration Updates

#### Clerk Production Setup
1. **Update Clerk Dashboard**
   - Switch to production environment
   - Configure production domain URLs
   - Update redirect URLs
   - Test authentication flow

2. **Webhook Configuration**
   ```
   Endpoint: https://your-domain.com/api/clerk/webhooks
   Events: user.created, user.updated, user.deleted
   ```

#### Stripe Live Mode Setup
1. **Activate Live Mode**
   - Complete Stripe account verification
   - Switch to live mode in dashboard
   - Update API keys in environment

2. **Webhook Configuration**
   ```
   Endpoint: https://your-domain.com/api/stripe/webhooks
   Events: checkout.session.completed, payment_intent.payment_failed
   ```

3. **Test Live Payments**
   - Use small real transactions for testing
   - Verify webhook delivery
   - Check order processing

#### Resend Production Setup
1. **Domain Verification**
   - Add your domain to Resend
   - Configure DNS records for email authentication
   - Verify domain ownership

2. **Email Templates**
   - Test all email templates
   - Verify branding and formatting
   - Check spam folder delivery

### Performance Optimization

#### Vercel Optimization
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Enable experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

#### CDN Configuration
- Vercel automatically provides global CDN
- Configure caching headers for static assets
- Optimize image delivery

### Monitoring and Analytics

#### Error Tracking
```bash
# Install Sentry (optional)
npm install @sentry/nextjs

# Configure in next.config.mjs
const { withSentryConfig } = require('@sentry/nextjs')
```

#### Performance Monitoring
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Set up performance alerts
- Track user behavior

#### Uptime Monitoring
- Configure uptime monitoring service
- Set up alerts for downtime
- Monitor API endpoint health

## Security Considerations

### Environment Security
- Use Vercel's encrypted environment variables
- Rotate API keys regularly
- Implement proper CORS policies
- Enable rate limiting

### Application Security
```javascript
// Security headers middleware
export function middleware(request) {
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  return response
}
```

### Data Protection
- Implement proper data validation
- Use HTTPS for all communications
- Follow GDPR/CCPA compliance requirements
- Regular security audits

## Backup and Recovery

### Database Backup
- If using external database, configure automated backups
- Test backup restoration procedures
- Document recovery processes

### Code Backup
- Ensure code is backed up in version control
- Tag releases for easy rollback
- Maintain deployment documentation

## Rollback Procedures

### Vercel Rollback
1. **Via Dashboard**
   - Go to Vercel project deployments
   - Select previous successful deployment
   - Click "Promote to Production"

2. **Via CLI**
   ```bash
   # List deployments
   vercel ls

   # Promote specific deployment
   vercel promote <deployment-url>
   ```

### Emergency Procedures
1. **Immediate Issues**
   - Rollback to previous deployment
   - Check service status pages
   - Notify stakeholders

2. **Data Issues**
   - Stop processing if needed
   - Restore from backup
   - Verify data integrity

## Maintenance

### Regular Tasks
- [ ] Monitor application performance
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Security patches as needed
- [ ] Backup verification monthly

### Scheduled Maintenance
- Plan maintenance windows
- Notify users in advance
- Test updates in staging first
- Have rollback plan ready

## Support and Monitoring

### Health Checks
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  })
}
```

### Logging
- Configure structured logging
- Monitor error rates
- Set up alerts for critical issues
- Regular log analysis

### Performance Metrics
- Monitor response times
- Track conversion rates
- Analyze user behavior
- Optimize based on data

The production deployment is now complete and ready for users!
