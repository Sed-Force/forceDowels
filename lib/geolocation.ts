/**
 * Geolocation and Address Validation Service
 * 
 * This module provides geocoding and address validation functionality.
 * Currently uses a fallback system but can be easily extended with real APIs.
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface GeocodeResult extends Coordinates {
  formattedAddress?: string
  confidence?: number
}

export interface ZipCodeLocation extends Coordinates {
  city: string
  state: string
  zipCode: string
}

/**
 * Geocode an address to get coordinates
 * @param address - Full address string
 * @returns Promise with coordinates and optional formatted address
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    // In production, you would integrate with a geocoding service like:
    // - Google Maps Geocoding API
    // - Mapbox Geocoding API
    // - OpenStreetMap Nominatim
    // - Here Geocoding API
    
    console.log('Geocoding address:', address)
    
    // For now, return coordinates based on common US locations
    // This is a fallback system that can be replaced with real geocoding
    const coordinates = getApproximateCoordinates(address)
    
    return {
      ...coordinates,
      formattedAddress: address,
      confidence: 0.5 // Low confidence since this is approximate
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    
    // Return Force Dowel Company location as fallback
    return {
      latitude: 33.3528,
      longitude: -111.7890,
      formattedAddress: address,
      confidence: 0.1
    }
  }
}

/**
 * Get coordinates for a ZIP code
 * @param zipCode - 5-digit ZIP code
 * @returns Promise with coordinates and location info
 */
export async function getZipCodeLocation(zipCode: string): Promise<ZipCodeLocation | null> {
  try {
    // Clean the ZIP code
    const cleanZip = zipCode.replace(/\D/g, '').slice(0, 5)

    if (cleanZip.length !== 5) {
      return null
    }

    // First try USPS API for city/state lookup
    try {
      const { getCityStateFromZip } = await import('./usps')
      const uspsResult = await getCityStateFromZip(cleanZip)

      if (uspsResult.success && uspsResult.city && uspsResult.state) {
        // Use a comprehensive ZIP code database for coordinates
        const coordinates = await getZipCodeCoordinatesFromDatabase(cleanZip)

        if (coordinates) {
          return {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            city: uspsResult.city,
            state: uspsResult.state,
            zipCode: cleanZip
          }
        }
      }
    } catch (uspsError) {
      console.log('USPS lookup failed, falling back to local database:', uspsError)
    }

    // Fallback to local ZIP code database
    const location = getZipCodeCoordinates(cleanZip)
    return location
  } catch (error) {
    console.error('Error getting ZIP code location:', error)
    return null
  }
}

/**
 * Validate an address format
 * @param address - Address components
 * @returns Validation result with any issues
 */
export function validateAddress(address: {
  street: string
  city: string
  state: string
  zipCode: string
}): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Validate street address
  if (!address.street || address.street.trim().length < 5) {
    issues.push('Street address must be at least 5 characters long')
  }
  
  // Validate city
  if (!address.city || address.city.trim().length < 2) {
    issues.push('City must be at least 2 characters long')
  }
  
  // Validate state (US states)
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]
  
  if (!validStates.includes(address.state.toUpperCase())) {
    issues.push('Please provide a valid US state abbreviation')
  }
  
  // Validate ZIP code
  const zipRegex = /^\d{5}(-\d{4})?$/
  if (!zipRegex.test(address.zipCode)) {
    issues.push('ZIP code must be in format 12345 or 12345-6789')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get approximate coordinates based on address string
 * This is a fallback system - replace with real geocoding in production
 */
function getApproximateCoordinates(address: string): Coordinates {
  const addressLower = address.toLowerCase()
  
  // Major cities coordinates (approximate)
  const cityCoordinates: Record<string, Coordinates> = {
    'phoenix': { latitude: 33.4484, longitude: -112.0740 },
    'tucson': { latitude: 32.2226, longitude: -110.9747 },
    'mesa': { latitude: 33.4152, longitude: -111.8315 },
    'chandler': { latitude: 33.3062, longitude: -111.8413 },
    'gilbert': { latitude: 33.3528, longitude: -111.7890 },
    'scottsdale': { latitude: 33.4942, longitude: -111.9261 },
    'tempe': { latitude: 33.4255, longitude: -111.9400 },
    'peoria': { latitude: 33.5806, longitude: -112.2374 },
    'los angeles': { latitude: 34.0522, longitude: -118.2437 },
    'san diego': { latitude: 32.7157, longitude: -117.1611 },
    'san francisco': { latitude: 37.7749, longitude: -122.4194 },
    'las vegas': { latitude: 36.1699, longitude: -115.1398 },
    'denver': { latitude: 39.7392, longitude: -104.9903 },
    'albuquerque': { latitude: 35.0844, longitude: -106.6504 },
    'salt lake city': { latitude: 40.7608, longitude: -111.8910 },
  }
  
  // Check for city matches
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (addressLower.includes(city)) {
      return coords
    }
  }
  
  // State-based fallback coordinates (approximate center of state)
  const stateCoordinates: Record<string, Coordinates> = {
    'az': { latitude: 34.0489, longitude: -111.0937 }, // Arizona
    'ca': { latitude: 36.7783, longitude: -119.4179 }, // California
    'nv': { latitude: 38.8026, longitude: -116.4194 }, // Nevada
    'nm': { latitude: 34.5199, longitude: -105.8701 }, // New Mexico
    'ut': { latitude: 39.3210, longitude: -111.0937 }, // Utah
    'co': { latitude: 39.5501, longitude: -105.7821 }, // Colorado
    'tx': { latitude: 31.9686, longitude: -99.9018 },  // Texas
  }
  
  for (const [state, coords] of Object.entries(stateCoordinates)) {
    if (addressLower.includes(state) || addressLower.includes(state.toUpperCase())) {
      return coords
    }
  }
  
  // Default to Force Dowel Company location (Gilbert, AZ)
  return { latitude: 33.3528, longitude: -111.7890 }
}

