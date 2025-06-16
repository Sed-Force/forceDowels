"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [sessionData, setSessionData] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()
  const { toast } = useToast()

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const checkPaymentStatus = async () => {
      try {
        console.log('🔍 Checking payment status for session:', sessionId)
        const response = await fetch(`/api/stripe/session-status?session_id=${sessionId}`)

        console.log('📡 Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Payment status check failed:', errorData)
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to check payment status`)
        }

        const data = await response.json()
        console.log('✅ Payment status data:', data)
        setSessionData(data)

        if (data.payment_status === 'paid') {
          setStatus('success')
          // Clear the cart after successful payment
          clearCart()
          toast({
            title: "Payment successful!",
            description: "Your order has been processed and you will receive a confirmation email shortly.",
          })
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setStatus('error')
        toast({
          title: "Error",
          description: "Failed to verify payment status. Please contact support if you were charged.",
          variant: "destructive",
        })
      }
    }

    checkPaymentStatus()
  }, [sessionId, clearCart, toast])

  const handleViewOrders = () => {
    router.push('/orders')
  }

  const handleContinueShopping = () => {
    router.push('/order')
  }

  if (status === 'loading') {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
              <p className="text-gray-600 text-center">
                Please wait while we verify your payment...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
              <p className="text-gray-600 text-center mb-6">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => router.push('/checkout')} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => router.push('/contact')}>
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Thank you for your order! Your payment has been processed successfully.
              </p>
              
              {sessionData?.customer_email && (
                <p className="text-sm text-gray-500">
                  A confirmation email has been sent to {sessionData.customer_email}
                </p>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleViewOrders}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  View My Orders
                </Button>
                <Button 
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
