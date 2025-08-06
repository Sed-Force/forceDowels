import { CartItem } from "@/contexts/cart-context"

export interface GuestCheckoutValidation {
  isAllowed: boolean
  reason?: string
  requiresAuth: boolean
  totalDowelQuantity: number
  hasKits: boolean
  restrictedItems: string[]
}

/**
 * Validates if guest checkout is allowed based on cart contents
 * 
 * Rules:
 * - Kits are always allowed for guest checkout (any quantity)
 * - Dowels are only allowed for guest checkout if total quantity is exactly 5,000
 * - Any dowel quantity above 5,000 requires authentication
 */
export function validateGuestCheckout(cartItems: CartItem[]): GuestCheckoutValidation {
  const kits = cartItems.filter(item => item.name === "Force Dowels Kit")
  const dowels = cartItems.filter(item => item.name === "Force Dowels")
  
  const hasKits = kits.length > 0
  const totalDowelQuantity = dowels.reduce((sum, item) => sum + item.quantity, 0)
  
  const restrictedItems: string[] = []
  
  // Check dowel quantity restrictions
  if (totalDowelQuantity > 5000) {
    restrictedItems.push(`${totalDowelQuantity.toLocaleString()} Force Dowels (exceeds 5,000 limit)`)
  }
  
  // Determine if guest checkout is allowed
  const isAllowed = restrictedItems.length === 0
  const requiresAuth = !isAllowed
  
  let reason: string | undefined
  if (!isAllowed) {
    if (totalDowelQuantity > 5000) {
      reason = `Orders with more than 5,000 dowels require an account for order tracking and business verification. Your cart contains ${totalDowelQuantity.toLocaleString()} dowels.`
    }
  }
  
  return {
    isAllowed,
    reason,
    requiresAuth,
    totalDowelQuantity,
    hasKits,
    restrictedItems
  }
}

/**
 * Get user-friendly explanation for why authentication is required
 */
export function getAuthRequiredMessage(validation: GuestCheckoutValidation): string {
  if (validation.isAllowed) {
    return ""
  }
  
  const messages = []
  
  if (validation.totalDowelQuantity > 5000) {
    messages.push(
      `Your order contains ${validation.totalDowelQuantity.toLocaleString()} dowels, which exceeds our 5,000 unit guest checkout limit.`
    )
  }
  
  messages.push(
    "Larger orders require an account for:",
    "• Order tracking and history",
    "• Business verification and support", 
    "• Streamlined reordering process",
    "• Access to volume pricing and terms"
  )
  
  return messages.join("\n")
}

/**
 * Get the appropriate call-to-action based on validation results
 */
export function getAuthCallToAction(validation: GuestCheckoutValidation): {
  primaryAction: string
  secondaryAction?: string
  primaryUrl: string
  secondaryUrl?: string
} {
  if (validation.isAllowed) {
    return {
      primaryAction: "Continue as Guest",
      primaryUrl: "/checkout"
    }
  }
  
  return {
    primaryAction: "Create Account",
    secondaryAction: "Sign In",
    primaryUrl: "/sign-up?redirect=/checkout",
    secondaryUrl: "/sign-in?redirect=/checkout"
  }
}
