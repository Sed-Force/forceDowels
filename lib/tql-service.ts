// TQL API Service for LTL shipping quotes
import { getTQLToken } from './tql-auth';
import { CartItem } from '@/contexts/cart-context';
import { getTierForQuantity } from './usps';

export interface TQLQuoteRequest {
  origin: TQLAddress;
  destination: TQLAddress;
  quoteCommodities: TQLItem[];
  shipmentDate: string;
  pickLocationType?: string;
  dropLocationType?: string;
  accessorials?: string[];
}

export interface TQLAddress {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Optional B2B fields
  contactName?: string;
  contactPhone?: string;
  hoursOpen?: string;
  hoursClosed?: string;
}

export interface TQLItem {
  description: string;
  weight: number;
  dimensionLength: number;
  dimensionWidth: number;
  dimensionHeight: number;
  quantity: number;
  freightClassCode: string;
  unitTypeCode?: string;
  nmfc?: string;
  isHazmat?: boolean;
  isStackable?: boolean;
}

export interface TQLQuoteResponse {
  success: boolean;
  content: {
    quoteId: string;
    rates: TQLRate[];
  };
}

export interface TQLRate {
  carrierId: string;
  carrierName: string;
  serviceType: string;
  totalCost: number;
  transitDays: number;
  estimatedDeliveryDate?: string;
  accessorials?: any[];
}

export class TQLService {
  private baseUrl: string;
  private subscriptionKey: string;

  constructor() {
    // Use production environment (staging also fails with postal codes)
    this.baseUrl = process.env.TQL_BASE_URL || 'https://public.api.tql.com';
    this.subscriptionKey = process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY!;
  }

  /**
   * Create a new LTL quote
   */
  async createQuote(quoteData: TQLQuoteRequest): Promise<TQLQuoteResponse> {
    const token = await getTQLToken();

    // Use production endpoint (staging has same postal code issues)
    const endpoint = `${this.baseUrl}/ltl/quotes`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Authorization': `Bearer ${token.access_token}`
      },
      body: JSON.stringify(quoteData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`TQL quote creation failed: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Get an existing quote by ID
   */
  async getQuote(quoteId: string): Promise<TQLQuoteResponse> {
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
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`TQL quote retrieval failed: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }
}

/**
 * Transform Force Dowels cart items to TQL format
 */
export function transformCartToTQLQuote(
  cartItems: CartItem[],
  origin: TQLAddress,
  destination: TQLAddress,
  shipmentDate: string = new Date().toISOString()
): TQLQuoteRequest {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Get tier data for packaging (reuse from USPS logic)
  const tier = getTierForQuantity(totalQuantity);
  
  // For Force Dowels, all orders >5K are palletized
  const tqlItems: TQLItem[] = [{
    description: `Force Dowels - ${totalQuantity.toLocaleString()} units (${tier.tierName})`,
    weight: tier.weightLbs,
    dimensionLength: tier.dimsIn[0],
    dimensionWidth: tier.dimsIn[1],
    dimensionHeight: tier.dimsIn[2],
    quantity: tier.pkgCount, // Number of pallets (1 or 2)
    freightClassCode: determineFreightClass(tier.weightLbs, tier.dimsIn),
    unitTypeCode: tier.pkgType === 'PALLET' ? 'PLT' : 'BOX', // Will be PLT for all >5K orders
    nmfc: '161030', // NMFC code for wooden dowels/rods
    isHazmat: false, // Force Dowels are not hazardous
    isStackable: true // Pallets can be stacked (saves freight costs)
  }];

  // B2B freight - customers have loading docks, no special accessorials needed
  const accessorials = [];

  // For B2B with loading docks, we typically don't need:
  // - Liftgate delivery (they have docks)
  // - Inside delivery (dock-to-dock)
  // - Residential delivery (all commercial)

  // Only add accessorials if specifically requested by customer
  // accessorials.push('APPOINTMENT_DELIVERY'); // If customer requires scheduling
  // accessorials.push('NOTIFY_BEFORE_DELIVERY'); // If customer wants notification

  return {
    origin,
    destination,
    quoteCommodities: tqlItems,
    shipmentDate,
    pickLocationType: 'Commercial', // Force Dowel Company warehouse
    dropLocationType: 'Commercial', // B2B customers with loading docks
    accessorials // Minimal accessorials for B2B dock-to-dock delivery
  };
}

/**
 * Determine freight class based on weight and dimensions
 */
function determineFreightClass(weight: number, dimensions: number[]): string {
  const [length, width, height] = dimensions;
  const volume = (length * width * height) / 1728; // cubic feet
  const density = weight / volume; // lbs per cubic foot
  
  // Standard freight class determination for wooden products
  if (density >= 30) return '55';
  if (density >= 22.5) return '60'; 
  if (density >= 15) return '65';
  if (density >= 13.5) return '70';
  if (density >= 12) return '77.5';
  if (density >= 10.5) return '85';
  if (density >= 9) return '92.5';
  if (density >= 8) return '100';
  if (density >= 6) return '110';
  if (density >= 5) return '125';
  if (density >= 4) return '150';
  if (density >= 3) return '175';
  if (density >= 2) return '200';
  if (density >= 1) return '250';
  return '300'; // lowest density class
}

// Note: getTierForQuantity is now imported from ./usps module
