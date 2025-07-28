# Shipping System

The Force Dowels application uses a dual-provider shipping system to handle orders of different sizes efficiently.

## Overview

The shipping system automatically routes orders to the appropriate provider based on quantity:

- **USPS** - For orders under 20,000 dowels (5K, 10K, 15K tiers)
- **TQL Freight** - For orders of 20,000+ dowels (palletized freight)

## Architecture

### Unified Shipping Service
The `UnifiedShippingService` class in `lib/shipping-service.ts` handles routing between providers:

```typescript
// Route to appropriate provider based on quantity
if (totalQuantity < 20000) {
  // Use USPS for orders under 20K
  return this.getUSPSRates(toAddress, cartItems);
} else {
  // Use TQL for orders >= 20K
  return this.getTQLRates(toAddress, cartItems);
}
```

### Packaging Tiers

The system uses consistent packaging tiers across all providers:

- **5,000 dowels** → Small Box → 15×15×10 inches → 18.6 lbs
- **10,000 dowels** → Medium Box → 18×18×11 inches → 38 lbs  
- **15,000 dowels** → Large Box → 19×19×12 inches → 56.6 lbs
- **20,000 dowels** → Box → 20×20×12 inches → 77 lbs
- **80,000+ dowels** → Pallets with increasing weights

## UPS Integration

### Configuration
```env
UPS_CLIENT_ID=your_client_id
UPS_CLIENT_SECRET=your_client_secret
```

### Features
- Real-time rate calculation
- Multiple service levels (Ground, Next Day Air, 2nd Day Air, etc.)
- Automatic package dimension calculation
- Delivery time estimates

### Implementation
Located in `lib/ups.ts` with functions:
- `getUPSShippingRates()` - Get rates for an address
- `getTierForQuantity()` - Determine packaging tier
- `calculatePackageDimensions()` - Calculate package specs

## TQL Freight Integration

### Configuration
```env
NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY=your_subscription_key
TQL_CLIENT_ID=your_client_id
TQL_CLIENT_SECRET=your_client_secret
TQL_USERNAME=your_username
TQL_PASSWORD=your_password
TQL_BASE_URL=https://public.api.tql.com
```

### Features
- LTL freight quotes for large orders
- Multiple carrier options
- Transit time estimates
- Commercial delivery focus

### Implementation
Located in `lib/tql-service.ts` with the `TQLService` class providing:
- OAuth token management
- Quote creation and retrieval
- Rate comparison across carriers

## API Endpoints

### Get Shipping Rates
**Endpoint**: `POST /api/shipping/rates`

**Request**:
```json
{
  "shippingAddress": {
    "name": "Customer Name",
    "address": "123 Main St",
    "city": "Phoenix",
    "state": "AZ",
    "zip": "85001",
    "country": "US"
  },
  "cartItems": [{
    "id": "force-dowels",
    "name": "Force Dowels",
    "quantity": 10000,
    "tier": "Tier 1",
    "pricePerUnit": 0.0275
  }]
}
```

**Response**:
```json
{
  "success": true,
  "provider": "UPS",
  "rates": [{
    "id": "ups-03-45.67",
    "service": "UPS Ground",
    "carrier": "UPS",
    "rate": 45.67,
    "currency": "USD",
    "delivery_days": 3,
    "provider": "UPS"
  }]
}
```

## Error Handling

### UPS Fallback
If UPS API fails, the system provides manual shipping recommendations.

### TQL Fallback
If TQL freight fails for large orders, manual freight quotes are recommended.

### Logging
Comprehensive logging helps debug shipping issues:
```javascript
console.log('🚚 Shipping calculation for:', {
  quantity: totalQuantity,
  provider: expectedProvider,
  destination: `${city}, ${state}`
});
```

## Testing

### Test Scripts
- `scripts/test-shipping-api.js` - Test the shipping API endpoint
- `scripts/test-usps-path.js` - Test USPS integration
- `scripts/test-tql-integration.js` - Test TQL integration
- `scripts/test-provider-routing.js` - Test provider routing logic

### Test Data
Use these test addresses for development:
```javascript
const testAddress = {
  name: "Test Customer",
  address: "123 Main St",
  city: "Phoenix",
  state: "AZ",
  zip: "85001",
  country: "US"
};
```

## Troubleshooting

### Common Issues

1. **No shipping rates returned**
   - Check API credentials
   - Verify address format
   - Check package dimensions

2. **Wrong provider selected**
   - Verify quantity thresholds
   - Check `getProviderForQuantity()` logic

3. **API authentication failures**
   - Verify environment variables
   - Check token expiration (TQL)
   - Validate API key format (USPS)

### Debug Mode
Enable detailed logging by checking console output during shipping calculations.

## Related Documentation

- [TQL API Implementation Guide](../ShippingCalculator/TQL_API_OVERVIEW.md)
- [TQL Full API Documentation](../ShippingCalculator/FULL_DOCUMENTATION.md)
- [USPS Integration Setup](../usps-integration-setup.md)
