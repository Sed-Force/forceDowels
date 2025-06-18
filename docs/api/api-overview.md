# API Overview

The Force Dowels application provides a RESTful API built with Next.js API Routes. This document provides an overview of all available endpoints and their usage.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://forcedowels.com/api`

## Authentication

Most API endpoints require authentication using Clerk. Include the session token in your requests:

```javascript
// Client-side (automatic with Clerk)
const response = await fetch('/api/protected-endpoint')

// Server-side
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
if (!userId) {
  return new Response('Unauthorized', { status: 401 })
}
```

## API Endpoints

### Authentication Endpoints
- **Clerk Webhooks**: `/api/clerk/webhooks` - Handle Clerk user events
- **Session Management**: Handled by Clerk middleware

### Payment Endpoints
- **Create Checkout Session**: `POST /api/stripe/create-checkout-session`
- **Webhook Handler**: `POST /api/stripe/webhooks`
- **Session Status**: `GET /api/stripe/session-status`

### Business Endpoints
- **Distributor Application**: `POST /api/distributor-application`
- **Contact Form**: `POST /api/send-email`

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation errors
- **500 Internal Server Error** - Server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Email endpoints**: 10 requests per minute per IP
- **Payment endpoints**: 50 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Common Error Codes

#### Authentication Errors
- `AUTH_REQUIRED` - Authentication token missing
- `AUTH_INVALID` - Invalid authentication token
- `AUTH_EXPIRED` - Authentication token expired

#### Validation Errors
- `VALIDATION_ERROR` - Request data validation failed
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_FORMAT` - Data format invalid

#### Business Logic Errors
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `DUPLICATE_RESOURCE` - Resource already exists
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

#### External Service Errors
- `STRIPE_ERROR` - Stripe payment processing error
- `EMAIL_ERROR` - Email delivery error
- `CLERK_ERROR` - Clerk authentication error

### Error Response Examples

#### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "phone": "Phone number is required"
      }
    }
  }
}
```

#### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required to access this resource"
  }
}
```

## Request/Response Examples

### Create Checkout Session
```javascript
// Request
POST /api/stripe/create-checkout-session
Content-Type: application/json

{
  "items": [
    {
      "name": "Force Dowels Kit",
      "price": 2999,
      "quantity": 2
    }
  ],
  "customerEmail": "customer@example.com",
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postal_code": "12345",
    "country": "US"
  }
}

// Response
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

### Submit Distributor Application
```javascript
// Request
POST /api/distributor-application
Content-Type: application/json

{
  "contactInfo": {
    "fullName": "John Doe",
    "businessName": "Doe Cabinets",
    "email": "john@doecabinets.com",
    "phone": "+1-555-123-4567"
  },
  "businessAddress": {
    "street": "456 Business Ave",
    "city": "Commerce City",
    "state": "TX",
    "zipCode": "75001"
  },
  "businessDetails": {
    "businessType": "retailer",
    "yearsInBusiness": 5,
    "territory": "North Texas region",
    "monthlyVolume": "1000-5000"
  }
}

// Response
{
  "success": true,
  "data": {
    "applicationId": "app_123456",
    "status": "submitted",
    "submittedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Application submitted successfully"
}
```

## Webhooks

### Stripe Webhooks
The application handles Stripe webhooks for payment processing:

**Endpoint**: `POST /api/stripe/webhooks`

**Events Handled**:
- `checkout.session.completed` - Payment successful
- `payment_intent.payment_failed` - Payment failed

**Webhook Verification**:
All webhooks are verified using Stripe's signature verification.

### Clerk Webhooks
Handle user lifecycle events from Clerk:

**Endpoint**: `POST /api/clerk/webhooks`

**Events Handled**:
- `user.created` - New user registration
- `user.updated` - User profile updates
- `user.deleted` - User account deletion

## SDK and Client Libraries

### JavaScript/TypeScript Client
```javascript
// API client utility
class ForceDownelsAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed')
    }
    
    return data
  }

  // Payment methods
  async createCheckoutSession(items, customerInfo) {
    return this.request('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ items, ...customerInfo }),
    })
  }

  // Distributor methods
  async submitDistributorApplication(applicationData) {
    return this.request('/distributor-application', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    })
  }
}

// Usage
const api = new ForceDownelsAPI()
```

## Testing

### API Testing with curl
```bash
# Test distributor application endpoint
curl -X POST http://localhost:3000/api/distributor-application \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "fullName": "Test User",
      "businessName": "Test Business",
      "email": "test@example.com",
      "phone": "555-123-4567"
    }
  }'
```

### Integration Testing
```javascript
// Example test
describe('API Integration Tests', () => {
  test('should create checkout session', async () => {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ name: 'Test Product', price: 1000, quantity: 1 }],
        customerEmail: 'test@example.com'
      })
    })

    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.sessionId).toBeDefined()
  })
})
```

## API Versioning

Currently, the API is version 1 (v1) and is considered stable. Future versions will be introduced with proper deprecation notices.

## Support and Documentation

- **API Documentation**: Individual endpoint documentation in respective files
- **Postman Collection**: Available for testing
- **OpenAPI Spec**: Generated specification available
- **Support**: Contact development team for API-related issues

For detailed endpoint documentation, see:
- [Authentication API](authentication-api.md)
- [Payment API](payment-api.md)
- [Distributor API](distributor-api.md)
