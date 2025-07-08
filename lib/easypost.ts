// EasyPost shipping service for calculating real-time shipping rates
import EasyPost from '@easypost/api';
import { CartItem } from '@/contexts/cart-context';
import { getTierForQuantity } from './usps';

// Initialize EasyPost client
const easypost = new EasyPost(process.env.EASYPOST_API_KEY!);

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ShippingRate {
  id: string;
  service: string;
  carrier: string;
  rate: number;
  currency: string;
  delivery_days?: number;
  delivery_date?: string;
  delivery_date_guaranteed?: boolean;
}

export interface ShipmentDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

// Note: Package dimensions are now calculated using TIER_DATA from usps.ts
// This ensures consistency across all shipping providers

// Your business address (from address for shipping calculations)
const FROM_ADDRESS = {
  name: "Force Dowel Company",
  street1: "4455 E Nunneley Rd, Ste 103",
  city: "Gilbert",
  state: "AZ",
  zip: "85296",
  country: "US"
};

/**
 * Calculate package dimensions and weight based on cart items using tier data
 * Uses the same tier system as USPS and TQL for consistency
 */
function calculatePackageDimensions(items: CartItem[]): ShipmentDimensions {
  const totalDowels = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get the appropriate tier for this quantity
  const tier = getTierForQuantity(totalDowels);

  // Use tier dimensions and weight
  const [length, width, height] = tier.dimsIn;
  const weight = tier.weightLbs;

  console.log(`EasyPost package estimation for ${totalDowels} dowels using tier "${tier.tierName}":`, {
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
 * Get shipping rates from EasyPost
 */
export async function getShippingRates(
  toAddress: ShippingAddress,
  items: CartItem[]
): Promise<ShippingRate[]> {
  try {
    const dimensions = calculatePackageDimensions(items);
    
    // Create parcel
    const parcel = await easypost.Parcel.create({
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      weight: dimensions.weight
    });

    // Create addresses
    const fromAddr = await easypost.Address.create(FROM_ADDRESS);
    const toAddr = await easypost.Address.create({
      name: toAddress.name,
      street1: toAddress.address,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: toAddress.country
    });

    // Create shipment to get rates
    const shipment = await easypost.Shipment.create({
      to_address: toAddr,
      from_address: fromAddr,
      parcel: parcel
    });

    // Convert EasyPost rates to our format
    const rates: ShippingRate[] = shipment.rates.map((rate: any) => ({
      id: rate.id,
      service: rate.service,
      carrier: rate.carrier,
      rate: parseFloat(rate.rate),
      currency: rate.currency,
      delivery_days: rate.delivery_days,
      delivery_date: rate.delivery_date,
      delivery_date_guaranteed: rate.delivery_date_guaranteed
    }));

    // Sort by price (cheapest first)
    return rates.sort((a, b) => a.rate - b.rate);

  } catch (error) {
    console.error('EasyPost shipping calculation error:', error);
    throw new Error('Failed to calculate shipping rates');
  }
}

/**
 * Get a specific shipping rate by ID
 */
export async function getShippingRateById(rateId: string): Promise<ShippingRate | null> {
  try {
    const rate = await easypost.Rate.retrieve(rateId);
    
    return {
      id: rate.id,
      service: rate.service,
      carrier: rate.carrier,
      rate: parseFloat(rate.rate),
      currency: rate.currency,
      delivery_days: rate.delivery_days,
      delivery_date: rate.delivery_date,
      delivery_date_guaranteed: rate.delivery_date_guaranteed
    };
  } catch (error) {
    console.error('Error retrieving shipping rate:', error);
    return null;
  }
}

/**
 * Create a shipment and purchase shipping label (for order fulfillment)
 */
export async function createShipment(
  toAddress: ShippingAddress,
  items: CartItem[],
  rateId: string
): Promise<any> {
  try {
    const dimensions = calculatePackageDimensions(items);
    
    // Create parcel
    const parcel = await easypost.Parcel.create({
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      weight: dimensions.weight
    });

    // Create addresses
    const fromAddr = await easypost.Address.create(FROM_ADDRESS);
    const toAddr = await easypost.Address.create({
      name: toAddress.name,
      street1: toAddress.address,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: toAddress.country
    });

    // Create shipment
    const shipment = await easypost.Shipment.create({
      to_address: toAddr,
      from_address: fromAddr,
      parcel: parcel
    });

    // Buy the shipment with the selected rate
    const purchasedShipment = await easypost.Shipment.buy(shipment.id, {
      rate: { id: rateId }
    });

    return purchasedShipment;
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw new Error('Failed to create shipment');
  }
}

/**
 * Validate an address using EasyPost
 */
export async function validateAddress(address: ShippingAddress): Promise<{
  valid: boolean;
  suggestions?: ShippingAddress[];
  error?: string;
}> {
  try {
    const addr = await easypost.Address.create({
      name: address.name,
      street1: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      verify: ['delivery']
    });

    if (addr.verifications?.delivery?.success) {
      return { valid: true };
    } else {
      return {
        valid: false,
        error: addr.verifications?.delivery?.errors?.[0]?.message || 'Address validation failed'
      };
    }
  } catch (error) {
    console.error('Address validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate address'
    };
  }
}
