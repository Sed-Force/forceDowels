// USPS shipping service for calculating real-time shipping rates
import { CartItem } from '@/contexts/cart-context';

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface USPSRate {
  id: string;
  service: string;
  carrier: string;
  rate: number;
  currency: string;
  delivery_days?: number;
  delivery_date?: string;
  delivery_date_guaranteed?: boolean;
  mailClass: string;
  description: string;
}

export interface USPSPackageDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

// Default dimensions for Force Dowels (update with real measurements)
const DEFAULT_DOWEL_DIMENSIONS = {
  length: 12, // inches - length of individual dowel
  width: 0.5, // inches - diameter of dowel
  height: 0.5, // inches - diameter of dowel
  weight: 0.05 // pounds per dowel - UPDATE THIS WITH REAL WEIGHT
};

// Your business address (from address for shipping calculations)
const FROM_ADDRESS = {
  name: "Force Dowel Company",
  streetAddress: "4455 E Nunneley Rd, Ste 103",
  city: "Gilbert",
  state: "AZ",
  zip: "85296",
  country: "US"
};

// USPS API configuration
const USPS_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://apis.usps.com' 
  : 'https://apis-tem.usps.com'; // Test environment

/**
 * Calculate package dimensions and weight based on cart items
 * Estimates realistic package size for dowels bundled together
 * Handles large orders by splitting into multiple packages if needed
 */
function calculatePackageDimensions(items: CartItem[]): USPSPackageDimensions {
  const totalDowels = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total weight
  const weight = totalDowels * DEFAULT_DOWEL_DIMENSIONS.weight;

  // USPS size limits for different mail classes
  const MAX_DIMENSIONS = {
    GROUND_ADVANTAGE: { length: 108, width: 108, height: 108, weight: 70 }, // inches and lbs
    PRIORITY: { length: 108, width: 108, height: 108, weight: 70 },
    EXPRESS: { length: 108, width: 108, height: 108, weight: 70 }
  };

  // Estimate package dimensions based on dowel bundling
  const dowelLength = DEFAULT_DOWEL_DIMENSIONS.length;

  // For large orders, we need to be more conservative with packaging
  let bundleWidth, bundleHeight;

  if (totalDowels <= 25) {
    // Small bundle: arrange in a single layer
    const dowelesPerRow = Math.ceil(Math.sqrt(totalDowels));
    const rows = Math.ceil(totalDowels / dowelesPerRow);
    bundleWidth = dowelesPerRow * DEFAULT_DOWEL_DIMENSIONS.width;
    bundleHeight = rows * DEFAULT_DOWEL_DIMENSIONS.height;
  } else if (totalDowels <= 100) {
    // Medium bundle: more compact arrangement
    const dowelesPerRow = Math.ceil(Math.sqrt(totalDowels / 3));
    const layers = Math.ceil(totalDowels / (dowelesPerRow * dowelesPerRow));
    bundleWidth = dowelesPerRow * DEFAULT_DOWEL_DIMENSIONS.width;
    bundleHeight = layers * DEFAULT_DOWEL_DIMENSIONS.height;
  } else {
    // Large orders: assume multiple packages or freight shipping
    // For now, calculate as if it's a very compact bundle
    const dowelesPerRow = Math.ceil(Math.sqrt(totalDowels / 10));
    const layers = Math.ceil(totalDowels / (dowelesPerRow * dowelesPerRow));
    bundleWidth = Math.min(dowelesPerRow * DEFAULT_DOWEL_DIMENSIONS.width, 24); // Max 24" width
    bundleHeight = Math.min(layers * DEFAULT_DOWEL_DIMENSIONS.height, 24); // Max 24" height
  }

  // Add packaging material (box, padding, etc.)
  const packagingPadding = 2; // inches of padding
  let length = dowelLength + packagingPadding;
  let width = bundleWidth + packagingPadding;
  let height = bundleHeight + packagingPadding;

  // Ensure we don't exceed USPS limits for Ground Advantage
  const maxDim = MAX_DIMENSIONS.GROUND_ADVANTAGE;
  length = Math.min(length, maxDim.length);
  width = Math.min(width, maxDim.width);
  height = Math.min(height, maxDim.height);

  // Ensure minimum USPS package dimensions
  const finalLength = Math.max(length, 6);
  const finalWidth = Math.max(width, 4);
  const finalHeight = Math.max(height, 1);

  // Add packaging weight (box, padding, etc.)
  const packagingWeight = totalDowels > 100 ? 2.0 : 0.5; // Heavier packaging for large orders
  let finalWeight = weight + packagingWeight;

  // If weight exceeds USPS limits, cap it (this would require multiple packages in reality)
  if (finalWeight > maxDim.weight) {
    console.warn(`Package weight ${finalWeight} lbs exceeds USPS limit. Capping at ${maxDim.weight} lbs.`);
    finalWeight = maxDim.weight;
  }

  // Minimum weight
  finalWeight = Math.max(finalWeight, 1);

  console.log(`Package estimation for ${totalDowels} dowels:`, {
    dimensions: `${finalLength}" x ${finalWidth}" x ${finalHeight}"`,
    weight: `${finalWeight} lbs`,
    dowelWeight: `${weight} lbs`,
    packagingWeight: `${packagingWeight} lbs`,
    note: totalDowels > 500 ? 'Large order - may require multiple packages' : ''
  });

  return {
    length: finalLength,
    width: finalWidth,
    height: finalHeight,
    weight: finalWeight
  };
}

