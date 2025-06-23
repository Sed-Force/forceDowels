import { NextRequest, NextResponse } from 'next/server';
import { getActiveDistributors, findDistributorsNearLocation } from '@/lib/distribution';
import { getZipCodeLocation } from '@/lib/geolocation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');
    const zipCode = searchParams.get('zip');
    const radius = searchParams.get('radius');

    // If coordinates are provided, find distributors near that location
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusMiles = radius ? parseFloat(radius) : 50;

      if (isNaN(lat) || isNaN(lng) || isNaN(radiusMiles)) {
        return NextResponse.json(
          { error: 'Invalid coordinates or radius' },
          { status: 400 }
        );
      }

      const distributors = await findDistributorsNearLocation(lat, lng, radiusMiles);
      return NextResponse.json({
        success: true,
        distributors,
        searchLocation: { latitude: lat, longitude: lng, radius: radiusMiles }
      });
    }

    // If ZIP code is provided, find distributors near that ZIP code
    if (zipCode) {
      const zipLocation = await getZipCodeLocation(zipCode);
      
      if (!zipLocation) {
        return NextResponse.json(
          { error: 'Invalid or unknown ZIP code' },
          { status: 400 }
        );
      }

      const radiusMiles = radius ? parseFloat(radius) : 50;
      const distributors = await findDistributorsNearLocation(
        zipLocation.latitude, 
        zipLocation.longitude, 
        radiusMiles
      );

      return NextResponse.json({
        success: true,
        distributors,
        searchLocation: {
          ...zipLocation,
          radius: radiusMiles
        }
      });
    }

    // Otherwise, return all active distributors
    const distributors = await getActiveDistributors();
    return NextResponse.json({
      success: true,
      distributors
    });

  } catch (error) {
    console.error('Error fetching distributors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
