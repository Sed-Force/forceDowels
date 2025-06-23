# Development Guidelines

This guide outlines the development practices, code organization, and workflows for the Force Dowels project.

## 📁 Code Organization

### Project Structure
```
force-dowel/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages group
│   │   ├── sign-in/              # Custom sign-in page
│   │   └── sign-up/              # Custom sign-up page
│   ├── admin/                    # Admin dashboard
│   │   └── database/             # Database management
│   ├── api/                      # API routes
│   │   ├── distributor-application/  # Distributor API
│   │   ├── distribution/         # Distribution management
│   │   ├── orders/               # Order management
│   │   └── stripe/               # Payment webhooks
│   ├── cart/                     # Shopping cart page
│   ├── checkout/                 # Payment processing
│   ├── distribution/             # Distribution management pages
│   ├── distributor-application/  # Distributor signup form
│   ├── find-a-distributor/       # Distributor locator
│   ├── orders/                   # Order management
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Global loading component
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── email-templates/          # Email components
│   ├── header.tsx                # Site navigation
│   ├── footer.tsx                # Site footer
│   └── [feature-components]      # Feature-specific components
├── lib/                          # Utility functions and services
│   ├── db.ts                     # Database connection
│   ├── stripe.ts                 # Stripe integration
│   ├── email.ts                  # Email utilities
│   ├── distribution.ts           # Distribution logic
│   └── utils.ts                  # General utilities
├── emails/                       # Email templates
├── contexts/                     # React contexts
├── hooks/                        # Custom React hooks
├── docs/                         # Documentation
└── public/                       # Static assets
```

