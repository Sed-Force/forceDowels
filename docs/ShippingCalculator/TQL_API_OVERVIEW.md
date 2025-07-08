# TQL Shipping API Implementation Guide

## Overview
This guide covers the implementation of TQL's LTL (Less Than Truckload) API for Force Dowels shipping calculations.

## Step-by-Step Implementation Tasks

### TASK 1: Environment Setup
```bash
# Required environment variables
NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY=your_subscription_key
TQL_CLIENT_ID=your_client_id
TQL_CLIENT_SECRET=your_client_secret
TQL_USERNAME=your_trax_username
TQL_PASSWORD=your_trax_password
TQL_BASE_URL=https://public.api.tql.com
TQL_TEST_BASE_URL=https://public.api.tql.com/test-ltl
```

### TASK 2: Create Authentication Utility
**File:** `lib/tql-auth.js`
```javascript
export async function getTQLToken() {
  const scopes = [
    'https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Read',
    'https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Write'
  ].join(' ');

  const body = new URLSearchParams({
    client_id: process.env.TQL_CLIENT_ID,
    client_secret: process.env.TQL_CLIENT_SECRET,
    scope: scopes,
    grant_type: 'password',
    username: process.env.TQL_USERNAME,
    password: process.env.TQL_PASSWORD
  });

  const response = await fetch(`${process.env.TQL_BASE_URL}/identity/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  return response.json();
}
```

### TASK 3: Create Data Transformation Utilities
**File:** `lib/tql-transform.js`
```javascript
// Transform ecommerce cart data to TQL format
export function transformCartToTQLQuote(cartData) {
  const { items, origin, destination, shipmentDate } = cartData;

  // Combine items into commodities
  const quoteCommodities = items.map(item => ({
    freightClassCode: item.freightClass || "110", // Default freight class
    unitTypeCode: item.unitType || "PLT", // PLT, BOX, CARTON, etc.
    description: item.name || item.description,
    quantity: item.quantity,
    weight: item.weight,
    dimensionLength: item.dimensions.length,
    dimensionWidth: item.dimensions.width,
    dimensionHeight: item.dimensions.height,
    isHazmat: item.isHazmat || false,
    isStackable: item.isStackable || true
  }));

  return {
    accessorials: [], // Add special services if needed
    quoteCommodities,
    pickLocationType: origin.locationType || "Commercial",
    dropLocationType: destination.locationType || "Commercial", 
    shipmentDate: shipmentDate || new Date().toISOString(),
    origin: {
      postalCode: origin.zipCode,
      city: origin.city,
      state: origin.state,
      country: origin.country || "USA"
    },
    destination: {
      postalCode: destination.zipCode,
      city: destination.city,
      state: destination.state,
      country: destination.country || "USA"
    }
  };
}

// Transform TQL response to standardized format
export function transformTQLResponse(tqlResponse) {
  if (!tqlResponse.content || !tqlResponse.content.carrierPrices) {
    return [];
  }

  return tqlResponse.content.carrierPrices.map(price => ({
    id: price.id,
    carrier: price.carrier,
    scac: price.scac,
    rate: price.customerRate,
    serviceLevel: price.serviceLevel,
    serviceLevelDescription: price.serviceLevelDescription,
    transitDays: price.transitDays,
    isPreferred: price.isPreferred,
    isEconomy: price.isEconomy,
    priceBreakdown: price.priceCharges || []
  }));
}
```

### TASK 4: Create TQL API Service
**File:** `lib/tql-service.js`
```javascript
import { getTQLToken } from './tql-auth.js';

export class TQLService {
  constructor() {
    this.baseUrl = process.env.TQL_BASE_URL;
    this.subscriptionKey = process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY;
  }

  async createQuote(quoteData) {
    const token = await getTQLToken();
    
    const response = await fetch(`${this.baseUrl}/ltl/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Authorization': `Bearer ${token.access_token}`
      },
      body: JSON.stringify(quoteData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Quote creation failed: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async getQuote(quoteId) {
    const token = await getTQLToken();
    
    const response = await fetch(`${this.baseUrl}/ltl/quotes/${quoteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Authorization': `Bearer ${token.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Quote retrieval failed: ${response.status}`);
    }

    return response.json();
  }
}
```

### TASK 5: Create API Route Handler
**File:** `app/api/shipping/quote/route.js` (App Router) OR `pages/api/shipping/quote.js` (Pages Router)

**App Router Version:**
```javascript
import { NextResponse } from 'next/server';
import { TQLService } from '@/lib/tql-service';
import { transformCartToTQLQuote, transformTQLResponse } from '@/lib/tql-transform';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.items || !body.origin || !body.destination) {
      return NextResponse.json(
        { error: 'Missing required fields: items, origin, destination' },
        { status: 400 }
      );
    }

    // Transform data
    const quoteData = transformCartToTQLQuote(body);
    
    // Call TQL API
    const tqlService = new TQLService();
    const tqlResponse = await tqlService.createQuote(quoteData);
    
    // Transform response
    const rates = transformTQLResponse(tqlResponse);
    
    return NextResponse.json({
      success: true,
      quoteId: tqlResponse.content.quoteId,
      rates,
      requestId: tqlResponse.content.quoteId
    });

  } catch (error) {
    console.error('Shipping quote error:', error);
    return NextResponse.json(
      { error: 'Failed to get shipping rates', details: error.message },
      { status: 500 }
    );
  }
}
```

### TASK 6: Create Shipping Calculator Hook
**File:** `hooks/useShippingCalculator.js`
```javascript
import { useState, useCallback } from 'react';

