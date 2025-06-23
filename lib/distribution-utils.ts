import { randomUUID } from 'crypto'

/**
 * Generate a cryptographically secure unique ID for distribution requests
 * Uses Node.js crypto.randomUUID() which generates a RFC 4122 version 4 UUID
 */
export function generateDistributionRequestId(): string {
  return randomUUID()
}

/**
 * Validate that a string is a valid UUID format
 * @param id - The ID to validate
 * @returns true if the ID is a valid UUID format
 */
export function isValidDistributionRequestId(id: string): boolean {
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Generate secure URLs for accept/decline actions
 * @param baseUrl - The base URL of the application
 * @param uniqueId - The unique ID of the distribution request
 * @returns Object containing accept and decline URLs
 */
export function generateDistributionActionUrls(baseUrl: string, uniqueId: string) {
  return {
    acceptUrl: `${baseUrl}/distribution/accept/${uniqueId}`,
    declineUrl: `${baseUrl}/distribution/decline/${uniqueId}`
  }
}

/**
 * Get the base URL for the application
 * This handles both development and production environments
 */
export function getBaseUrl(): string {
  // In production, use the VERCEL_URL or custom domain
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://forcedowels.com'
  }
  
  // In development, use localhost
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

/**
 * Calculate distance between two coordinates using Haversine formula
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
 * Validate and sanitize zip code
 * @param zipCode - The zip code to validate
 * @returns Sanitized zip code or null if invalid
 */
export function validateZipCode(zipCode: string): string | null {
  // Remove any non-digit characters
  const cleaned = zipCode.replace(/\D/g, '')
  
  // Check if it's a valid 5-digit or 9-digit (ZIP+4) format
  if (cleaned.length === 5 || cleaned.length === 9) {
    return cleaned.length === 9 ? 
      `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : 
      cleaned
  }
  
  return null
}

/**
 * Format address for display
 * @param street - Street address
 * @param city - City
 * @param state - State
 * @param zipCode - ZIP code
 * @returns Formatted address string
 */
export function formatAddress(street: string, city: string, state: string, zipCode: string): string {
  return `${street}, ${city}, ${state} ${zipCode}`
}

/**
 * Generate a human-readable business type display
 * @param businessType - The business type value
 * @param businessTypeOther - Custom business type if "other" was selected
 * @returns Display-friendly business type string
 */
export function getBusinessTypeDisplay(businessType: string, businessTypeOther?: string): string {
  if (businessType === 'other' && businessTypeOther) {
    return businessTypeOther
  }
  
  // Convert camelCase or snake_case to readable format
  return businessType
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}
