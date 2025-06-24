// Pricing tiers and utility functions for Force Dowels

export interface PricingTier {
  range: string
  min: number
  max: number
  pricePerUnit: number
}

// Constants for quantity validation
export const MIN_ORDER_QUANTITY = 5000
export const MAX_ORDER_QUANTITY = 960000
export const QUANTITY_INCREMENT = 5000

// Define the pricing tiers with actual prices
export const PRICING_TIERS: PricingTier[] = [
  { range: "5,000-20,000", min: 5000, max: 20000, pricePerUnit: 0.0720 },
  { range: "<20,000-160,000", min: 20000, max: 160000, pricePerUnit: 0.0675 },
  { range: "<160,000-960,000", min: 160000, max: 960000, pricePerUnit: 0.0630 },
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
 * Validate if a quantity meets the 5,000-unit increment requirement
 * @param quantity - The quantity to validate
 * @returns True if quantity is valid (multiple of 5,000, within min/max range)
 */
export function isValidQuantityIncrement(quantity: number): boolean {
  if (quantity < MIN_ORDER_QUANTITY || quantity > MAX_ORDER_QUANTITY) {
    return false
  }
  return quantity % QUANTITY_INCREMENT === 0
}

/**
 * Round quantity to the nearest valid increment (5,000 units)
 * @param quantity - The quantity to round
 * @returns The rounded quantity within valid range
 */
export function roundToValidQuantity(quantity: number): number {
  // Ensure within bounds
  const boundedQuantity = Math.max(MIN_ORDER_QUANTITY, Math.min(MAX_ORDER_QUANTITY, quantity))

  // Round to nearest increment
  const rounded = Math.round(boundedQuantity / QUANTITY_INCREMENT) * QUANTITY_INCREMENT

  // Ensure still within bounds after rounding
  return Math.max(MIN_ORDER_QUANTITY, Math.min(MAX_ORDER_QUANTITY, rounded))
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
    isValidIncrement: isValidQuantityIncrement(quantity),
    minQuantity: MIN_ORDER_QUANTITY,
    maxQuantity: MAX_ORDER_QUANTITY,
    increment: QUANTITY_INCREMENT,
  }
}