/**
 * Get OAuth 2.0 access token from USPS
 */
async function getUSPSAccessToken(): Promise<string> {
  const clientId = process.env.USPS_CLIENT_ID;
  const clientSecret = process.env.USPS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('USPS API credentials not configured');
  }

  try {
    // USPS OAuth 2.0 endpoint - using form data instead of JSON
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    console.log('USPS OAuth request to:', `${USPS_BASE_URL}/oauth2/v3/token`);
    console.log('USPS OAuth params:', { grant_type: 'client_credentials', client_id: clientId });

    const response = await fetch(`${USPS_BASE_URL}/oauth2/v3/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log('USPS OAuth response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('USPS OAuth error response:', errorText);
      throw new Error(`USPS OAuth failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('USPS OAuth success, token received');
    return data.access_token;
  } catch (error) {
    console.error('USPS OAuth error:', error);
    throw new Error('Failed to authenticate with USPS API');
  }
}

/**
 * Get shipping rates from USPS Domestic Prices API
 */
export async function getUSPSShippingRates(
  toAddress: ShippingAddress,
  items: CartItem[]
): Promise<USPSRate[]> {
  try {
    const accessToken = await getUSPSAccessToken();
    const dimensions = calculatePackageDimensions(items);
    
    // Determine processing category based on package size
    const isLargePackage = dimensions.length > 12 || dimensions.width > 12 || dimensions.height > 12 || dimensions.weight > 20;
    const processingCategory = isLargePackage ? "NON_MACHINABLE" : "MACHINABLE";

    // USPS Domestic Prices API request
    const requestBody = {
      originZIPCode: FROM_ADDRESS.zip,
      destinationZIPCode: toAddress.zip,
      destinationEntryFacilityType: "NONE", // Required field
      weight: dimensions.weight,
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      mailClass: "USPS_GROUND_ADVANTAGE", // Default mail class
      processingCategory: processingCategory,
      rateIndicator: "SP", // Single piece
      priceType: "COMMERCIAL",
      mailingDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    };

    console.log('USPS API request:', requestBody);

    const response = await fetch(`${USPS_BASE_URL}/prices/v3/base-rates/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('USPS API error response:', errorText);
      throw new Error(`USPS API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('USPS API response:', data);

    // Convert USPS response to our format
    const rates: USPSRate[] = [];
    
    if (data.rates && Array.isArray(data.rates)) {
      data.rates.forEach((rate: any) => {
        rates.push({
          id: rate.SKU || `usps-${rate.mailClass}-${rate.price}`,
          service: rate.mailClass || 'USPS Service',
          carrier: 'USPS',
          rate: parseFloat(rate.price) || 0,
          currency: 'USD',
          mailClass: rate.mailClass,
          description: rate.description || `USPS ${rate.mailClass}`,
          delivery_days: rate.serviceStandard || undefined,
        });
      });
    }

    // If no rates returned, try multiple mail classes
    if (rates.length === 0) {
      const mailClasses = ['USPS_GROUND_ADVANTAGE', 'PRIORITY_MAIL', 'PRIORITY_MAIL_EXPRESS'];
      
      for (const mailClass of mailClasses) {
        try {
          const classResponse = await fetch(`${USPS_BASE_URL}/prices/v3/base-rates/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              ...requestBody,
              mailClass,
              destinationEntryFacilityType: "NONE",
              processingCategory: processingCategory
            }),
          });

          if (classResponse.ok) {
            const classData = await classResponse.json();
            if (classData.rates && Array.isArray(classData.rates)) {
              classData.rates.forEach((rate: any) => {
                rates.push({
                  id: rate.SKU || `usps-${rate.mailClass}-${rate.price}`,
                  service: rate.mailClass || mailClass,
                  carrier: 'USPS',
                  rate: parseFloat(rate.price) || 0,
                  currency: 'USD',
                  mailClass: rate.mailClass || mailClass,
                  description: rate.description || `USPS ${mailClass}`,
                  delivery_days: rate.serviceStandard || undefined,
                });
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to get rates for ${mailClass}:`, error);
        }
      }
    }

    // Sort by price (cheapest first)
    return rates.sort((a, b) => a.rate - b.rate);

  } catch (error) {
    console.error('USPS shipping calculation error:', error);
    throw new Error('Failed to calculate USPS shipping rates');
  }
}

/**
 * Validate an address using USPS Address API v3
 * https://developer.usps.com/addressesv3
 */
export async function validateUSPSAddress(address: ShippingAddress): Promise<{
  valid: boolean;
  standardizedAddress?: ShippingAddress;
  suggestions?: ShippingAddress[];
  deliverable?: boolean;
  error?: string;
  details?: any;
}> {
  try {
    const accessToken = await getUSPSAccessToken();

    // Build query parameters for USPS Address API v3
    const params = new URLSearchParams({
      streetAddress: address.address.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      ZIPCode: address.zip.replace(/\D/g, '') // Remove non-digits from ZIP
    });

    console.log('USPS Address Validation request:', params.toString());

    const response = await fetch(`${USPS_BASE_URL}/addresses/v3/address?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('USPS Address validation error:', response.status, errorText);

      return {
        valid: false,
        error: `Address validation failed: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log('USPS Address validation response:', data);

    // Check if address was successfully validated and standardized
    if (data.address) {
      const standardized = {
        name: address.name,
        address: data.address.streetAddress || address.address,
        city: data.address.city || address.city,
        state: data.address.state || address.state,
        zip: data.address.ZIPCode || address.zip,
        country: address.country
      };

      // Check delivery confirmation if available
      const deliverable = data.addressAdditionalInfo?.DPVConfirmation === 'Y';
      const business = data.addressAdditionalInfo?.business === 'Y';
      const vacant = data.addressAdditionalInfo?.vacant === 'Y';

      return {
        valid: true,
        standardizedAddress: standardized,
        deliverable,
        details: {
          deliveryPoint: data.addressAdditionalInfo?.deliveryPoint,
          carrierRoute: data.addressAdditionalInfo?.carrierRoute,
          business,
          vacant,
          dpvConfirmation: data.addressAdditionalInfo?.DPVConfirmation,
          originalInput: address,
          standardizedOutput: standardized
        }
      };
    }

    // Check for address corrections or suggestions
    if (data.addressCorrections) {
      const suggestions = data.addressCorrections.map((correction: any) => ({
        name: address.name,
        address: correction.streetAddress || address.address,
        city: correction.city || address.city,
        state: correction.state || address.state,
        zip: correction.ZIPCode || address.zip,
        country: address.country
      }));

      return {
        valid: false,
        suggestions,
        error: 'Address needs correction',
        details: data.addressCorrections
      };
    }

    // If we get here, address validation was inconclusive
    return {
      valid: false,
      error: 'Address could not be validated',
      details: data
    };

  } catch (error) {
    console.error('USPS address validation error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate address'
    };
  }
}

/**
 * Get city and state from ZIP code using USPS API
 */
export async function getCityStateFromZip(zipCode: string): Promise<{
  success: boolean;
  city?: string;
  state?: string;
  error?: string;
}> {
  try {
    const accessToken = await getUSPSAccessToken();

    const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5); // Clean and limit to 5 digits

    const params = new URLSearchParams({
      ZIPCode: cleanZip
    });

    const response = await fetch(`${USPS_BASE_URL}/addresses/v3/city-state?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to lookup city/state'
      };
    }

    const data = await response.json();

    if (data.city && data.state) {
      return {
        success: true,
        city: data.city,
        state: data.state
      };
    }

    return {
      success: false,
      error: 'Invalid ZIP code'
    };

  } catch (error) {
    console.error('USPS city/state lookup error:', error);
    return {
      success: false,
      error: 'Failed to lookup city/state'
    };
  }
}
