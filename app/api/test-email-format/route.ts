import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Simulate order details with multiple tiers
    const mockOrderDetails = {
      cartItems: [
        {
          tier: '5,000-20,000',
          quantity: 5000,
          pricePerUnit: 0.072
        },
        {
          tier: '20,001-50,000', 
          quantity: 10000,
          pricePerUnit: 0.065
        }
      ],
      subtotal: 1010,
      shippingCost: 67.33,
      taxAmount: 52.23,
      taxRate: 0.0485,
      orderTotal: 1129.56
    }

    // Test the consolidation logic
    const totalQuantity = mockOrderDetails.cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const totalItemPrice = mockOrderDetails.cartItems.reduce((sum: number, item: any) => sum + (item.quantity * item.pricePerUnit), 0)
    
    // Create tier description showing all tiers and quantities
    const tierDescription = mockOrderDetails.cartItems.length > 1 
      ? mockOrderDetails.cartItems.map((item: any) => `${item.tier} (${item.quantity.toLocaleString()})`).join(', ')
      : mockOrderDetails.cartItems[0].tier
    
    // Create single consolidated order item
    const orderItems = [{
      name: 'Force Dowels',
      quantity: totalQuantity,
      tier: tierDescription,
      pricePerUnit: totalItemPrice / totalQuantity // Average price per unit
    }]

    return NextResponse.json({
      success: true,
      message: 'Email format test completed',
      data: {
        originalCartItems: mockOrderDetails.cartItems,
        consolidatedOrderItems: orderItems,
        calculations: {
          totalQuantity,
          totalItemPrice,
          averagePricePerUnit: totalItemPrice / totalQuantity,
          tierDescription
        }
      }
    })

  } catch (error) {
    console.error('Error testing email format:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
