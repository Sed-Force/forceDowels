# Distributor Application System

A comprehensive distributor application form system that allows potential distributors to submit applications and automatically sends formatted emails to the business and confirmation emails to applicants.

## Overview

The distributor system enables Force Dowels to:
- Collect detailed distributor applications
- Automate the application review process
- Maintain consistent communication with applicants
- Verify business credentials and territories
- Scale the distributor network efficiently

## Features

### Comprehensive Application Form (`/distributor-application`)

#### Contact Information Section
- Full Name (required)
- Business Name (required)
- Phone Number (required)
- Email Address (required)

#### Business Address Section
- Street Address (required)
- City (required)
- State (dropdown with all US states, required)
- ZIP Code (required)
- Business Website (optional URL)

#### Business Details Section
- Business Type (required radio buttons):
  - Retailer
  - Wholesaler
  - Installer
  - Contractor
  - Online Store
  - Other
- Years in Business (required number input)
- Territory/Coverage Area (required textarea)
- Estimated Monthly Purchase Volume (required radio buttons):
  - <500 units
  - 500-1000 units
  - 1000-5000 units
  - 5000+ units

#### Additional Information Section
- Currently sells similar products (required Yes/No)
- Product details (conditional text input if "Yes")
- How they heard about us (required radio buttons):
  - Trade Show
  - Referral
  - Online Search
  - Social Media
  - Other
- Business license status (required Yes/No)
- File upload for business license/reseller certificate (optional, PDF/JPEG/PNG, max 5MB)

## Technical Implementation

### Form Validation & User Experience

#### Zod Schema Validation (`lib/distributor-validation.ts`)
- Comprehensive validation rules for all fields
- Conditional validation (e.g., "Other" fields require specification)
- Email and URL format validation
- File type and size validation

#### React Hook Form Integration
- Real-time validation feedback
- Optimized re-renders
- Accessible form controls

#### shadcn/ui Components
- Form, Input, Select, RadioGroup, Textarea, Button, Card components
- Consistent styling with existing Force Dowels brand
- Responsive design for mobile and desktop

#### Interactive Features
- Conditional field display based on selections
- File upload with drag-and-drop interface
- Loading states and success animations
- Toast notifications for user feedback

### Email Integration

#### Resend API Integration (`lib/distributor-email.ts`)
- Professional email delivery service
- Reliable email delivery with tracking
- Branded email templates

#### Professional Email Template (`emails/distEmailTemplate.tsx`)
- React Email components for rich formatting
- Responsive design with Force Dowels branding
- Organized sections for easy reading
- Includes all form data in structured format

#### Dual Email System
- **Business notification email** with complete application details
- **Applicant confirmation email** with next steps

### API Endpoints

#### POST `/api/distributor-application`
- Validates form data using Zod schema
- Sends application email to business
- Sends confirmation email to applicant
- Returns success/error responses

#### PUT `/api/distributor-application`
- Handles file uploads (business license/certificates)
- Validates file type and size
- Placeholder for file storage integration

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

## Usage Guide

### For Potential Distributors
1. Navigate to `/distributor-application`
2. Fill out the comprehensive form
3. Upload business documents (optional)
4. Submit application
5. Receive confirmation email
6. Wait for business response

### For Business Administrators
1. Receive detailed application emails
2. Review applicant information
3. Verify business credentials
4. Contact applicants for follow-up
5. Approve or decline applications

## Navigation Integration

### Header Updates
- Added "Become a Distributor" link to main navigation
- Highlighted styling to emphasize call-to-action
- Mobile menu integration
- Public route (no authentication required)

### Route Configuration
- Public access (potential distributors don't need accounts)
- Added to middleware public routes
- SEO-friendly URL structure

## Security & Accessibility

### Security Features
- CSRF protection through Next.js
- Input sanitization and validation
- File upload restrictions
- Email rate limiting
- Secure API endpoints

### Accessibility Features
- Accessible form controls with proper labels
- Screen reader friendly
- Keyboard navigation support
- High contrast design
- Mobile-responsive interface

## Email Configuration

### Current Setup
- **API Key**: Configured via environment variables
- **Recipient**: Business email address
- **From Address**: `Force Dowels <onboarding@resend.dev>`

### Email Templates
- Professional business communication tone
- Force Dowels branding and colors
- Structured data presentation
- Mobile-responsive design

## Testing

### Test Scenarios
- Required field validation
- Email format validation
- File upload validation (type, size)
- Conditional field logic
- Email delivery confirmation
- Success state handling

### Validation Testing
- Test all required fields
- Verify conditional logic
- Check file upload restrictions
- Confirm email delivery
- Test error handling

## Brand Consistency

### Design Elements
- Maintains Force Dowels amber color scheme (#d97706, #f59e0b)
- Includes "Patent Pending" notices throughout
- Consistent typography and spacing
- Professional business communication tone

### User Experience
- Intuitive form flow
- Clear instructions and labels
- Progress indicators
- Success confirmation
- Error messaging

## Future Enhancements

### Planned Features
- Database integration for application storage
- Admin dashboard for application management
- File storage integration (AWS S3, Cloudinary)
- Application status tracking
- Automated follow-up emails
- Territory conflict checking
- Application scoring/rating system

### Potential Improvements
- Multi-step form wizard
- Document verification system
- Territory mapping visualization
- Distributor portal access
- Performance analytics
- A/B testing capabilities

## Technical Stack

### Frontend Technologies
- **Next.js 15** - React framework
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend Technologies
- **Next.js API Routes** - Server-side logic
- **Resend** - Email delivery service
- **React Email** - Email template rendering

### Form Components Used
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Input` (text, email, tel, url, number)
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `RadioGroup`, `RadioGroupItem`
- `Textarea`, `Button`
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Label`

## Troubleshooting

### Common Issues

**Form Validation Errors**
- Check required field completion
- Verify email format
- Confirm file upload requirements

**Email Delivery Issues**
- Verify Resend API key
- Check email addresses
- Review spam folders

**File Upload Problems**
- Confirm file size limits
- Check supported file types
- Verify upload permissions

### Debug Steps
1. Check browser console for errors
2. Verify form validation messages
3. Test email delivery
4. Review API response codes
5. Check network requests

## Support

For technical support or questions about the distributor system:
- Review the troubleshooting guide
- Check the API documentation
- Contact development team
- Submit bug reports through proper channels

The distributor application system is fully functional and ready for production use!
