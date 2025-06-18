// Pricing tiers and utility functions for Force Dowels

export interface PricingTier {
  range: string
  min: number
  max: number
  pricePerUnit: number
}

// Define the pricing tiers with actual prices
export const PRICING_TIERS: PricingTier[] = [
  { range: "5,000-20,000", min: 5000, max: 20000, pricePerUnit: 0.0720 },
  { range: "20,001-160,000", min: 20001, max: 160000, pricePerUnit: 0.0675 },
  { range: "160,001-960,000", min: 160001, max: 960000, pricePerUnit: 0.0630 },
]

/**
 * Get the pricing tier for a given quantity
 * @param quantity - The quantity of units
 * @returns The pricing tier object or null if quantity is below minimum
 */
export function getPricingTier(quantity: number): PricingTier | null {
  if (quantity < PRICING_TIERS[0].min) {
    return null // Below minimum order quantity
  }

  // Find the appropriate tier
  const tier = PRICING_TIERS.find(tier => quantity >= tier.min && quantity <= tier.max)
  
  // If quantity exceeds the highest tier, use the highest tier pricing
  if (!tier && quantity > PRICING_TIERS[PRICING_TIERS.length - 1].max) {
    return PRICING_TIERS[PRICING_TIERS.length - 1]
  }

  return tier || null
}

/**
 * Calculate the price per unit for a given quantity
 * @param quantity - The quantity of units
 * @returns The price per unit or null if quantity is below minimum
 */
export function calculatePricePerUnit(quantity: number): number | null {
  const tier = getPricingTier(quantity)
  return tier ? tier.pricePerUnit : null
}

/**
 * Calculate the total price for a given quantity
 * @param quantity - The quantity of units
 * @returns The total price or null if quantity is below minimum
 */
export function calculateTotalPrice(quantity: number): number | null {
  const pricePerUnit = calculatePricePerUnit(quantity)
  return pricePerUnit ? quantity * pricePerUnit : null
}

/**
 * Format a number with commas for display
 * @param num - The number to format
 * @returns The formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Format a price for display with exact precision (no unnecessary trailing zeros)
 * @param price - The price to format
 * @returns The formatted price string
 */
export function formatPrice(price: number): string {
  return price.toFixed(2)
}

/**
 * Format a price with exact precision (removes trailing zeros)
 * @param price - The price to format
 * @returns The formatted price string with exact precision
 */
export function formatExactPrice(price: number): string {
  // Convert to string and remove trailing zeros after decimal point
  return price.toString()
}

/**
 * Format a price as currency
 * @param price - The price to format
 * @returns The formatted currency string
 */
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Get tier information for display purposes
 * @param quantity - The quantity of units
 * @returns Object with tier info and pricing details
 */
export function getTierInfo(quantity: number) {
  const tier = getPricingTier(quantity)
  const pricePerUnit = calculatePricePerUnit(quantity)
  const totalPrice = calculateTotalPrice(quantity)

  return {
    tier: tier?.range || null,
    pricePerUnit,
    totalPrice,
    isValidQuantity: tier !== null,
    minQuantity: PRICING_TIERS[0].min,
  }
}
