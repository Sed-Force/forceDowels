"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Loader2, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const user = useUser()
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
    
    // Payment info
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    
    // Options
    sameAsBilling: true,
  })

  // Prefill form with user information if available
  useEffect(() => {
    if (user) {
      setFormState(prev => ({
        ...prev,
        shippingName: user.displayName || "",
        billingName: user.displayName || "",
      }))
    }
  }, [user])

  // Check if cart is empty and redirect if needed
  useEffect(() => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      })
      router.push('/cart')
    }
  }, [items, router, toast])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      })
      router.push('/handler/sign-in?redirect=/checkout')
    }
  }, [user, router, toast])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle same as shipping checkbox
  const handleSameAsShippingChange = (checked: boolean) => {
    setFormState(prev => {
      if (checked) {
        return {
          ...prev,
          billingName: prev.shippingName,
          billingAddress: prev.shippingAddress,
          billingCity: prev.shippingCity,
          billingState: prev.shippingState,
          billingZip: prev.shippingZip,
          billingCountry: prev.shippingCountry,
          sameAsBilling: checked
        }
      } else {
        return {
          ...prev,
          sameAsBilling: checked
        }
      }
    })
  }

  // Update billing info when shipping info changes if "same as shipping" is checked
  useEffect(() => {
    if (formState.sameAsBilling) {
      setFormState(prev => ({
        ...prev,
        billingName: prev.shippingName,
        billingAddress: prev.shippingAddress,
        billingCity: prev.shippingCity,
        billingState: prev.shippingState,
        billingZip: prev.shippingZip,
        billingCountry: prev.shippingCountry,
      }))
    }
  }, [
    formState.shippingName,
    formState.shippingAddress,
    formState.shippingCity,
    formState.shippingState,
    formState.shippingZip,
    formState.shippingCountry,
    formState.sameAsBilling
  ])

  // Format price
  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  // Handle form submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your purchase.",
        variant: "destructive",
      })
      router.push('/handler/sign-in?redirect=/checkout')
      return
    }

    try {
      setIsSubmitting(true)

      // Process each item in the cart
      for (const item of items) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: item.quantity,
            tier: item.tier,
            totalPrice: item.quantity * item.pricePerUnit,
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
            }
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to submit order')
        }
      }

      // Send order confirmation email
      try {
        console.log('Sending order confirmation email...')
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderItems: items,
            totalPrice: totalPrice,
            shippingInfo: {
              name: formState.shippingName,
              address: formState.shippingAddress,
              city: formState.shippingCity,
              state: formState.shippingState,
              zip: formState.shippingZip,
              country: formState.shippingCountry,
            }
          }),
          credentials: 'include', // Important: include cookies for authentication
        })

        if (!emailResponse.ok) {
          console.warn('Failed to send order confirmation email, but order was processed')
        } else {
          setEmailSent(true)
          console.log('Email sent successfully')
        }
      } catch (emailError) {
        console.warn('Error sending confirmation email:', emailError)
        // Continue with checkout even if email fails
      }

      // Clear the cart after successful checkout
      clearCart()

      // Show success message
      toast({
        title: "Order submitted successfully",
        description: emailSent
          ? "Your order has been submitted and is being processed. A confirmation email has been sent to your email address."
          : "Your order has been submitted and is being processed. (Note: We couldn't send a confirmation email at this time.)",
      })

      // Redirect to orders page
      router.push('/orders')
    } catch (error) {
      console.error('Error submitting order:', error)
      toast({
        title: "Error submitting order",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null
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
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      name="cardNumber" 
                      value={formState.cardNumber} 
                      onChange={handleInputChange} 
                      placeholder="1234 5678 9012 3456"
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Expiration Date</Label>
                      <Input 
                        id="cardExpiry" 
                        name="cardExpiry" 
                        value={formState.cardExpiry} 
                        onChange={handleInputChange} 
                        placeholder="MM/YY"
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input 
                        id="cardCvc" 
                        name="cardCvc" 
                        value={formState.cardCvc} 
                        onChange={handleInputChange} 
                        placeholder="123"
                        required 
                      />
                    </div>
                  </div>
                </div>
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Place Order - ${formatPrice(totalPrice)}
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
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Tier: {item.tier}</p>
                    </div>
                    <p className="font-medium">${formatPrice(item.quantity * item.pricePerUnit)}</p>
                  </div>
                ))}
                
                <div className="flex justify-between pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-amber-600">${formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