export function useShippingCalculator() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quoteId, setQuoteId] = useState(null);

  const calculateShipping = useCallback(async (cartData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate shipping');
      }

      setRates(data.rates);
      setQuoteId(data.quoteId);
      return data.rates;

    } catch (err) {
      setError(err.message);
      setRates([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRates = useCallback(() => {
    setRates([]);
    setError(null);
    setQuoteId(null);
  }, []);

  return {
    rates,
    loading,
    error,
    quoteId,
    calculateShipping,
    clearRates
  };
}
```

### TASK 7: Create Shipping Calculator Component
**File:** `components/ShippingCalculator.jsx`
```javascript
'use client';
import { useState } from 'react';
import { useShippingCalculator } from '@/hooks/useShippingCalculator';

export default function ShippingCalculator({ 
  cartItems, 
  onRateSelect, 
  origin, 
  destination 
}) {
  const { rates, loading, error, calculateShipping } = useShippingCalculator();
  const [selectedRate, setSelectedRate] = useState(null);

  const handleCalculate = async () => {
    try {
      await calculateShipping({
        items: cartItems,
        origin,
        destination,
        shipmentDate: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to calculate shipping:', err);
    }
  };

  const handleRateSelect = (rate) => {
    setSelectedRate(rate);
    onRateSelect?.(rate);
  };

  return (
    <div className="shipping-calculator">
      <div className="calculator-header">
        <h3>Shipping Options</h3>
        <button 
          onClick={handleCalculate}
          disabled={loading || !cartItems?.length}
          className="calculate-btn"
        >
          {loading ? 'Calculating...' : 'Get Shipping Rates'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {rates.length > 0 && (
        <div className="rates-list">
          {rates.map((rate) => (
            <div 
              key={rate.id}
              className={`rate-option ${selectedRate?.id === rate.id ? 'selected' : ''}`}
              onClick={() => handleRateSelect(rate)}
            >
              <div className="rate-header">
                <span className="carrier">{rate.carrier}</span>
                <span className="price">${rate.rate.toFixed(2)}</span>
              </div>
              <div className="rate-details">
                <span className="service">{rate.serviceLevelDescription}</span>
                <span className="transit">{rate.transitDays} business days</span>
                {rate.isPreferred && <span className="badge">TQL Preferred</span>}
                {rate.isEconomy && <span className="badge economy">Economy</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### TASK 8: Create Product Data Schema
**File:** `lib/product-schema.js`
```javascript
// Define required product fields for shipping calculations
export const ProductShippingSchema = {
  // Required fields
  id: String,
  name: String,
  quantity: Number,
  weight: Number, // in pounds
  dimensions: {
    length: Number, // in inches
    width: Number,  // in inches  
    height: Number  // in inches
  },
  
  // Optional fields with defaults
  freightClass: String, // Default: "110"
  unitType: String,     // Default: "PLT" (pallet)
  isHazmat: Boolean,    // Default: false
  isStackable: Boolean, // Default: true
  nmfcCode: String,     // National Motor Freight Classification
  pieceCaseCount: Number
};

// Freight class reference
export const FreightClasses = {
  '50': 'Clean freight, very dense',
  '55': 'Bricks, cement, mortar',
  '60': 'Car accessories, car parts',
  '65': 'Car accessories, books, bottled beverages',
  '70': 'Food items, car accessories',
  '77.5': 'Tires, bathroom fixtures',
  '85': 'Crated machinery, cast iron',
  '92.5': 'Computers, monitors, appliances',
  '100': 'Wine cases, caskets',
  '110': 'Cabinets, framed artwork, table saw',
  '125': 'Small household appliances',
  '150': 'Auto sheet metal parts, bookcases',
  '175': 'Clothing, couches, stuffed furniture',
  '200': 'Auto sheet metal parts, aircraft parts',
  '250': 'Bamboo furniture, mattress, plasma TV',
  '300': 'Wood cabinets, setup kitchen cabinets',
  '400': 'Deer stands',
  '500': 'Bags of gold dust, ping pong balls'
};

// Unit type reference  
export const UnitTypes = {
  'PLT': 'Pallet',
  'BOX': 'Box',
  'CARTON': 'Carton', 
  'CRATE': 'Crate',
  'DRUM': 'Drum',
  'ROLL': 'Roll',
  'PIECES': 'Pieces',
  'CASE': 'Case',
  'BUNDLE': 'Bundle'
};
```

### TASK 9: Create Address Validation Utility
**File:** `lib/address-validation.js`
```javascript
export function validateShippingAddress(address) {
  const errors = [];
  
  if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
    errors.push('Valid ZIP code is required');
  }
  
  if (!address.city || address.city.trim().length < 2) {
    errors.push('City is required');
  }
  
  if (!address.state || !/^[A-Z]{2}$/.test(address.state)) {
    errors.push('Valid 2-letter state code is required');
  }
  
  const validLocationTypes = ['Commercial', 'Residential', 'Limited Access', 'Trade Show'];
  if (address.locationType && !validLocationTypes.includes(address.locationType)) {
    errors.push('Invalid location type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCartItems(items) {
  const errors = [];
  
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Cart must contain at least one item');
    return { isValid: false, errors };
  }
  
  items.forEach((item, index) => {
    if (!item.weight || item.weight <= 0) {
      errors.push(`Item ${index + 1}: Weight must be greater than 0`);
    }
    
    if (!item.dimensions || 
        !item.dimensions.length || 
        !item.dimensions.width || 
        !item.dimensions.height) {
      errors.push(`Item ${index + 1}: All dimensions (length, width, height) are required`);
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### TASK 10: Add Error Handling and Logging
**File:** `lib/error-handler.js`
```javascript
export class ShippingError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'ShippingError';
    this.code = code;
    this.details = details;
  }
}

export function handleTQLError(error, context = '') {
  console.error(`TQL API Error ${context}:`, error);
  
  // Map TQL error codes to user-friendly messages
  const errorMap = {
    400: 'Invalid shipping information provided',
    401: 'Authentication failed - please check API credentials',
    403: 'Access denied - insufficient permissions',
    404: 'Shipping service not available for this route',
    500: 'Shipping service temporarily unavailable'
  };
  
  if (error.status && errorMap[error.status]) {
    throw new ShippingError(errorMap[error.status], error.status, error);
  }
  
  throw new ShippingError('Shipping calculation failed', 'UNKNOWN', error);
}
```

## Implementation Checklist

### Phase 1: Setup (Complete these first)
- [ ] Set up environment variables
- [ ] Create authentication utility (`lib/tql-auth.js`)
- [ ] Create TQL service class (`lib/tql-service.js`)
- [ ] Test authentication with TQL API

### Phase 2: Core Functionality
- [ ] Create data transformation utilities (`lib/tql-transform.js`)
- [ ] Create API route handler (`app/api/shipping/quote/route.js`)
- [ ] Create validation utilities (`lib/address-validation.js`)
- [ ] Test basic quote creation

### Phase 3: Frontend Integration
- [ ] Create shipping calculator hook (`hooks/useShippingCalculator.js`)
- [ ] Create shipping calculator component (`components/ShippingCalculator.jsx`)
- [ ] Add error handling (`lib/error-handler.js`)
- [ ] Create product schema reference (`lib/product-schema.js`)

### Phase 4: Testing & Optimization
- [ ] Test with various product combinations
- [ ] Test error scenarios
- [ ] Add rate limiting/caching if needed
- [ ] Optimize for performance

## Key Integration Points

1. **Product Catalog**: Ensure products have required shipping data (weight, dimensions, freight class)
2. **Checkout Flow**: Integrate shipping calculator into checkout process
3. **Cart Management**: Connect with existing cart state management
4. **Address Collection**: Ensure shipping addresses are properly validated
5. **Rate Selection**: Store selected shipping rate for order processing

## Testing Strategy

1. **Unit Tests**: Test individual utilities and transformations
2. **Integration Tests**: Test API route handlers
3. **E2E Tests**: Test complete shipping calculation flow
4. **Error Testing**: Test various error scenarios
5. **Load Testing**: Test with multiple concurrent requests

## Additional Considerations

### Rate Limiting & Caching
Consider implementing rate limiting and caching for quotes to avoid excessive API calls:

```javascript
// Example caching implementation
const quoteCache = new Map();

function getCacheKey(quoteData) {
  return JSON.stringify({
    items: quoteData.quoteCommodities,
    origin: quoteData.origin,
    destination: quoteData.destination
  });
}

export async function getCachedQuote(quoteData) {
  const cacheKey = getCacheKey(quoteData);
  const cached = quoteCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 minutes
    return cached.data;
  }
  
  const result = await tqlService.createQuote(quoteData);
  quoteCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}
```

### Performance Optimization
- Cache tokens until expiration
- Implement request deduplication
- Add loading states and optimistic updates
- Consider server-side caching for common routes

### Security Considerations
- Store API credentials securely
- Validate all input data
- Implement rate limiting
- Log security events
- Use HTTPS for all API calls

This comprehensive guide provides a complete implementation path for an AI agent to build the TQL shipping integration systematically.