/**
 * Get coordinates from comprehensive ZIP code database
 * This uses a more extensive database for better coverage
 */
async function getZipCodeCoordinatesFromDatabase(zipCode: string): Promise<Coordinates | null> {
  try {
    // You can replace this with a real ZIP code database API like:
    // - ZipCodeAPI.com
    // - Zippopotam.us (free)
    // - GeoNames.org
    // - Or a local database file

    // For now, use the free Zippopotam.us API
    const response = await fetch(`http://api.zippopotam.us/us/${zipCode}`)

    if (response.ok) {
      const data = await response.json()

      if (data.places && data.places.length > 0) {
        const place = data.places[0]
        return {
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude)
        }
      }
    }
  } catch (error) {
    console.log('External ZIP code API failed:', error)
  }

  return null
}

/**
 * Get coordinates for ZIP codes
 * This is a simplified system - use a real ZIP code database in production
 */
function getZipCodeCoordinates(zipCode: string): ZipCodeLocation | null {
  // Expanded ZIP codes database with more coverage
  const zipDatabase: Record<string, ZipCodeLocation> = {
    // Arizona
    '85296': { latitude: 33.3528, longitude: -111.7890, city: 'Gilbert', state: 'AZ', zipCode: '85296' },
    '85001': { latitude: 33.4484, longitude: -112.0740, city: 'Phoenix', state: 'AZ', zipCode: '85001' },
    '85201': { latitude: 33.4152, longitude: -111.8315, city: 'Mesa', state: 'AZ', zipCode: '85201' },
    '85224': { latitude: 33.3062, longitude: -111.8413, city: 'Chandler', state: 'AZ', zipCode: '85224' },
    '85251': { latitude: 33.4942, longitude: -111.9261, city: 'Scottsdale', state: 'AZ', zipCode: '85251' },
    '85281': { latitude: 33.4255, longitude: -111.9400, city: 'Tempe', state: 'AZ', zipCode: '85281' },

    // California
    '90210': { latitude: 34.0901, longitude: -118.4065, city: 'Beverly Hills', state: 'CA', zipCode: '90210' },
    '90001': { latitude: 33.9731, longitude: -118.2479, city: 'Los Angeles', state: 'CA', zipCode: '90001' },
    '92101': { latitude: 32.7157, longitude: -117.1611, city: 'San Diego', state: 'CA', zipCode: '92101' },
    '94102': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA', zipCode: '94102' },

    // New York
    '10001': { latitude: 40.7505, longitude: -73.9934, city: 'New York', state: 'NY', zipCode: '10001' },
    '10002': { latitude: 40.7156, longitude: -73.9877, city: 'New York', state: 'NY', zipCode: '10002' },

    // Texas
    '75201': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX', zipCode: '75201' },
    '77001': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX', zipCode: '77001' },
    '78701': { latitude: 30.2672, longitude: -97.7431, city: 'Austin', state: 'TX', zipCode: '78701' },

    // Florida
    '33101': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL', zipCode: '33101' },
    '32801': { latitude: 28.5383, longitude: -81.3792, city: 'Orlando', state: 'FL', zipCode: '32801' },

    // Nevada
    '89101': { latitude: 36.1699, longitude: -115.1398, city: 'Las Vegas', state: 'NV', zipCode: '89101' },

    // Colorado
    '80201': { latitude: 39.7392, longitude: -104.9903, city: 'Denver', state: 'CO', zipCode: '80201' },

    // Utah
    '84101': { latitude: 40.7608, longitude: -111.8910, city: 'Salt Lake City', state: 'UT', zipCode: '84101' },
    '84660': { latitude: 40.1149, longitude: -111.6549, city: 'Spanish Fork', state: 'UT', zipCode: '84660' },
  }

  return zipDatabase[zipCode] || null
}
