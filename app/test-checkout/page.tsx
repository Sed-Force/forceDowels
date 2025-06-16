"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Plus } from "lucide-react"

export default function TestCheckoutPage() {
  const { addItem, items, totalPrice } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const testItems = [
    {
      id: "test-dowel-1",
      name: "Standard Force Dowels",
      tier: "Standard",
      pricePerUnit: 0.25,
      quantity: 100
    },
    {
      id: "test-dowel-2", 
      name: "Premium Force Dowels",
      tier: "Premium",
      pricePerUnit: 0.35,
      quantity: 50
    },
    {
      id: "test-dowel-3",
      name: "Industrial Force Dowels", 
      tier: "Industrial",
      pricePerUnit: 0.45,
      quantity: 25
    }
  ]

  const addTestItems = async () => {
    setIsAdding(true)
    
    try {
      testItems.forEach(item => {
        addItem(item.id, item.name, item.quantity, item.tier, item.pricePerUnit)
      })
      
      toast({
        title: "Test items added!",
        description: "Added test items to your cart. Ready for checkout testing.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add test items to cart.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const goToCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some test items first.",
        variant: "destructive",
      })
      return
    }
    router.push('/checkout')
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Checkout Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This page helps you test the complete checkout flow by adding test items to your cart.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Test Items Available:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                {testItems.map((item, index) => (
                  <li key={`test-item-${item.id}-${index}`}>
                    • {item.name} - {item.quantity} units @ ${item.pricePerUnit} each
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={addTestItems}
                disabled={isAdding}
                className="flex-1"
              >
                {isAdding ? (
                  <>
                    <Plus className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Test Items to Cart
                  </>
                )}
              </Button>

              <Button 
                onClick={goToCheckout}
                variant="outline"
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Go to Checkout
              </Button>
            </div>

            {items.length > 0 && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Current Cart:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  {items.map((item, index) => (
                    <li key={`cart-item-${item.id}-${index}`}>
                      • {item.name} - {item.quantity} units @ ${item.pricePerUnit} each
                    </li>
                  ))}
                </ul>
                <p className="font-medium text-green-800 mt-2">
                  Total: ${(totalPrice || 0).toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout Flow Test Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Add Test Items to Cart" to populate your cart</li>
              <li>Click "Go to Checkout" to start the checkout process</li>
              <li>Fill in shipping information (any valid US address)</li>
              <li>Select a shipping option (try different ones to see price changes)</li>
              <li>Review the order summary with tax and shipping calculations</li>
              <li>Click "Proceed to Payment" to go to Stripe Checkout</li>
              <li>Use test card: <code className="bg-gray-100 px-1 rounded">4242 4242 4242 4242</code></li>
              <li>Complete payment and verify success page works</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
