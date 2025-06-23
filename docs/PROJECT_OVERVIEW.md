# Force Dowels Project Overview

## 🏢 About Force Dowels

Force Dowels™ is a revolutionary cabinetry fastener system that transforms how cabinets are assembled. Our patent-pending technology provides:

- **No Exterior Fasteners** - Achieve a cleaner, professional look
- **No Glue Necessary** - Simplify your assembly process  
- **Significantly Reduced Labor Costs** - Increase efficiency and profitability
- **Built for RTA Efficiency** - Strong, simple, and reliable assembly
- **Professional Finish** - Flawless results every time

## 🎯 Application Purpose

The Force Dowels web application serves as the primary digital platform for:

1. **Product Showcase** - Interactive galleries and demonstrations
2. **E-commerce Platform** - Direct-to-consumer sales with bulk pricing
3. **Distributor Network Management** - Application and approval system
4. **Customer Support** - Contact forms and support resources
5. **Business Operations** - Order management and analytics

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Framer Motion** - Animation library
- **React Hook Form** - Form management with validation

#### Backend & Database
- **Next.js API Routes** - Server-side API endpoints
- **PostgreSQL** - Primary database (hosted on Neon)
- **Prisma/Raw SQL** - Database queries and management

#### Authentication & Security
- **Clerk** - Authentication and user management
- **Middleware** - Route protection and session management

#### Payment Processing
- **Stripe** - Payment processing and checkout
- **Webhooks** - Real-time payment status updates

#### Email & Communications
- **Resend** - Email delivery service
- **React Email** - Email template system

#### Deployment & Hosting
- **Vercel** - Application hosting and deployment
- **GitHub** - Version control and CI/CD

### Application Structure

```
force-dowel/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API endpoints
│   ├── cart/                     # Shopping cart
│   ├── checkout/                 # Payment processing
│   ├── distribution/             # Distribution management
│   ├── distributor-application/  # Distributor signup
│   ├── find-a-distributor/       # Distributor locator
│   └── orders/                   # Order management
├── components/                   # Reusable UI components
├── lib/                         # Utility functions and services
├── emails/                      # Email templates
├── docs/                        # Documentation
└── public/                      # Static assets
```

## 🔑 Key Features

### 1. E-commerce System
- **Product Catalog** - Single product with quantity-based pricing
- **Bulk Pricing Tiers** - Automatic discounts for larger quantities
- **Shopping Cart** - Persistent cart with quantity updates
- **Stripe Integration** - Secure payment processing
- **Order Management** - Complete order lifecycle tracking

### 2. Authentication System
- **Clerk Integration** - Modern authentication with social logins
- **Protected Routes** - Secure access to user-specific features
- **User Profiles** - Account management and order history
- **Session Management** - Persistent login across devices

### 3. Distribution Network Management
- **Application System** - Comprehensive distributor application form
- **Approval Workflow** - Accept/decline system with email notifications
- **Distributor Database** - Approved distributor storage and management
- **Territory Management** - Geographic territory assignment
- **Find-a-Distributor** - Interactive map for customer distributor lookup

### 4. Email Communication System
- **Order Confirmations** - Automated customer receipts
- **Distribution Notifications** - Application status updates
- **Admin Alerts** - New order and application notifications
- **Professional Templates** - Branded email designs

### 5. Content Management
- **Interactive Galleries** - Product demonstration images
- **Video Content** - Installation and demonstration videos
- **Testimonials** - Customer success stories
- **Educational Content** - Product benefits and comparisons

## 🗄️ Database Schema

### Core Tables

#### `orders`
Stores all customer orders with complete transaction details.
```sql
- id (SERIAL PRIMARY KEY)
- user_id (VARCHAR) - Clerk user identifier
- user_email (VARCHAR) - Customer email
- user_name (VARCHAR) - Customer name
- quantity (INTEGER) - Number of dowels ordered
- tier (VARCHAR) - Pricing tier applied
- total_price (DECIMAL) - Final order total
- shipping_info (JSONB) - Shipping address and details
- billing_info (JSONB) - Billing address and details
- payment_status (VARCHAR) - Order payment status
- stripe_session_id (VARCHAR) - Stripe checkout session
- created_at (TIMESTAMP) - Order creation time
- updated_at (TIMESTAMP) - Last modification time
```

#### `distribution_requests`
Manages distributor applications and approval workflow.
```sql
- id (SERIAL PRIMARY KEY)
- unique_id (UUID) - Secure identifier for accept/decline URLs
- full_name (VARCHAR) - Applicant name
- business_name (VARCHAR) - Business name
- contact_info (VARCHAR fields) - Phone, email, address
- business_details (VARCHAR/TEXT) - Type, years, territory
- application_data (TEXT/VARCHAR) - Additional form fields
- status (VARCHAR) - pending/accepted/declined
- created_at (TIMESTAMP) - Application submission time
- responded_at (TIMESTAMP) - Decision timestamp
```

#### `distributors`
Stores approved distributors for the find-a-distributor system.
```sql
- id (SERIAL PRIMARY KEY)
- distribution_request_id (INTEGER) - Reference to original application
- business_info (VARCHAR fields) - Name, contact, address
- territory (TEXT) - Assigned geographic territory
- coordinates (DECIMAL) - Latitude/longitude for mapping
- is_active (BOOLEAN) - Active status
- created_at (TIMESTAMP) - Approval date
```

## 🔌 API Endpoints

### Authentication
- Handled by Clerk middleware and components
- Protected routes automatically redirect to sign-in

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Retrieve user orders
- `POST /api/stripe/webhooks` - Handle payment confirmations

### Distribution System
- `POST /api/distributor-application` - Submit distributor application
- `GET /api/distribution/accept/[id]` - Accept distributor application
- `GET /api/distribution/decline/[id]` - Decline distributor application
- `GET /api/distributors` - Get approved distributors for map

### Admin
- `GET /api/admin/init-database` - Database status check
- `POST /api/admin/init-database` - Initialize database tables

## 🔄 Key Workflows

### Customer Order Flow
1. Browse products on homepage
2. Sign in/up via Clerk
3. Add items to cart with quantity selection
4. Proceed to Stripe checkout
5. Complete payment
6. Receive order confirmation email
7. Admin receives new order notification

### Distributor Application Flow
1. Submit application via `/distributor-application`
2. Application stored in database with unique ID
3. Admin receives email with accept/decline links
4. Admin clicks accept/decline link
5. Status updated in database
6. Applicant receives notification email
7. If accepted, distributor added to find-a-distributor map

### Email Notification System
- **Order Confirmations** - Triggered by successful Stripe payments
- **Distribution Notifications** - Sent on application status changes
- **Admin Alerts** - Real-time notifications for new orders/applications

## 🔧 Development Environment

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)
- Required API keys (Clerk, Stripe, Resend)

### Key Configuration
- Environment variables in `.env.local`
- Database initialization via `npm run db:init`
- Development server via `npm run dev`

## 🚀 Deployment

### Production Environment
- **Hosting** - Vercel platform
- **Database** - Neon PostgreSQL
- **Domain** - forcedowels.com
- **SSL** - Automatic via Vercel
- **CDN** - Global edge network

### Environment Management
- Development uses test API keys
- Production uses live API keys
- Environment-specific configurations
- Secure secret management

This overview provides the foundation for understanding the Force Dowels application architecture and key systems. For detailed implementation guides, see the specific feature documentation.
