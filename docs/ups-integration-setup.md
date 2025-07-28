# UPS API Integration Setup Guide

This guide explains how to set up the UPS API integration for shipping rate calculations in the Force Dowels application.

## Overview

The application has been updated to use the UPS Rating API directly instead of USPS. This provides:

- **Direct integration** with UPS (no middleman)
- **Official UPS rates** and delivery times
- **Better control** over shipping options
- **Access to all UPS services**
- **More reliable service** for business shipping

## Prerequisites

1. **UPS Account**: You need a UPS business account
2. **UPS Developer Account**: Register at [developer.ups.com](https://developer.ups.com)

## Step-by-Step Setup

### 1. Register for UPS Developer Account

1. Go to [https://developer.ups.com](https://developer.ups.com)
2. Click "Get Started" or "Sign Up"
3. Create a new developer account
4. Verify your email address

### 2. Create an Application

1. Log into the UPS Developer Portal
2. Navigate to "My Apps" → "Create App"
3. Fill out the application form:
   - **App Name**: Force Dowels Shipping
   - **Description**: Shipping rate calculation for Force Dowels e-commerce
   - **APIs**: Select "Rating API"
   - **Environment**: Start with "Production" (UPS uses production for live rates)

### 3. Get API Credentials

After creating your app, you'll receive:
- **Client ID**
- **Client Secret**

### 4. Update Environment Variables

Add these to your `.env.local` file:

```env
# UPS API Credentials
UPS_CLIENT_ID=your_client_id_here
UPS_CLIENT_SECRET=your_client_secret_here
```

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Go to the checkout page
3. Enter a complete shipping address
4. Verify that UPS shipping options appear

## API Endpoints Used

### OAuth 2.0 Authentication
- **Endpoint**: `POST /oauth2/v3/token`
- **Purpose**: Get access token for API calls
- **Grant Type**: `client_credentials`

### Domestic Prices
- **Endpoint**: `POST /prices/v3/base-rates/search`
- **Purpose**: Get shipping rates for domestic packages
- **Services**: Ground Advantage, Priority Mail, Priority Mail Express

### Address Validation
- **Endpoint**: `GET /addresses/v3/address`
- **Purpose**: Validate and standardize addresses
- **Features**:
  - Real-time validation as user types
  - Address standardization
  - Delivery point validation
  - Address correction suggestions

### City/State Lookup
- **Endpoint**: `GET /addresses/v3/city-state`
- **Purpose**: Auto-fill city/state from ZIP code

## Supported USPS Services

The integration supports these USPS mail classes:

1. **USPS Ground Advantage**
   - Most economical option
   - 2-5 business days
   - Replaces Parcel Select Ground

2. **Priority Mail**
   - 1-3 business days
   - Includes tracking and insurance up to $100

3. **Priority Mail Express**
   - 1-2 business days
   - Guaranteed delivery
   - Includes tracking and insurance up to $100

## Package Dimensions

The system calculates package dimensions based on your dowel inventory:

```typescript
// Default dimensions per dowel
const DEFAULT_DOWEL_DIMENSIONS = {
  length: 12, // inches
  width: 1,   // inches
  height: 1,  // inches
  weight: 0.1 // pounds per dowel
};
```

**Adjust these values** in `lib/usps.ts` based on your actual packaging.

## Environment Configuration

### Development (Test Environment)
- **Base URL**: `https://apis-tem.usps.com`
- **Use test credentials**
- **No real charges**

### Production
- **Base URL**: `https://apis.usps.com`
- **Use production credentials**
- **Real shipping rates**

The environment is automatically detected based on `NODE_ENV`.

## Error Handling

The integration includes comprehensive error handling:

1. **API Authentication Errors**: Shows error message, no shipping options
2. **Network Errors**: Displays connection error message
3. **Invalid Addresses**: Shows validation errors with suggestions
4. **Rate Calculation Errors**: Provides detailed error information

## Package Size Estimation

The system uses predefined packaging tiers based on Force Dowels specifications:

### Packaging Tiers (Quantity → Package Type → Dimensions → Weight)
- **5,000 dowels** → Small box → 15×15×10 inches → 18.6 lbs
- **10,000 dowels** → Medium box → 18×18×11 inches → 38 lbs
- **15,000 dowels** → Large box → 19×19×12 inches → 56.6 lbs
- **20,000 dowels** → Box → 20×20×12 inches → 77 lbs
- **80,000 dowels** → 4 boxes/1 pallet → 40×48×6 inches → 458 lbs
- **160,000 dowels** → 8 boxes/1 pallet → 40×48×12 inches → 766 lbs
- **240,000 dowels** → 12 boxes/1 pallet → 40×48×18 inches → 1,074 lbs
- **320,000 dowels** → 16 boxes/1 pallet → 40×48×24 inches → 1,382 lbs
- **400,000 dowels** → 20 boxes/1 pallet → 40×48×30 inches → 1,690 lbs
- **480,000 dowels** → 24 boxes/1 pallet → 40×48×36 inches → 1,998 lbs
- **960,000 dowels** → 48 boxes/2 pallets → 40×48×36 inches per pallet → 4,000 lbs total

### Tier Selection Logic
The system automatically selects the appropriate tier based on order quantity using the `getTierForQuantity()` function in `lib/usps.ts`. This ensures consistent packaging calculations across all shipping providers (USPS, TQL).

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Verify Client ID and Secret are correct
   - Check if credentials are for the right environment (test/prod)

2. **"No shipping rates found"**
   - Verify package dimensions are reasonable
   - Check if destination address is valid
   - Ensure USPS services are available to that location

3. **"API quota exceeded"**
   - USPS APIs have rate limits
   - Consider implementing rate limiting in your application

### Debug Mode

Enable debug logging by checking the browser console and server logs for detailed API request/response information.



## Next Steps

1. **Get USPS credentials** and update environment variables
2. **Test thoroughly** with various addresses and package sizes
3. **Adjust package dimensions** based on your actual products
4. **Monitor API usage** and performance
5. **Consider implementing caching** for frequently requested routes

## Support

- **USPS API Documentation**: [developer.usps.com](https://developer.usps.com)
- **USPS API Support**: [Contact USPS API Support](https://emailus.usps.com/s/web-tools-inquiry)
- **GitHub Examples**: [USPS API Examples](https://github.com/USPS/api-examples)

## Benefits Realized

✅ **Cost Savings**: No EasyPost transaction fees
✅ **Direct Integration**: Official USPS rates and services
✅ **Better Control**: Full access to USPS shipping options
✅ **Reliability**: Direct connection to USPS systems
✅ **Compliance**: Official USPS API ensures rate accuracy
