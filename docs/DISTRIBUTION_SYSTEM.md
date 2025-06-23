# Distribution System Documentation

The Force Dowels distribution system manages the complete workflow for distributor applications, from initial submission through approval/decline and integration with the find-a-distributor feature.

## 🎯 System Overview

### Purpose
The distribution system enables Force Dowels to:
- Collect comprehensive distributor applications
- Automate the review and approval process
- Maintain secure accept/decline workflows
- Integrate approved distributors with the customer-facing locator
- Send professional email notifications throughout the process

### Key Components
1. **Application Form** (`/distributor-application`)
2. **Database Storage** (distribution_requests, distributors tables)
3. **Email Notification System** (Resend + React Email templates)
4. **Accept/Decline Workflow** (Secure URL-based actions)
5. **Find-a-Distributor Integration** (Interactive map with approved distributors)

## 📋 Application Form System

### Form Structure (`/distributor-application`)

#### Contact Information Section
- **Full Name** (required) - Primary contact person
- **Business Name** (required) - Legal business name
- **Phone Number** (required) - Primary business phone
- **Email Address** (required) - Business email for communications

#### Business Address Section
- **Street Address** (required) - Physical business location
- **City** (required) - Business city
- **State** (required) - Business state/province
- **ZIP Code** (required) - Postal code
- **Website** (optional) - Business website URL

#### Business Details Section
- **Business Type** (required) - Dropdown selection:
  - Cabinet Manufacturer
  - Kitchen & Bath Dealer
  - Millwork Company
  - Hardware Distributor
  - General Contractor
  - Other (with text field)
- **Years in Business** (required) - Dropdown selection
- **Territory of Interest** (required) - Geographic area for distribution

#### Sales Information Section
- **Expected Purchase Volume** (required) - Annual volume estimates
- **Sells Similar Products** (required) - Yes/No radio buttons
- **Similar Products Details** (conditional) - Text area if "Yes" selected
- **Additional Information** (optional) - Free-form text area

### Form Validation & Security
- **Zod Schema Validation** - Server-side validation for all fields
- **React Hook Form** - Client-side validation and user experience
- **CSRF Protection** - Built-in Next.js security
- **Input Sanitization** - Automatic sanitization of all inputs
- **File Upload Support** - Business license/certificate uploads (optional)

## 🗄️ Database Schema

### `distribution_requests` Table
Stores all distributor applications with complete form data.

```sql
CREATE TABLE distribution_requests (
  id SERIAL PRIMARY KEY,
  unique_id UUID UNIQUE NOT NULL,           -- Secure ID for accept/decline URLs
  full_name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  website VARCHAR(500),
  business_type VARCHAR(100) NOT NULL,
  business_type_other VARCHAR(255),         -- For "Other" business type
  years_in_business VARCHAR(50) NOT NULL,
  territory TEXT NOT NULL,
  purchase_volume VARCHAR(100) NOT NULL,
  sells_similar_products VARCHAR(10) NOT NULL,
  similar_products_details TEXT,
  additional_information TEXT,
  status VARCHAR(20) DEFAULT 'pending',     -- pending/accepted/declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE     -- When accept/decline action taken
);
```

### `distributors` Table
Stores approved distributors for the find-a-distributor system.

