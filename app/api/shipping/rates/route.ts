import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUSPSShippingRates, ShippingAddress } from '@/lib/usps';
import { CartItem } from '@/contexts/cart-context';

export async function POST(request: NextRequest) {
  try {
    console.log('🚚 Shipping API: Checking authentication...');

    // Verify user authentication
    const user = await currentUser();
    console.log('🚚 Shipping API: currentUser():', user ? 'found' : 'not found');

    if (!user) {
      console.error('❌ Shipping API: currentUser() returned null');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Shipping API: User authenticated successfully with userId:', user.id);

    const body = await request.json();
    const { shippingAddress, cartItems } = body;

    // Validate required fields
    if (!shippingAddress || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Shipping address and cart items are required' },
        { status: 400 }
      );
    }

    // Validate shipping address fields
    const requiredFields = ['name', 'address', 'city', 'state', 'zip', 'country'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log('Fetching shipping rates for:', {
      destination: `${shippingAddress.city}, ${shippingAddress.state}`,
      itemCount: cartItems.length,
      totalQuantity: cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
    });

    // Get shipping rates from USPS
    const rates = await getUSPSShippingRates(shippingAddress as ShippingAddress, cartItems);

    // Filter and format rates for frontend
    const formattedRates = rates.map(rate => ({
      id: rate.id,
      service: rate.service,
      carrier: rate.carrier,
      rate: rate.rate,
      currency: rate.currency,
      delivery_days: rate.delivery_days,
      delivery_date: rate.delivery_date,
      delivery_date_guaranteed: rate.delivery_date_guaranteed,
      // Create a display name combining carrier and service
      displayName: `${rate.carrier} ${rate.service}`,
      // Estimate delivery time text
      estimatedDelivery: rate.delivery_days 
        ? `${rate.delivery_days} business day${rate.delivery_days > 1 ? 's' : ''}`
        : rate.delivery_date 
        ? `By ${new Date(rate.delivery_date).toLocaleDateString()}`
        : 'Standard delivery'
    }));

    console.log(`Found ${formattedRates.length} shipping options`);

    return NextResponse.json({
      success: true,
      rates: formattedRates
    });

  } catch (error) {
    console.error('Shipping rates API error:', error);

    // Return a more specific error message - no fallback, USPS only
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch USPS shipping rates';

    return NextResponse.json(
      {
        error: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (optional)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Shipping rates API is running',
    endpoint: 'POST /api/shipping/rates',
    requiredFields: {
      shippingAddress: ['name', 'address', 'city', 'state', 'zip', 'country'],
      cartItems: 'Array of cart items with id, name, quantity, tier, pricePerUnit'
    }
  });
}
