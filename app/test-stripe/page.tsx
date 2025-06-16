"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { Loader2, LogIn } from "lucide-react"
import Link from "next/link"

export default function TestStripePage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user, isLoaded } = useUser()

  const testStripeCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to test the Stripe integration.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('Creating real checkout session with authenticated user')

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: 'test-item-1',
              name: 'Test Force Dowels',
              quantity: 100,
              tier: 'Standard',
              pricePerUnit: 0.25,
            }
          ],
          shippingInfo: {
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Test User',
            address: '123 Test St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94102',
            country: 'US',
          },
          billingInfo: {
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Test User',
            address: '123 Test St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94102',
            country: 'US',
          },
          shippingOption: 'standard',
          orderTotal: {
            subtotal: 25.00,
            shipping: 0,
            tax: { amount: 2.18, rate: 0.0725 },
            total: 27.18
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create checkout session',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Stripe Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <>
              <p className="text-sm text-gray-600">
                You need to be signed in to test the production Stripe integration with real order creation.
              </p>
              <Link href="/sign-in">
                <Button className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Test
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                This will create a real checkout session and process a real order (but with test payment data).
              </p>
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <p className="text-sm text-green-800">
                  ✅ Signed in as: {user.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <p className="text-sm text-blue-800">
                  <strong>🔄 Production Mode:</strong> This will create real database entries and send real emails, but use test payment data.
                </p>
              </div>
            </>
          )}

          {user && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Test Card:</strong> 4242 4242 4242 4242<br />
                  <strong>Expiry:</strong> Any future date<br />
                  <strong>CVC:</strong> Any 3 digits
                </p>
              </div>

              <Button
                onClick={testStripeCheckout}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating session...
                  </>
                ) : (
                  'Test Production Checkout ($27.18 with tax)'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
