// UPS shipping service for calculating real-time shipping rates
import { CartItem } from '@/contexts/cart-context';

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UPSRate {
  id: string;
  service: string;
  carrier: string;
  rate: number;
  currency: string;
  delivery_days?: number;
  delivery_date?: string;
  delivery_date_guaranteed?: boolean;
  serviceCode: string;
  description: string;
}

export interface UPSPackageDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

// Tier data for Force Dowels packaging and shipping
// Updated with corrected weight calculations based on consistent scaling
export const TIER_DATA = [
  { tierName: "Small Box",             maxQty: 5_000,     pkgCount: 1,
    pkgType: "BOX",    weightLbs:  20, dimsIn: [15, 15, 10] },   // 1 small box (baseline)
  { tierName: "Medium Box",            maxQty: 10_000,    pkgCount: 1,
    pkgType: "BOX",    weightLbs:  40,   dimsIn: [18, 18, 11] },   // 1 medium box (baseline)
  { tierName: "Large Box",             maxQty: 15_000,    pkgCount: 1,
    pkgType: "BOX",    weightLbs:  60,   dimsIn: [19, 19, 12] },   // 1 large box (15K dowels + packaging)
  { tierName: "Box",                   maxQty: 20_000,    pkgCount: 1,
    pkgType: "BOX",    weightLbs:  80,   dimsIn: [20, 20, 12] },   // 1 box (20K dowels + packaging)
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

// UPS API configuration
const UPS_BASE_URL = 'https://onlinetools.ups.com';

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
function calculatePackageDimensions(items: CartItem[]): UPSPackageDimensions {
  const totalDowels = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get the appropriate tier for this quantity
  const tier = getTierForQuantity(totalDowels);

  // Use tier dimensions and weight
  const [length, width, height] = tier.dimsIn;
  const weight = tier.weightLbs;

  return {
    length,
    width,
    height,
    weight
  };
}

/**
 * Get UPS service name from service code
 */
function getUPSServiceName(code: string): string {
  const serviceNames: { [key: string]: string } = {
    '01': 'UPS Next Day Air',
    '02': 'UPS 2nd Day Air',
    '03': 'UPS Ground',
    '07': 'UPS Worldwide Express',
    '08': 'UPS Worldwide Expedited',
    '11': 'UPS Standard',
    '12': 'UPS 3 Day Select',
    '13': 'UPS Next Day Air Saver',
    '14': 'UPS Next Day Air Early A.M.',
    '54': 'UPS Worldwide Express Plus',
    '59': 'UPS 2nd Day Air A.M.',
    '65': 'UPS Saver'
  };
  return serviceNames[code] || `UPS Service ${code}`;
}

/**
 * Get OAuth 2.0 access token from UPS
 */
async function getUPSAccessToken(): Promise<string> {
  const clientId = process.env.UPS_CLIENT_ID;
  const clientSecret = process.env.UPS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('UPS API credentials not configured');
  }

  const accountNumber = process.env.UPS_ACCOUNT_NUMBER;
  if (!accountNumber) {
    throw new Error('UPS_ACCOUNT_NUMBER not configured');
  }

  try {
    // UPS OAuth 2.0 endpoint - using Basic Auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams({
      grant_type: 'client_credentials'
    });

    const response = await fetch(`${UPS_BASE_URL}/security/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UPS OAuth failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new Error('Failed to authenticate with UPS API');
  }
}

/**
 * Get shipping rates from UPS Rating API
 */
export async function getUPSShippingRates(
  toAddress: ShippingAddress,
  items: CartItem[]
): Promise<UPSRate[]> {
  try {
    const accessToken = await getUPSAccessToken();
    const dimensions = calculatePackageDimensions(items);

    // UPS Rating API request body
    const requestBody = {
      RateRequest: {
        Request: {
          RequestOption: "Shop",
          TransactionReference: {
            CustomerContext: "Force Dowels Shipping Rate Request"
          }
        },
        PickupType: {
          Code: "03",
          Description: "Customer Counter"
        },
        CustomerClassification: {
          Code: "04",
          Description: "Retail Rates"
        },

        Shipment: {
          Shipper: {
            Name: FROM_ADDRESS.name,
            ShipperNumber: process.env.UPS_ACCOUNT_NUMBER, // UPS Account Number
            Address: {
              AddressLine: [FROM_ADDRESS.streetAddress],
              City: FROM_ADDRESS.city,
              StateProvinceCode: FROM_ADDRESS.state,
              PostalCode: FROM_ADDRESS.zip,
              CountryCode: FROM_ADDRESS.country
            }
          },
          ShipTo: {
            Name: toAddress.name,
            Address: {
              AddressLine: [toAddress.address],
              City: toAddress.city,
              StateProvinceCode: toAddress.state,
              PostalCode: toAddress.zip,
              CountryCode: toAddress.country
              // No ResidentialAddressIndicator = Commercial/Business address
            }
          },
          ShipFrom: {
            Name: FROM_ADDRESS.name,
            Address: {
              AddressLine: [FROM_ADDRESS.streetAddress],
              City: FROM_ADDRESS.city,
              StateProvinceCode: FROM_ADDRESS.state,
              PostalCode: FROM_ADDRESS.zip,
              CountryCode: FROM_ADDRESS.country
            }
          },
          Package: [{
            PackagingType: {
              Code: "02", // Customer Supplied Package
              Description: "Customer Supplied Package"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches"
              },
              Length: dimensions.length.toString(),
              Width: dimensions.width.toString(),
              Height: dimensions.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds"
              },
              Weight: dimensions.weight.toString()
            }
          }]
        }
      }
    };



    // Use Shop endpoint to get multiple service rates
    const response = await fetch(`${UPS_BASE_URL}/api/rating/v1/Shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UPS Rating API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // Convert UPS response to our format
    const rates: UPSRate[] = [];

    if (data.RateResponse && data.RateResponse.RatedShipment) {
      const ratedShipments = Array.isArray(data.RateResponse.RatedShipment)
        ? data.RateResponse.RatedShipment
        : [data.RateResponse.RatedShipment];

      ratedShipments.forEach((shipment: any) => {
        const service = shipment.Service;
        const totalCharges = shipment.TotalCharges;
        const timeInTransit = shipment.TimeInTransit;

        // Use the exact rate structure that matches UPS website
        const rateValue = parseFloat(totalCharges.MonetaryValue) || 0;
        const currency = totalCharges.CurrencyCode || 'USD';

        rates.push({
          id: `ups-${service.Code}-${rateValue}`,
          service: service.Description || getUPSServiceName(service.Code),
          carrier: 'UPS',
          rate: rateValue,
          currency: currency,
          serviceCode: service.Code,
          description: service.Description || getUPSServiceName(service.Code),
          delivery_days: timeInTransit?.ServiceSummary?.EstimatedArrival?.BusinessDaysInTransit
            ? parseInt(timeInTransit.ServiceSummary.EstimatedArrival.BusinessDaysInTransit)
            : undefined,
        });
      });
    }

    // Sort by price (cheapest first)
    return rates.sort((a, b) => a.rate - b.rate);

  } catch (error) {
    throw new Error(`UPS shipping service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}





