// Unified shipping service that routes between USPS and TQL based on quantity
import { CartItem } from '@/contexts/cart-context';
import { getUSPSShippingRates, ShippingAddress as USPSAddress, USPSRate, getTierForQuantity } from './usps';
import { TQLService, TQLAddress, transformCartToTQLQuote, TQLRate } from './tql-service';
import { ShippingOption } from './shipping';

export interface UnifiedShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UnifiedShippingRate {
  id: string;
  service: string;
  carrier: string;
  rate: number;
  currency: string;
  delivery_days?: number;
  delivery_date?: string;
  delivery_date_guaranteed?: boolean;
  provider: 'USPS' | 'TQL';
  displayName: string;
  estimatedDelivery: string;
}

export class UnifiedShippingService {
  private tqlService: TQLService;
  
  // Force Dowel Company origin address (B2B commercial facility)
  private readonly originAddress: TQLAddress = {
    city: "Gilbert",
    state: "AZ",
    postalCode: "85296",
    country: "USA",
    name: "Force Dowel Company",
    streetAddress: "4455 E Nunneley Rd, Ste 103",
    contactName: "Shipping Department",
    contactPhone: "4805817145", // (480) 581-7145
    hoursOpen: "7:30 AM",
    hoursClosed: "4:30 PM"
  };

  constructor() {
    this.tqlService = new TQLService();
  }

  /**
   * Get shipping rates using the appropriate provider based on quantity
   */
  async getShippingRates(
    toAddress: UnifiedShippingAddress,
    cartItems: CartItem[]
  ): Promise<UnifiedShippingRate[]> {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    console.log(`Getting shipping rates for ${totalQuantity} dowels`);

    // Route to appropriate provider based on quantity
    if (totalQuantity <= 5000) {
      // Use USPS for 5K orders
      return this.getUSPSRates(toAddress, cartItems);
    } else {
      // Try TQL for orders > 5K, fall back with weight check
      try {
        console.log(`Attempting TQL shipping for ${totalQuantity} dowels...`);
        const tqlRates = await this.getTQLRates(toAddress, cartItems);
        console.log(`✅ TQL shipping successful for ${totalQuantity} dowels`);
        return tqlRates;
      } catch (error) {
        console.warn(`⚠️  TQL shipping failed for ${totalQuantity} dowels:`, error.message);

        // Check if the package is too heavy for USPS (70 lb limit)
        const tier = getTierForQuantity(totalQuantity);
        console.log(`📦 Package details for ${totalQuantity} dowels: ${tier.tierName}, ${tier.weightLbs} lbs`);

        // Check if this is a TQL authentication/configuration issue or location issue
        if (error.message.includes('TQL authentication failed') ||
            error.message.includes('Failed to authenticate with TQL API') ||
            error.message.includes('LOCATION_MISMATCH') ||
            error.message.includes('Please enter a valid city') ||
            error.message.includes('postal code/ country combination')) {

          const issueType = error.message.includes('LOCATION_MISMATCH') || error.message.includes('Please enter a valid city') || error.message.includes('postal code/ country combination')
            ? 'location not serviced'
            : 'authentication issue';

          console.warn(`🔧 TQL ${issueType} detected - providing manual quote option`);
          console.log(`🔧 Full error message: ${error.message}`);

          // Return a manual quote option for TQL orders when TQL fails
          return [{
            id: 'tql_manual_quote',
            service: 'Manual Quote Required',
            carrier: 'LTL Freight',
            rate: 0, // Will be quoted manually
            currency: 'USD',
            delivery_days: 5,
            delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            delivery_date_guaranteed: false,
            provider: 'TQL' as const,
            displayName: 'LTL Freight - Manual Quote Required',
            estimatedDelivery: 'Contact for quote: (480) 581-7145'
          }];
        }

        // For all TQL failures on orders >5K, recommend manual calculation
        console.error(`❌ TQL freight shipping failed for ${totalQuantity} dowels (${tier.weightLbs} lbs)`);
        console.error(`💡 Orders >5K dowels require LTL freight shipping - manual quote needed`);

        // Return a manual quote option for all TQL failures
        return [{
          id: 'manual_freight_quote',
          service: 'Manual Quote Required',
          carrier: 'LTL Freight',
          rate: 0, // Will be quoted manually
          currency: 'USD',
          delivery_days: 5,
          delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          delivery_date_guaranteed: false,
          provider: 'TQL' as const,
          displayName: 'LTL Freight - Manual Quote Required',
          estimatedDelivery: 'Contact for freight quote: (480) 581-7145'
        }];
      }
    }
  }

