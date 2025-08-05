import { NextRequest, NextResponse } from 'next/server'
import { validateGuestCheckout } from '@/lib/guest-checkout-validation'
import { CartItem } from '@/contexts/cart-context'

export async function GET(request: NextRequest) {
  try {
    // Test different cart scenarios
    const testScenarios = [
      {
        name: "Kit Only",
        items: [
          { id: "kit-1", name: "Force Dowels Kit", quantity: 300, tier: "Kit - 300 units", pricePerUnit: 0.12 }
        ] as CartItem[]
      },
      {
        name: "5K Dowels Only",
        items: [
          { id: "dowels-1", name: "Force Dowels", quantity: 5000, tier: "Tier 1", pricePerUnit: 0.10 }
        ] as CartItem[]
      },
      {
        name: "Kit + 5K Dowels",
        items: [
          { id: "kit-1", name: "Force Dowels Kit", quantity: 300, tier: "Kit - 300 units", pricePerUnit: 0.12 },
          { id: "dowels-1", name: "Force Dowels", quantity: 5000, tier: "Tier 1", pricePerUnit: 0.10 }
        ] as CartItem[]
      },
      {
        name: "10K Dowels (Requires Auth)",
        items: [
          { id: "dowels-1", name: "Force Dowels", quantity: 10000, tier: "Tier 2", pricePerUnit: 0.09 }
        ] as CartItem[]
      },
      {
        name: "Kit + 10K Dowels (Requires Auth)",
        items: [
          { id: "kit-1", name: "Force Dowels Kit", quantity: 300, tier: "Kit - 300 units", pricePerUnit: 0.12 },
          { id: "dowels-1", name: "Force Dowels", quantity: 10000, tier: "Tier 2", pricePerUnit: 0.09 }
        ] as CartItem[]
      },
      {
        name: "20K Dowels (Requires Auth)",
        items: [
          { id: "dowels-1", name: "Force Dowels", quantity: 20000, tier: "Tier 3", pricePerUnit: 0.08 }
        ] as CartItem[]
      }
    ]

    const results = testScenarios.map(scenario => {
      const validation = validateGuestCheckout(scenario.items)
      return {
        scenario: scenario.name,
        items: scenario.items.map(item => `${item.name} (${item.quantity})`),
        validation: {
          isAllowed: validation.isAllowed,
          requiresAuth: validation.requiresAuth,
          totalDowelQuantity: validation.totalDowelQuantity,
          hasKits: validation.hasKits,
          reason: validation.reason,
          restrictedItems: validation.restrictedItems
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tiered guest checkout validation test results',
      testResults: results,
      rules: {
        guestCheckoutAllowed: [
          "Kit purchases (any quantity)",
          "Exactly 5,000 dowel orders",
          "Combination of kits + 5,000 dowels"
        ],
        authenticationRequired: [
          "Any dowel orders above 5,000 units",
          "Bulk/wholesale quantities (10K, 15K, 20K+)"
        ]
      }
    })

  } catch (error) {
    console.error('Tiered checkout test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Tiered checkout test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