```sql
CREATE TABLE distributors (
  id SERIAL PRIMARY KEY,
  distribution_request_id INTEGER REFERENCES distribution_requests(id),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  website VARCHAR(500),
  business_type VARCHAR(100) NOT NULL,
  territory TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,          -- For map integration
  longitude DECIMAL(11,8) NOT NULL,         -- For map integration
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Application Submission
**POST** `/api/distributor-application`

**Request Body:**
```json
{
  "fullName": "John Smith",
  "businessName": "Smith Industrial Supply",
  "phoneNumber": "(555) 123-4567",
  "emailAddress": "john@smithindustrial.com",
  "street": "123 Industrial Blvd",
  "city": "Phoenix",
  "state": "Arizona",
  "zipCode": "85001",
  "website": "https://smithindustrial.com",
  "businessType": "Hardware Distributor",
  "yearsInBusiness": "10-20 years",
  "territory": "Arizona, New Mexico",
  "purchaseVolume": "$50,000 - $100,000",
  "sellsSimilarProducts": "no",
  "additionalInformation": "Interested in expanding product line"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": "uuid-string"
}
```

### Accept Application
**GET** `/api/distribution/accept/[uniqueId]`

**Response:**
```json
{
  "success": true,
  "message": "Distribution request accepted successfully",
  "request": {
    "id": 123,
    "businessName": "Smith Industrial Supply",
    "contactName": "John Smith",
    "status": "accepted",
    "acceptedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Decline Application
**GET** `/api/distribution/decline/[uniqueId]`

**Response:**
```json
{
  "success": true,
  "message": "Distribution request declined successfully",
  "request": {
    "id": 123,
    "businessName": "Smith Industrial Supply",
    "contactName": "John Smith",
    "status": "declined",
    "declinedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Distributors (for map)
**GET** `/api/distributors`

**Response:**
```json
{
  "distributors": [
    {
      "id": 1,
      "businessName": "Smith Industrial Supply",
      "contactName": "John Smith",
      "phoneNumber": "(555) 123-4567",
      "emailAddress": "john@smithindustrial.com",
      "address": "123 Industrial Blvd, Phoenix, AZ 85001",
      "website": "https://smithindustrial.com",
      "territory": "Arizona, New Mexico",
      "latitude": 33.4484,
      "longitude": -112.0740
    }
  ]
}
```

## 📧 Email System

### Email Templates

#### 1. Application Notification Email (`emails/distEmailTemplate.tsx`)
Sent to admin when new application is submitted.

**Features:**
- Professional Force Dowels branding
- Complete application details in organized sections
- Accept/Decline action buttons with secure URLs
- Responsive design for mobile and desktop
- Contact information prominently displayed

#### 2. Acceptance Email (`emails/distributor-acceptance-email.tsx`)
Sent to applicant when application is approved.

**Features:**
- Congratulatory messaging
- Welcome to distributor network
- Next steps and onboarding information
- Contact information for support
- Professional branding consistent with company

#### 3. Decline Email (`emails/distributor-decline-email.tsx`)
Sent to applicant when application is declined.

**Features:**
- Professional and respectful messaging
- Encouragement to reapply in the future
- Contact information for questions
- Maintains positive brand relationship

### Email Configuration
```env
RESEND_API_KEY=re_your_api_key
```

**Sender Configuration:**
- **From Address**: `Force Dowels <dist@forcedowels.com>`
- **Admin Recipient**: `info@forcedowels.com`
- **Reply-To**: `info@forcedowels.com`

## 🔄 Complete Workflow

### 1. Application Submission
1. User visits `/distributor-application`
2. Fills out comprehensive form with validation
3. Form data validated with Zod schema
4. Unique ID generated for secure accept/decline URLs
5. Application stored in `distribution_requests` table
6. Admin notification email sent with action buttons

### 2. Admin Review Process
1. Admin receives email with application details
2. Reviews application information
3. Clicks "Accept" or "Decline" button in email
4. Action processed via secure API endpoint
5. Database status updated
6. Applicant notification email sent

### 3. Acceptance Workflow
1. Admin clicks "Accept" link
2. API validates unique ID and current status
3. Status updated to "accepted" in database
4. New record created in `distributors` table
5. Geocoding performed for map integration
6. Acceptance email sent to applicant
7. Distributor appears in find-a-distributor map

### 4. Decline Workflow
1. Admin clicks "Decline" link
2. API validates unique ID and current status
3. Status updated to "declined" in database
4. Decline email sent to applicant
5. Application marked as processed

## 🗺️ Find-a-Distributor Integration

### Map Features
- **Interactive Map** - Shows approved distributor locations
- **Search Functionality** - Find distributors by ZIP code or city
- **Distributor Cards** - Display contact information and territory
- **Responsive Design** - Works on mobile and desktop
- **Real-time Data** - Automatically includes newly approved distributors

### Data Flow
1. Approved distributors automatically added to map
2. Geocoding performed during acceptance process
3. Map queries `/api/distributors` endpoint
4. Real-time updates without manual intervention

## 🔒 Security Features

### Secure URLs
- **UUID-based IDs** - Cryptographically secure unique identifiers
- **One-time Actions** - Accept/decline URLs work only once
- **Status Validation** - Prevents duplicate processing
- **Expiration Handling** - Could be extended with time-based expiration

### Data Protection
- **Input Validation** - All form inputs validated and sanitized
- **SQL Injection Prevention** - Parameterized queries
- **CSRF Protection** - Built-in Next.js security
- **Environment Variables** - Sensitive data stored securely

## 🧪 Testing the System

### Manual Testing Workflow
1. **Submit Test Application**
   - Visit `/distributor-application`
   - Fill out form with test data
   - Submit application

2. **Verify Email Delivery**
   - Check admin email for notification
   - Verify all form data appears correctly
   - Test accept/decline button functionality

3. **Test Accept Workflow**
   - Click "Accept" button in email
   - Verify success response
   - Check applicant receives acceptance email
   - Confirm distributor appears in find-a-distributor

4. **Test Decline Workflow**
   - Submit another test application
   - Click "Decline" button in email
   - Verify decline email sent to applicant
   - Confirm status updated in database

### Database Verification
```sql
-- Check application status
SELECT * FROM distribution_requests ORDER BY created_at DESC;

-- Check approved distributors
SELECT * FROM distributors WHERE is_active = true;

-- Verify email delivery logs (check Resend dashboard)
```

## 🔧 Customization & Extensions

### Adding Form Fields
1. Update Zod schema in `lib/distributor-validation.ts`
2. Add fields to form in `app/distributor-application/page.tsx`
3. Update database schema
4. Modify email templates to include new fields

### Email Template Customization
- Templates located in `emails/` directory
- Use React Email components for consistent styling
- Test templates with React Email preview
- Maintain Force Dowels branding guidelines

### Map Integration Enhancements
- Add filtering by business type or territory
- Implement distance-based search
- Add distributor ratings or reviews
- Include additional contact methods

This documentation provides a complete understanding of the distribution system architecture and workflows. For implementation details, see the source code in the respective directories.