  /**
   * Get USPS rates and transform to unified format
   */
  private async getUSPSRates(
    toAddress: UnifiedShippingAddress,
    cartItems: CartItem[]
  ): Promise<UnifiedShippingRate[]> {
    try {
      const uspsAddress: USPSAddress = {
        name: toAddress.name,
        address: toAddress.address,
        city: toAddress.city,
        state: toAddress.state,
        zip: toAddress.zip,
        country: toAddress.country
      };

      const uspsRates = await getUSPSShippingRates(uspsAddress, cartItems);
      
      return uspsRates.map((rate: USPSRate) => ({
        id: rate.id,
        service: rate.service,
        carrier: rate.carrier,
        rate: rate.rate,
        currency: rate.currency,
        delivery_days: rate.delivery_days,
        delivery_date: rate.delivery_date,
        delivery_date_guaranteed: rate.delivery_date_guaranteed,
        provider: 'USPS' as const,
        displayName: rate.displayName || `${rate.carrier} ${rate.service}`,
        estimatedDelivery: rate.estimatedDelivery || `${rate.delivery_days || 'N/A'} business days`
      }));
    } catch (error) {
      console.error('USPS shipping calculation error:', error);
      throw new Error('Failed to calculate USPS shipping rates');
    }
  }

  /**
   * Get TQL rates and transform to unified format
   */
  private async getTQLRates(
    toAddress: UnifiedShippingAddress,
    cartItems: CartItem[]
  ): Promise<UnifiedShippingRate[]> {
    const tqlDestination: TQLAddress = {
      city: toAddress.city,
      state: toAddress.state,
      postalCode: toAddress.zip,
      country: toAddress.country === 'US' ? 'USA' : (toAddress.country || 'USA'), // Normalize US to USA for TQL
      name: toAddress.name,
      streetAddress: toAddress.address
    };

    const quoteRequest = transformCartToTQLQuote(
      cartItems,
      this.originAddress,
      tqlDestination
    );

    const tqlResponse = await this.tqlService.createQuote(quoteRequest);

    if (!tqlResponse.content.carrierPrices || tqlResponse.content.carrierPrices.length === 0) {
      throw new Error('TQL API returned no rates');
    }

    return tqlResponse.content.carrierPrices.map((rate: TQLRate, index: number) => ({
      id: `tql_${tqlResponse.content.quoteId}_${index}`,
      service: rate.serviceLevel,
      carrier: rate.carrier,
      rate: rate.customerRate,
      currency: 'USD',
      delivery_days: rate.transitDays,
      delivery_date: null, // TQL doesn't provide specific delivery dates
      delivery_date_guaranteed: false, // TQL doesn't guarantee delivery dates
      provider: 'TQL' as const,
      displayName: `${rate.carrier} ${rate.serviceLevel}`,
      estimatedDelivery: `${rate.transitDays} business days`
    }));
  }

  /**
   * Determine which provider should be used for a given quantity
   */
  static getProviderForQuantity(quantity: number): 'USPS' | 'TQL' {
    return quantity <= 5000 ? 'USPS' : 'TQL';
  }

  /**
   * Convert unified rates to ShippingOption format for compatibility
   */
  static convertToShippingOptions(rates: UnifiedShippingRate[]): ShippingOption[] {
    return rates.map(rate => ({
      id: rate.id,
      name: rate.displayName,
      description: rate.estimatedDelivery,
      price: rate.rate,
      estimatedDays: rate.estimatedDelivery,
      carrier: rate.carrier,
      service: rate.service,
      delivery_date: rate.delivery_date,
      delivery_date_guaranteed: rate.delivery_date_guaranteed
    }));
  }
}