### File Naming Conventions
- **Components**: PascalCase (`HeaderComponent.tsx`)
- **Pages**: lowercase with hyphens (`distributor-application/page.tsx`)
- **Utilities**: camelCase (`distributionUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase with `.types.ts` suffix (`Order.types.ts`)

### Import Organization
```typescript
// 1. React and Next.js imports
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. Third-party libraries
import { z } from 'zod';
import { Resend } from 'resend';

// 3. Internal utilities and services
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// 4. Components
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';

// 5. Types and interfaces
import type { DistributionRequest } from '@/types/distribution';
```

## 🏗️ Architecture Patterns

### API Route Structure
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const requestSchema = z.object({
  field: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // 2. Business logic
    const result = await processData(validatedData);

    // 3. Return response
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // 4. Error handling
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Component Structure
```typescript
// components/ExampleComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ExampleComponent({
  title,
  description,
  className,
  children,
}: ExampleComponentProps) {
  return (
    <div className={cn('default-classes', className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
```

### Database Operations
```typescript
// lib/example-service.ts
import { query } from '@/lib/db';

export interface ExampleRecord {
  id: number;
  name: string;
  createdAt: Date;
}

export async function createExample(data: Omit<ExampleRecord, 'id' | 'createdAt'>) {
  const result = await query(
    'INSERT INTO examples (name) VALUES ($1) RETURNING *',
    [data.name]
  );
  return result.rows[0] as ExampleRecord;
}

export async function getExampleById(id: number) {
  const result = await query(
    'SELECT * FROM examples WHERE id = $1',
    [id]
  );
  return result.rows[0] as ExampleRecord | undefined;
}
```

## 🔧 Development Workflow

### Feature Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Development Setup**
   ```bash
   npm run dev          # Start development server
   npm run db:init      # Ensure database is up to date
   npm run env:check    # Verify environment variables
   ```

3. **Code Implementation**
   - Follow existing patterns and conventions
   - Add TypeScript types for new data structures
   - Implement proper error handling
   - Add input validation with Zod schemas

4. **Testing**
   ```bash
   npm run lint         # Check code style
   npm run build        # Verify build succeeds
   # Manual testing of new functionality
   ```

5. **Documentation**
   - Update relevant documentation files
   - Add inline code comments for complex logic
   - Update API documentation if applicable

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   git push origin feature/new-feature-name
   ```

### Commit Message Conventions
```
feat: add new feature
fix: resolve bug in component
docs: update documentation
style: format code
refactor: restructure component
test: add test cases
chore: update dependencies
```

### Code Review Checklist
- [ ] Code follows established patterns
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Input validation is present
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Environment variables are properly used
- [ ] Security best practices followed

## 🧪 Testing Procedures

### Manual Testing Workflow

#### 1. Authentication Testing
```bash
# Test user flows
1. Visit /sign-in and /sign-up
2. Create test account
3. Verify protected routes redirect
4. Test sign-out functionality
5. Check session persistence
```

#### 2. E-commerce Testing
```bash
# Test order flow
1. Browse products on homepage
2. Add items to cart
3. Proceed to checkout
4. Use Stripe test cards:
   - Success: 4242 4242 4242 4242
   - Declined: 4000 0000 0000 0002
5. Verify order confirmation emails
6. Check order appears in admin dashboard
```

#### 3. Distribution System Testing
```bash
# Test distributor workflow
1. Submit distributor application
2. Verify admin notification email
3. Test accept/decline URLs
4. Check applicant notification emails
5. Verify distributor appears in find-a-distributor
```

#### 4. Database Testing
```bash
# Verify database operations
npm run db:init                    # Initialize tables
Visit /admin/database              # Check database status
Test CRUD operations               # Create, read, update, delete
```

### Automated Testing Setup
```bash
# Future testing framework setup
npm install --save-dev jest @testing-library/react
npm install --save-dev playwright  # For E2E testing

# Test commands (to be implemented)
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:coverage  # Coverage report
```

## 🚀 Deployment Workflow

### Environment Management

#### Development Environment
```env
# .env.local (development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://dev_user:password@localhost:5432/force_dowels_dev
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
# ... other test keys
```

#### Production Environment
```env
# Vercel environment variables (production)
NEXT_PUBLIC_BASE_URL=https://forcedowels.com
DATABASE_URL=postgresql://prod_user:password@host.neon.tech/force_dowels_prod
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
# ... other live keys
```

### Deployment Process

#### 1. Pre-deployment Checklist
- [ ] All tests pass
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Documentation updated

#### 2. Vercel Deployment
```bash
# Automatic deployment via GitHub integration
git push origin main              # Triggers automatic deployment

# Manual deployment (if needed)
npm install -g vercel
vercel --prod
```

#### 3. Post-deployment Verification
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Payment processing functional
- [ ] Email delivery working
- [ ] Database connections stable
- [ ] All API endpoints responding

### Database Migrations
```bash
# For schema changes
1. Update table definitions in lib/db.ts
2. Create migration script in scripts/
3. Test migration on staging database
4. Apply to production during deployment
5. Verify data integrity
```

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development/production
- Rotate API keys regularly
- Monitor key usage in service dashboards

### Input Validation
```typescript
// Always validate API inputs
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const validatedData = schema.parse(requestBody);
```

### Database Security
```typescript
// Use parameterized queries
const result = await query(
  'SELECT * FROM users WHERE id = $1',
  [userId]  // Never interpolate directly
);
```

### Authentication
- Use Clerk middleware for route protection
- Validate user sessions on API routes
- Implement proper role-based access control

## 📊 Performance Guidelines

### Code Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images with Next.js Image component
- Minimize bundle size with dynamic imports

### Database Optimization
- Use indexes for frequently queried columns
- Implement connection pooling
- Monitor query performance
- Use EXPLAIN ANALYZE for slow queries

### Caching Strategy
- Leverage Next.js built-in caching
- Use SWR for client-side data fetching
- Implement Redis for session storage (future)
- Cache static assets with CDN

## 🐛 Debugging Guidelines

### Development Debugging
```typescript
// Use structured logging
console.log('Processing order:', { orderId, userId, amount });

// Error context
try {
  await processPayment(data);
} catch (error) {
  console.error('Payment processing failed:', {
    error: error.message,
    data,
    timestamp: new Date().toISOString(),
  });
  throw error;
}
```

### Production Monitoring
- Monitor error rates in Vercel dashboard
- Set up alerts for critical failures
- Use structured logging for easier debugging
- Implement health check endpoints

### Common Issues & Solutions
- **Database connection timeouts**: Check connection pool settings
- **Stripe webhook failures**: Verify webhook secret and endpoint URL
- **Email delivery issues**: Check Resend API limits and domain verification
- **Authentication problems**: Verify Clerk configuration and environment variables

This development guide ensures consistent, maintainable, and secure code across the Force Dowels project. Follow these guidelines to maintain code quality and team productivity.
