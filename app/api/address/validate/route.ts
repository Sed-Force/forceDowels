import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { validateUSPSAddress, getCityStateFromZip, ShippingAddress } from '@/lib/usps';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { address } = body;

    // Validate required fields
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate address fields
    const requiredFields = ['address', 'city', 'state', 'zip'];
    for (const field of requiredFields) {
      if (!address[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log('Validating address:', {
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip
    });

    // Validate address with USPS
    const validation = await validateUSPSAddress(address as ShippingAddress);

    if (validation.valid) {
      return NextResponse.json({
        success: true,
        valid: true,
        standardizedAddress: validation.standardizedAddress,
        deliverable: validation.deliverable,
        details: validation.details
      });
    } else {
      return NextResponse.json({
        success: true,
        valid: false,
        error: validation.error,
        suggestions: validation.suggestions,
        details: validation.details
      });
    }

  } catch (error) {
    console.error('Address validation API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to validate address';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}

// GET endpoint for ZIP code lookup
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zip');

    if (!zipCode) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    console.log('Looking up city/state for ZIP:', zipCode);

    // Get city and state from ZIP code
    const lookup = await getCityStateFromZip(zipCode);

    if (lookup.success) {
      return NextResponse.json({
        success: true,
        city: lookup.city,
        state: lookup.state
      });
    } else {
      return NextResponse.json({
        success: false,
        error: lookup.error
      });
    }

  } catch (error) {
    console.error('ZIP code lookup API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to lookup ZIP code';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}
