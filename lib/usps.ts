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

// Tier data for Force Dowels packaging and shipping
// Updated with corrected packaging specifications
export const TIER_DATA = [
  { tierName: "Small Box",             maxQty: 5_000,     pkgCount: 1,
    pkgType: "BOX",    weightLbs:  18.6, dimsIn: [15, 15, 10] },   // 1 small box
  { tierName: "Medium Box",            maxQty: 10_000,    pkgCount: 1,
    pkgType: "BOX",    weightLbs:  38,   dimsIn: [18, 18, 11] },   // 1 medium box
  { tierName: "Large Box",             maxQty: 15_000,    pkgCount: 1,
    pkgType: "BOX",    weightLbs:  56.6, dimsIn: [19, 19, 12] },   // 1 large box (18.6 + 38 = 56.6 lbs)
  { tierName: "Box",                   maxQty: 20_000,    pkgCount: 1,
    pkgType: "BOX",    weightLbs:  77,   dimsIn: [20, 20, 12] },   // 1 box
  { tierName: "Pallet-4-box",          maxQty: 80_000,    pkgCount: 1,
    pkgType: "PALLET", weightLbs: 458,   dimsIn: [40, 48,  6] },   // 1 pallet / 4 boxes
  { tierName: "Pallet-8-box",          maxQty:160_000,    pkgCount: 1,
    pkgType: "PALLET", weightLbs: 766,   dimsIn: [40, 48, 12] },   // 1 pallet / 8 boxes
  { tierName: "Pallet-12-box",         maxQty:240_000,    pkgCount: 1,
    pkgType: "PALLET", weightLbs:1_074,  dimsIn: [40, 48, 18] },   // 1 pallet / 12 boxes
  { tierName: "Pallet-16-box",         maxQty:320_000,    pkgCount: 1,
    pkgType: "PALLET", weightLbs:1_382,  dimsIn: [40, 48, 24] },   // 1 pallet / 16 boxes
  { tierName: "Pallet-20-box",         maxQty:400_000,    pkgCount: 1,
    pkgType: "PALLET", weightLbs:1_690,  dimsIn: [40, 48, 30] },   // 1 pallet / 20 boxes
  { tierName: "Pallet-24-box",         maxQty:480_000,    pkgCount: 1,
    pkgType: "PALLET", weightLbs:1_998,  dimsIn: [40, 48, 36] },   // 1 pallet / 24 boxes
  { tierName: "Two-Pallet (48 boxes)", maxQty:960_000,    pkgCount: 2,
    pkgType: "PALLET", weightLbs:2_000,  dimsIn: [40, 48, 36] }    // 2 pallets, 2,000 lbs each (4,000 lbs total)
];

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
 * Get the appropriate tier for a given quantity
 */
export function getTierForQuantity(quantity: number) {
  // Find the tier that can handle this quantity
  for (const tier of TIER_DATA) {
    if (quantity <= tier.maxQty) {
      return tier;
    }
  }
  // If quantity exceeds all tiers, use the largest tier
  return TIER_DATA[TIER_DATA.length - 1];
}

/**
 * Calculate package dimensions and weight based on cart items using tier data
 * Uses predefined tier brackets for accurate shipping calculations
 */
function calculatePackageDimensions(items: CartItem[]): USPSPackageDimensions {
  const totalDowels = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get the appropriate tier for this quantity
  const tier = getTierForQuantity(totalDowels);

  // Use tier dimensions and weight
  const [length, width, height] = tier.dimsIn;
  const weight = tier.weightLbs;

  console.log(`Package estimation for ${totalDowels} dowels using tier "${tier.tierName}":`, {
    dimensions: `${length}" x ${width}" x ${height}"`,
    weight: `${weight} lbs`,
    packageType: tier.pkgType,
    packageCount: tier.pkgCount,
    tier: tier.tierName
  });

  return {
    length,
    width,
    height,
    weight
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



