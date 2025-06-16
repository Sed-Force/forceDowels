// Shipping and tax calculation utilities

export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
}

export interface TaxInfo {
  rate: number
  amount: number
}

// Shipping options
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Free shipping on orders over $50',
    price: 0,
    estimatedDays: '5-7 business days'
  },
  {
    id: 'expedited',
    name: 'Expedited Shipping',
    description: 'Faster delivery',
    price: 15.99,
    estimatedDays: '2-3 business days'
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day delivery',
    price: 29.99,
    estimatedDays: '1 business day'
  }
]

// State tax rates (simplified - in production, use a tax service)
const STATE_TAX_RATES: Record<string, number> = {
  'AL': 0.04,    // Alabama
  'AK': 0.00,    // Alaska
  'AZ': 0.056,   // Arizona
  'AR': 0.065,   // Arkansas
  'CA': 0.0725,  // California
  'CO': 0.029,   // Colorado
  'CT': 0.0635,  // Connecticut
  'DE': 0.00,    // Delaware
  'FL': 0.06,    // Florida
  'GA': 0.04,    // Georgia
  'HI': 0.04,    // Hawaii
  'ID': 0.06,    // Idaho
  'IL': 0.0625,  // Illinois
  'IN': 0.07,    // Indiana
  'IA': 0.06,    // Iowa
  'KS': 0.065,   // Kansas
  'KY': 0.06,    // Kentucky
  'LA': 0.0445,  // Louisiana
  'ME': 0.055,   // Maine
  'MD': 0.06,    // Maryland
  'MA': 0.0625,  // Massachusetts
  'MI': 0.06,    // Michigan
  'MN': 0.06875, // Minnesota
  'MS': 0.07,    // Mississippi
  'MO': 0.04225, // Missouri
  'MT': 0.00,    // Montana
  'NE': 0.055,   // Nebraska
  'NV': 0.0685,  // Nevada
  'NH': 0.00,    // New Hampshire
  'NJ': 0.06625, // New Jersey
  'NM': 0.05125, // New Mexico
  'NY': 0.08,    // New York
  'NC': 0.0475,  // North Carolina
  'ND': 0.05,    // North Dakota
  'OH': 0.0575,  // Ohio
  'OK': 0.045,   // Oklahoma
  'OR': 0.00,    // Oregon
  'PA': 0.06,    // Pennsylvania
  'RI': 0.07,    // Rhode Island
  'SC': 0.06,    // South Carolina
  'SD': 0.045,   // South Dakota
  'TN': 0.07,    // Tennessee
  'TX': 0.0625,  // Texas
  'UT': 0.0485,  // Utah
  'VT': 0.06,    // Vermont
  'VA': 0.053,   // Virginia
  'WA': 0.065,   // Washington
  'WV': 0.06,    // West Virginia
  'WI': 0.05,    // Wisconsin
  'WY': 0.04,    // Wyoming
}

export function calculateShipping(subtotal: number, shippingOptionId: string): number {
  const option = SHIPPING_OPTIONS.find(opt => opt.id === shippingOptionId)
  if (!option) return 0

  // Free standard shipping on orders over $50
  if (option.id === 'standard' && subtotal >= 50) {
    return 0
  }

  return option.price
}

export function calculateTax(subtotal: number, state: string): TaxInfo {
  const rate = STATE_TAX_RATES[state.toUpperCase()] || 0
  const amount = subtotal * rate

  return {
    rate,
    amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
  }
}

export function calculateOrderTotal(
  subtotal: number, 
  shippingOptionId: string, 
  state: string
): {
  subtotal: number
  shipping: number
  tax: TaxInfo
  total: number
} {
  const shipping = calculateShipping(subtotal, shippingOptionId)
  const tax = calculateTax(subtotal + shipping, state)
  const total = subtotal + shipping + tax.amount

  return {
    subtotal,
    shipping,
    tax,
    total: Math.round(total * 100) / 100
  }
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
