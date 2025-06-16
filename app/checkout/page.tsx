"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useUser, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Loader2, ArrowLeft, CreditCard, Truck } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SHIPPING_OPTIONS, calculateOrderTotal, formatPrice as formatCurrency } from "@/lib/shipping"

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [paymentCanceled, setPaymentCanceled] = useState(false)
  const [userFormPrefilled, setUserFormPrefilled] = useState(false)
  const { user, isLoaded } = useUser()
  const { isSignedIn, userId } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { items, clearCart, totalPrice } = useCart()

  // Form state
  const [formState, setFormState] = useState({
    // Shipping info
    shippingName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "US",

    // Billing info
    billingName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "US",

    // Options
    sameAsBilling: true,
    shippingOption: "standard",
  })

  // Prefill form with user information if available (only once)
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !userFormPrefilled) {
      setFormState(prev => ({
        ...prev,
        shippingName: user.fullName || user.firstName || "",
        billingName: user.fullName || user.firstName || "",
      }))
      setUserFormPrefilled(true)
    }
  }, [isLoaded, isSignedIn, user, userFormPrefilled])

  // Check for payment cancellation (only once on mount)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('canceled') === 'true') {
      setPaymentCanceled(true)
      toast({
        title: "Payment canceled",
        description: "Your payment was canceled. You can try again when you're ready.",
        variant: "destructive",
      })
    }
  }, []) // Remove toast dependency to prevent loops

  // Check if cart is empty and redirect if needed (only once on mount)
  useEffect(() => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      })
      router.push('/cart')
    }
  }, []) // Remove dependencies to prevent loops - only check on mount

  // Note: Authentication is handled by middleware, so this useEffect is not needed
  // The middleware protects this route, so if we reach this page, the user is authenticated

  // Handle form input changes (optimized to prevent loops)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => {
      // Only update if the value actually changed
      if (prev[name as keyof typeof prev] === value) {
        return prev
      }
      return {
        ...prev,
        [name]: value
      }
    })
  }

  // Handle select changes (optimized to prevent loops)
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => {
      // Only update if the value actually changed
      if (prev[name as keyof typeof prev] === value) {
        return prev
      }
      return {
        ...prev,
        [name]: value
      }
    })
  }

  // Handle same as shipping checkbox
  const handleSameAsShippingChange = (checked: boolean | string) => {
    const isChecked = checked === true

    setFormState(prev => {
      if (isChecked) {
        // Copy shipping info to billing when checked
        return {
          ...prev,
          billingName: prev.shippingName,
          billingAddress: prev.shippingAddress,
          billingCity: prev.shippingCity,
          billingState: prev.shippingState,
          billingZip: prev.shippingZip,
          billingCountry: prev.shippingCountry,
          sameAsBilling: true
        }
      } else {
        // Just update the checkbox state when unchecked
        return {
          ...prev,
          sameAsBilling: false
        }
      }
    })
  }

  // No longer needed - we'll handle "same as shipping" logic in the form submission

  // Format price with null/undefined safety
  const formatPrice = (price: number | undefined | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "0.00"
    }
    return price.toFixed(2)
  }

  // Handle form submission with Stripe
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    // Debug authentication state
    console.log('Authentication state:', {
      isLoaded,
      isSignedIn,
      userId,
      user: !!user,
      userFullName: user?.fullName,
      userFirstName: user?.firstName
    })

    // Since middleware protects this route, we should have a user
    // But let's add a safety check for the form submission
    if (!isLoaded) {
      toast({
        title: "Loading...",
        description: "Please wait while we verify your authentication.",
        variant: "default",
      })
      return
    }

    // This should not happen due to middleware protection, but safety check
    if (!user || !userId) {
      console.error('Unexpected: User not found despite middleware protection:', { isLoaded, isSignedIn, userId, user: !!user })
      toast({
        title: "Authentication error",
        description: "There was an issue with your authentication. Please try signing in again.",
        variant: "destructive",
      })
      router.push('/sign-in?redirect=/checkout')
      return
    }

    // Validate required fields
    if (!formState.shippingName || !formState.shippingAddress || !formState.shippingCity ||
        !formState.shippingState || !formState.shippingZip) {
      toast({
        title: "Missing information",
        description: "Please fill in all required shipping information.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Calculate final order total including shipping and tax
      const orderTotal = calculateOrderTotal(totalPrice, formState.shippingOption, formState.shippingState || 'CA')

      console.log('Creating real order with total:', orderTotal.total)

      // Create Stripe checkout session with real user data
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          shippingInfo: {
            name: formState.shippingName,
            address: formState.shippingAddress,
            city: formState.shippingCity,
            state: formState.shippingState,
            zip: formState.shippingZip,
            country: formState.shippingCountry,
          },
          billingInfo: {
            name: formState.billingName,
            address: formState.billingAddress,
            city: formState.billingCity,
            state: formState.billingState,
            zip: formState.billingZip,
            country: formState.billingCountry,
          },
          shippingOption: formState.shippingOption,
          orderTotal: orderTotal
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: "Error processing payment",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Since middleware protects this route, user should be authenticated
  // This is a safety check that should rarely trigger
  if (!user || !userId) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Authentication error occurred.</p>
            <Button onClick={() => router.push('/sign-in?redirect=/checkout')}>
              Sign In Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">


      <div className="flex items-center mb-6">
        <Link href="/cart" className="flex items-center text-gray-600 hover:text-amber-600 mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitOrder}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="shippingName">Full Name</Label>
                    <Input
                      id="shippingName"
                      name="shippingName"
                      value={formState.shippingName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="shippingAddress">Address</Label>
                    <Input
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formState.shippingAddress}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">City</Label>
                      <Input 
                        id="shippingCity" 
                        name="shippingCity" 
                        value={formState.shippingCity} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingState">State/Province</Label>
                      <Input 
                        id="shippingState" 
                        name="shippingState" 
                        value={formState.shippingState} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingZip">ZIP/Postal Code</Label>
                      <Input 
                        id="shippingZip" 
                        name="shippingZip" 
                        value={formState.shippingZip} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingCountry">Country</Label>
                      <Select
                        key="shipping-country"
                        value={formState.shippingCountry}
                        onValueChange={(value) => handleSelectChange("shippingCountry", value)}
                      >
                        <SelectTrigger id="shippingCountry">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Billing Information</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sameAsBilling" 
                    checked={formState.sameAsBilling} 
                    onCheckedChange={handleSameAsShippingChange} 
                  />
                  <Label htmlFor="sameAsBilling" className="text-sm font-normal">
                    Same as shipping
                  </Label>
                </div>
              </CardHeader>
              <CardContent className={`space-y-4 ${formState.sameAsBilling ? 'opacity-50' : ''}`}>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="billingName">Full Name</Label>
                    <Input 
                      id="billingName" 
                      name="billingName" 
                      value={formState.billingName} 
                      onChange={handleInputChange} 
                      required 
                      disabled={formState.sameAsBilling}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="billingAddress">Address</Label>
                    <Input 
                      id="billingAddress" 
                      name="billingAddress" 
                      value={formState.billingAddress} 
                      onChange={handleInputChange} 
                      required 
                      disabled={formState.sameAsBilling}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingCity">City</Label>
                      <Input 
                        id="billingCity" 
                        name="billingCity" 
                        value={formState.billingCity} 
                        onChange={handleInputChange} 
                        required 
                        disabled={formState.sameAsBilling}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingState">State/Province</Label>
                      <Input 
                        id="billingState" 
                        name="billingState" 
                        value={formState.billingState} 
                        onChange={handleInputChange} 
                        required 
                        disabled={formState.sameAsBilling}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingZip">ZIP/Postal Code</Label>
                      <Input 
                        id="billingZip" 
                        name="billingZip" 
                        value={formState.billingZip} 
                        onChange={handleInputChange} 
                        required 
                        disabled={formState.sameAsBilling}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingCountry">Country</Label>
                      <Select
                        key="billing-country"
                        value={formState.billingCountry}
                        onValueChange={(value) => handleSelectChange("billingCountry", value)}
                        disabled={formState.sameAsBilling}
                      >
                        <SelectTrigger id="billingCountry">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  key="shipping-options"
                  value={formState.shippingOption}
                  onValueChange={(value) => handleSelectChange("shippingOption", value)}
                  className="space-y-3"
                >
                  {SHIPPING_OPTIONS.map((option) => {
                    const isStandardFree = option.id === 'standard' && totalPrice >= 50
                    return (
                      <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={option.id} className="font-medium cursor-pointer">
                              {option.name}
                            </Label>
                            <span className="font-medium">
                              {isStandardFree ? 'FREE' : formatCurrency(option.price)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {option.description} • {option.estimatedDays}
                          </p>
                          {option.id === 'standard' && totalPrice < 50 && (
                            <p className="text-xs text-amber-600 mt-1">
                              Add ${formatCurrency(50 - totalPrice)} more for free shipping
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Secure Payment with Stripe</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your payment information will be processed securely by Stripe.
                    We accept all major credit cards.
                  </p>
                </div>

                {paymentCanceled && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your previous payment was canceled. You can try again by clicking the button below.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating checkout session...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment - ${formatPrice(calculateOrderTotal(totalPrice, formState.shippingOption, formState.shippingState || 'CA').total)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cart Items */}
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Tier: {item.tier}</p>
                    </div>
                    <p className="font-medium">${formatPrice((item?.quantity || 0) * (item?.pricePerUnit || 0))}</p>
                  </div>
                ))}

                {/* Order Calculations */}
                {(() => {
                  const orderTotal = calculateOrderTotal(totalPrice, formState.shippingOption, formState.shippingState || 'CA')
                  return (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${formatPrice(orderTotal?.subtotal || 0)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>
                          {(orderTotal?.shipping || 0) === 0 ? 'FREE' : `$${formatPrice(orderTotal?.shipping || 0)}`}
                        </span>
                      </div>

                      {(orderTotal?.tax?.amount || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Tax ({((orderTotal?.tax?.rate || 0) * 100).toFixed(1)}%):</span>
                          <span>${formatPrice(orderTotal?.tax?.amount || 0)}</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-amber-600">${formatPrice(orderTotal?.total || 0)}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
