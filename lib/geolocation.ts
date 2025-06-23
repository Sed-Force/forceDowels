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
    
    // In production, you would use a ZIP code database or API
    // For now, use approximate coordinates for common ZIP codes
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
 * Get coordinates for ZIP codes
 * This is a simplified system - use a real ZIP code database in production
 */
function getZipCodeCoordinates(zipCode: string): ZipCodeLocation | null {
  // Sample ZIP codes with coordinates
  const zipDatabase: Record<string, ZipCodeLocation> = {
    '85296': { latitude: 33.3528, longitude: -111.7890, city: 'Gilbert', state: 'AZ', zipCode: '85296' },
    '85001': { latitude: 33.4484, longitude: -112.0740, city: 'Phoenix', state: 'AZ', zipCode: '85001' },
    '85201': { latitude: 33.4152, longitude: -111.8315, city: 'Mesa', state: 'AZ', zipCode: '85201' },
    '85224': { latitude: 33.3062, longitude: -111.8413, city: 'Chandler', state: 'AZ', zipCode: '85224' },
    '90210': { latitude: 34.0901, longitude: -118.4065, city: 'Beverly Hills', state: 'CA', zipCode: '90210' },
    '10001': { latitude: 40.7505, longitude: -73.9934, city: 'New York', state: 'NY', zipCode: '10001' },
  }
  
  return zipDatabase[zipCode] || null
}
