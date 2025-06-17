# Force Dowels Distributor Application System

## Overview
A comprehensive distributor application form system built with Next.js, React Hook Form, Zod validation, and Resend email integration. The system allows potential distributors to submit applications and automatically sends formatted emails to the business and confirmation emails to applicants.

## Features Implemented

### 1. **Comprehensive Application Form** (`/distributor-application`)
- **Contact Information Section**
  - Full Name (required)
  - Business Name (required)
  - Phone Number (required)
  - Email Address (required)

- **Business Address Section**
  - Street Address (required)
  - City (required)
  - State (dropdown with all US states, required)
  - ZIP Code (required)
  - Business Website (optional URL)

- **Business Details Section**
  - Business Type (required radio buttons): Retailer, Wholesaler, Installer, Contractor, Online Store, Other
  - Years in Business (required number input)
  - Territory/Coverage Area (required textarea)
  - Estimated Monthly Purchase Volume (required radio buttons): <500, 500-1000, 1000-5000, 5000+ units

- **Additional Information Section**
  - Currently sells similar products (required Yes/No)
  - Product details (conditional text input if "Yes")
  - How they heard about us (required radio buttons): Trade Show, Referral, Online Search, Social Media, Other
  - Business license status (required Yes/No)
  - File upload for business license/reseller certificate (optional, PDF/JPEG/PNG, max 5MB)

### 2. **Form Validation & User Experience**
- **Zod Schema Validation** (`lib/distributor-validation.ts`)
  - Comprehensive validation rules for all fields
  - Conditional validation (e.g., "Other" fields require specification)
  - Email and URL format validation
  - File type and size validation

- **React Hook Form Integration**
  - Real-time validation feedback
  - Optimized re-renders
  - Accessible form controls

- **shadcn/ui Components**
  - Form, Input, Select, RadioGroup, Textarea, Button, Card components
  - Consistent styling with existing Force Dowels brand
  - Responsive design for mobile and desktop

- **Interactive Features**
  - Conditional field display based on selections
  - File upload with drag-and-drop interface
  - Loading states and success animations
  - Toast notifications for user feedback

### 3. **Email Integration**
- **Resend API Integration** (`lib/distributor-email.ts`)
  - Uses `RESEND_API_KEY` environment variable
  - Sends to specified email: `gunner.sparks@simpliancesafe.com`

- **Professional Email Template** (`emails/distEmailTemplate.tsx`)
  - React Email components for rich formatting
  - Responsive design with Force Dowels branding
  - Organized sections for easy reading
  - Includes all form data in structured format

- **Dual Email System**
  - Business notification email with complete application details
  - Applicant confirmation email with next steps

### 4. **API Endpoints**
- **POST `/api/distributor-application`**
  - Validates form data using Zod schema
  - Sends application email to business
  - Sends confirmation email to applicant
  - Returns success/error responses

- **PUT `/api/distributor-application`**
  - Handles file uploads (business license/certificates)
  - Validates file type and size
  - Placeholder for file storage integration

### 5. **Navigation Integration**
- Added "Become a Distributor" link to main navigation
- Highlighted styling to emphasize call-to-action
- Mobile menu integration
- Public route (no authentication required)

### 6. **Security & Accessibility**
- Public access (potential distributors don't need accounts)
- CSRF protection through Next.js
- Input sanitization and validation
- Accessible form controls with proper labels
- Screen reader friendly

## Technical Stack

### Frontend
- **Next.js 15** - React framework
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Server-side logic
- **Resend** - Email delivery service
- **React Email** - Email template rendering

### Form Components Used
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Input` (text, email, tel, url, number)
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `RadioGroup`, `RadioGroupItem`
- `Textarea`
- `Button`
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Label`

## File Structure
```
app/
├── distributor-application/
│   └── page.tsx                    # Main form page
├── api/
│   └── distributor-application/
│       └── route.ts                # API endpoints
lib/
├── distributor-validation.ts       # Zod schemas & options
└── distributor-email.ts           # Email sending logic
emails/
└── distEmailTemplate.tsx          # Email template
components/
└── header.tsx                     # Updated navigation
middleware.ts                      # Updated public routes
```

## Usage

### For Users
1. Navigate to `/distributor-application`
2. Fill out the comprehensive form
3. Upload business documents (optional)
4. Submit application
5. Receive confirmation email
6. Business receives detailed application email

### For Developers
- Form validation is handled automatically by Zod
- Email templates are customizable in `emails/distEmailTemplate.tsx`
- File upload can be extended with cloud storage integration
- Additional form fields can be added by updating the schema and form

## Email Configuration
- **API Key**: Uses `RESEND_API_KEY` environment variable
- **Recipient**: `gunner.sparks@simpliancesafe.com`
- **From Address**: `Force Dowels <dist@forcedowels.com>`

## Future Enhancements
- Database integration for application storage
- Admin dashboard for application management
- File storage integration (AWS S3, Cloudinary)
- Application status tracking
- Automated follow-up emails
- Territory conflict checking
- Application scoring/rating system

## Testing
The form includes comprehensive validation and error handling. Test scenarios:
- Required field validation
- Email format validation
- File upload validation (type, size)
- Conditional field logic
- Email delivery confirmation
- Success state handling

## Brand Consistency
- Maintains Force Dowels amber color scheme (#d97706, #f59e0b)
- Includes "Patent Pending" notices throughout
- Consistent typography and spacing
- Professional business communication tone
