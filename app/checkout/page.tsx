"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useUser, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Loader2, ArrowLeft, CreditCard, Truck, RefreshCw, Clock, Package, CheckCircle2, Phone, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { calculateOrderTotalWithRate, ShippingOption } from "@/lib/shipping"

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [paymentCanceled, setPaymentCanceled] = useState(false)
  const [userFormPrefilled, setUserFormPrefilled] = useState(false)
  const [shippingRates, setShippingRates] = useState<ShippingOption[]>([])
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingRatesLoaded, setShippingRatesLoaded] = useState(false)
  const [shippingProgress, setShippingProgress] = useState<{
    phase: 'validating' | 'fetching' | 'complete';
    message: string;
    hasInitialRates: boolean;
  }>({
    phase: 'complete',
    message: '',
    hasInitialRates: false
  })
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingProvider, setShippingProvider] = useState<{
    provider: 'USPS' | 'TQL' | null;
    expectedProvider: 'USPS' | 'TQL' | null;
    totalQuantity: number;
    fallbackUsed: boolean;
  }>({
    provider: null,
    expectedProvider: null,
    totalQuantity: 0,
    fallbackUsed: false
  })
  const [showAllShippingOptions, setShowAllShippingOptions] = useState(false)
  const [userManuallyCollapsed, setUserManuallyCollapsed] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    suggestions: any[] | null;
    error: string | null;
  }>({
    isValidating: false,
    isValid: null,
    suggestions: null,
    error: null
  })
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
    shippingOption: "",
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

  // Clear shipping rates when address changes
  useEffect(() => {
    // Reset shipping rates when address changes
    setShippingRates([])
    setShippingRatesLoaded(false)
    setShowAllShippingOptions(false)
    setUserManuallyCollapsed(false) // Reset manual collapse flag when address changes
  }, [formState.shippingAddress, formState.shippingCity, formState.shippingState, formState.shippingZip, formState.shippingCountry])

  // Validate address and fetch shipping rates when address changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // First validate address, then fetch shipping rates
      validateAddress()
      // Only fetch shipping rates if we haven't loaded them yet and not currently loading
      if (!shippingRatesLoaded && !loadingShipping) {
        fetchShippingRates()
      }
    }, 1500) // Debounce API calls - longer delay for validation + shipping

    return () => clearTimeout(timer)
  }, [formState.shippingAddress, formState.shippingCity, formState.shippingState, formState.shippingZip, formState.shippingCountry])

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

  // Validate address with USPS
  const validateAddress = async () => {
    // Check if we have enough address info to validate
    if (!formState.shippingAddress || !formState.shippingCity ||
        !formState.shippingState || !formState.shippingZip) {
      return
    }

    setAddressValidation(prev => ({ ...prev, isValidating: true, error: null }))

    try {
      const response = await fetch('/api/address/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: {
            name: formState.shippingName || 'Customer',
            address: formState.shippingAddress,
            city: formState.shippingCity,
            state: formState.shippingState,
            zip: formState.shippingZip,
            country: formState.shippingCountry,
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.valid) {
          setAddressValidation({
            isValidating: false,
            isValid: true,
            suggestions: null,
            error: null
          })

          // If address was standardized, optionally update the form
          if (data.standardizedAddress) {
            console.log('Address standardized:', data.standardizedAddress)
            // Optionally auto-update form with standardized address
            // setFormState(prev => ({ ...prev, ...data.standardizedAddress }))
          }
        } else {
          setAddressValidation({
            isValidating: false,
            isValid: false,
            suggestions: data.suggestions || null,
            error: data.error || 'Address could not be validated'
          })
        }
      } else {
        throw new Error(data.error || 'Address validation failed')
      }
    } catch (error) {
      console.error('Error validating address:', error)
      setAddressValidation({
        isValidating: false,
        isValid: false,
        suggestions: null,
        error: error instanceof Error ? error.message : 'Failed to validate address'
      })
    }
  }



  // Convert rate data to ShippingOption format
  const formatShippingRate = (rate: any): ShippingOption => ({
    id: rate.id,
    name: rate.displayName || `${rate.carrier} ${rate.service}`,
    description: rate.estimatedDelivery || 'Standard delivery',
    price: rate.rate,
    estimatedDays: rate.estimatedDelivery || '',
    carrier: rate.carrier,
    service: rate.service,
    delivery_date: rate.delivery_date,
    delivery_date_guaranteed: rate.delivery_date_guaranteed
  })

  // Fetch shipping rates (with prevention of multiple calls)
  const fetchShippingRates = async (forceRefresh = false) => {
    // Check if we have enough address info to fetch rates
    if (!formState.shippingAddress || !formState.shippingCity ||
        !formState.shippingState || !formState.shippingZip) {
      return
    }

    // Prevent multiple calls unless forced refresh
    if (shippingRatesLoaded && !forceRefresh) {
      return
    }

    setLoadingShipping(true)
    setShippingError(null)
    setShippingRates([]) // Clear existing rates
    setShippingRatesLoaded(false)
    setShippingProgress({
      phase: 'validating',
      message: 'Validating address...',
      hasInitialRates: false
    })

    try {
      // Get shipping rates
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: {
            name: formState.shippingName || 'Customer',
            address: formState.shippingAddress,
            city: formState.shippingCity,
            state: formState.shippingState,
            zip: formState.shippingZip,
            country: formState.shippingCountry,
          },
          cartItems: items
        }),
      })

      const data = await response.json()

      if (data.success && data.rates) {
        setShippingProgress({
          phase: 'complete',
          message: '',
          hasInitialRates: true
        })

        // Convert shipping rates to our ShippingOption format
        const formattedRates: ShippingOption[] = data.rates.map(formatShippingRate)

        // Sort rates by price (cheapest first)
        const sortedRates = formattedRates.sort((a, b) => {
          // If one is "Contact for Quote" (price = 0), put it at the end
          if (a.price === 0 && b.price !== 0) return 1
          if (b.price === 0 && a.price !== 0) return -1
          if (a.price === 0 && b.price === 0) return 0

          // Normal price sorting (cheapest first)
          return a.price - b.price
        })

        // Set all rates immediately - pagination will be handled by display logic
        setShippingRates(sortedRates)

        // Store provider information for display
        setShippingProvider({
          provider: data.provider,
          expectedProvider: data.expectedProvider,
          totalQuantity: data.totalQuantity,
          fallbackUsed: data.fallbackUsed || false
        })

        // Reset the show all options state when new rates are loaded - do this BEFORE auto-selection
        setShowAllShippingOptions(false)
        setUserManuallyCollapsed(false) // Reset manual collapse flag for new rates

        // Auto-select the first (cheapest) option if no option is selected
        if (!formState.shippingOption && sortedRates.length > 0) {
          setFormState(prev => ({
            ...prev,
            shippingOption: sortedRates[0].id
          }))
        }
        // Mark shipping rates as loaded
        setShippingRatesLoaded(true)
        // Stop loading indicator - SUCCESS PATH FIX
        setLoadingShipping(false)
      } else {
        throw new Error(data.error || 'Failed to fetch shipping rates')
      }

    } catch (error) {
      console.error('Error fetching shipping rates:', error)
      setShippingRates([])
      setShippingProvider({
        provider: null,
        expectedProvider: null,
        totalQuantity: 0,
        fallbackUsed: false
      })
      setShippingProgress({
        phase: 'complete',
        message: '',
        hasInitialRates: false
      })
      setShippingError(error instanceof Error ? error.message : 'Failed to get shipping rates. Please check your address and try again.')
      // Stop loading indicator - ERROR PATH (already present)
      setLoadingShipping(false)
    }
  }

  // No longer needed - we'll handle "same as shipping" logic in the form submission

  // Format price with null/undefined safety
  const formatPrice = (price: number | undefined | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "0.00"
    }
    return price.toFixed(2)
  }

  // Calculate displayed shipping rates (top 3 by default, or all if expanded)
  const displayedShippingRates = useMemo(() => {
    if (shippingRates.length === 0) return []

    // During progressive loading, we might have all rates loaded but want to show only top 3
    // unless user has explicitly requested to see all options
    const result = showAllShippingOptions ? shippingRates : shippingRates.slice(0, 3)
    console.log('displayedShippingRates:', {
      totalRates: shippingRates.length,
      showAllShippingOptions,
      displayedCount: result.length
    })
    return result
  }, [shippingRates, showAllShippingOptions])



  // Check if selected option is not in top 3 and auto-expand if needed
  // Only expand if user manually selected an option that's not in top 3 AND user hasn't manually collapsed
  useEffect(() => {
    if (formState.shippingOption && !showAllShippingOptions && !userManuallyCollapsed && shippingRates.length > 3 && shippingRatesLoaded) {
      const top3Rates = shippingRates.slice(0, 3)
      const selectedOptionInTop3 = top3Rates.some(rate => rate.id === formState.shippingOption)

      console.log('Auto-expansion check:', {
        selectedOption: formState.shippingOption,
        firstOptionId: shippingRates[0]?.id,
        selectedOptionInTop3,
        showAllShippingOptions,
        userManuallyCollapsed,
        totalRates: shippingRates.length
      })

      // Only auto-expand if the selected option is not in top 3 AND it's not the auto-selected first option
      if (!selectedOptionInTop3 && formState.shippingOption !== shippingRates[0]?.id) {
        console.log('Auto-expanding shipping options')
        setShowAllShippingOptions(true)
      }
    }
  }, [formState.shippingOption, showAllShippingOptions, userManuallyCollapsed, shippingRates, shippingRatesLoaded])

  // Calculate order total using useMemo for performance and consistency
  const orderTotal = useMemo(() => {
    // Get the selected shipping rate
    const selectedShippingRate = shippingRates.find(rate => rate.id === formState.shippingOption)
    const shippingCost = selectedShippingRate ? selectedShippingRate.price : 0

    // Use shipping rate for calculation
    return calculateOrderTotalWithRate(totalPrice, shippingCost, formState.shippingState || 'AZ')
  }, [totalPrice, formState.shippingOption, formState.shippingState, shippingRates])

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
      const selectedShippingRate = shippingRates.find(rate => rate.id === formState.shippingOption)
      const shippingCost = selectedShippingRate ? selectedShippingRate.price : 0
      const finalOrderTotal = calculateOrderTotalWithRate(totalPrice, shippingCost, formState.shippingState || 'AZ')

      console.log('Creating real order with total:', finalOrderTotal.total)

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
          orderTotal: finalOrderTotal
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

                {/* Address Validation Status */}
                {addressValidation.isValidating && (
                  <div className="flex items-center justify-center py-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Validating address...</span>
                  </div>
                )}

                {addressValidation.isValid === true && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <p className="text-sm text-green-800">✓ Address validated</p>
                  </div>
                )}

                {addressValidation.isValid === false && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm text-red-800">⚠ Address validation failed: {addressValidation.error}</p>
                    {addressValidation.suggestions && addressValidation.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-700">Suggested corrections:</p>
                        <ul className="text-xs text-red-700 mt-1">
                          {addressValidation.suggestions.map((suggestion, index) => (
                            <li key={index}>• {suggestion.address}, {suggestion.city}, {suggestion.state} {suggestion.zip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
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
                {shippingProvider.provider && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          shippingProvider.provider === 'USPS' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="font-medium">
                          {shippingProvider.provider === 'USPS' ? 'USPS Shipping' : 'LTL Freight Shipping'}
                        </span>
                      </div>
                      <span className="text-gray-600">
                        {shippingProvider.totalQuantity.toLocaleString()} dowels
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {shippingProvider.provider === 'USPS'
                        ? 'Standard parcel delivery for orders up to 5,000 dowels'
                        : 'Professional freight delivery for bulk orders over 5,000 dowels'
                      }
                      {shippingProvider.fallbackUsed && (
                        <span className="text-amber-600 ml-1">
                          • Using fallback shipping method
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loadingShipping && (
                  <div className="py-12">
                    <div className="text-center space-y-4">
                      <div className="relative inline-flex">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                        <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-amber-400 opacity-20"></div>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-800">
                          {shippingProgress.message || 'Loading shipping options...'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Finding the best rates for your delivery
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced progress indicator for freight shipping */}
                {loadingShipping && shippingProgress.phase === 'fetching' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Getting freight quotes from multiple carriers
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          This may take a moment to find the best rates for your bulk order
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {shippingError && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 rounded-xl mb-6 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Shipping Error</p>
                        <p className="text-sm text-red-700 mt-1">{shippingError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fetchShippingRates(true)}
                          className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced shipping rates display */}
                {shippingRates.length > 0 && (
                  <>
                    {shippingProvider.provider && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              shippingProvider.provider === 'USPS' ? 'bg-blue-500' : 'bg-green-500'
                            } shadow-sm`}></div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-800">
                                  {shippingProvider.provider === 'USPS' ? 'USPS Shipping' : 'LTL Freight Shipping'}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {shippingRates.length} option{shippingRates.length !== 1 ? 's' : ''}
                                </Badge>
                                {!showAllShippingOptions && shippingRates.length > 3 && (
                                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                                    Showing top 3
                                  </Badge>
                                )}
                                {shippingRatesLoaded && (
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Loaded
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {shippingProvider.provider === 'TQL'
                                  ? 'Professional freight carriers for your bulk order. Rates include pickup and delivery to commercial addresses with loading docks.'
                                  : 'Standard USPS delivery options for your order.'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-700">
                                {shippingProvider.totalQuantity.toLocaleString()} dowels
                              </p>
                              <p className="text-xs text-gray-500">
                                {shippingProvider.provider === 'USPS' ? 'Parcel delivery' : 'Freight delivery'}
                              </p>
                            </div>
                            {shippingRatesLoaded && !loadingShipping && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchShippingRates(true)}
                                className="text-gray-600 hover:text-gray-800 hover:bg-white/50 transition-colors"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {shippingProvider.fallbackUsed && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-700 flex items-center">
                              <Package className="h-3 w-3 mr-1" />
                              Using fallback shipping method
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="transition-all duration-300 ease-in-out">
                      <RadioGroup
                        key={`shipping-options-${showAllShippingOptions ? 'all' : 'top3'}`}
                        value={formState.shippingOption}
                        onValueChange={(value) => handleSelectChange("shippingOption", value)}
                        className="space-y-4"
                      >
                        {displayedShippingRates.map((option: ShippingOption) => (
                          <div
                            key={option.id}
                            className={`relative group cursor-pointer transition-all duration-200 ${
                              formState.shippingOption === option.id
                                ? 'ring-2 ring-amber-500 ring-offset-2 shadow-lg'
                                : 'hover:shadow-md hover:border-gray-300'
                            }`}
                          >
                            <div className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                              formState.shippingOption === option.id
                                ? 'border-amber-500 bg-amber-50/50'
                                : 'border-gray-200 bg-white hover:bg-gray-50/50'
                            }`}>
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">
                                  <RadioGroupItem
                                    value={option.id}
                                    id={option.id}
                                    className={`${
                                      formState.shippingOption === option.id
                                        ? 'border-amber-500 text-amber-500'
                                        : ''
                                    }`}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <Label
                                        htmlFor={option.id}
                                        className="font-semibold text-gray-900 cursor-pointer text-base leading-tight"
                                      >
                                        {option.name}
                                      </Label>
                                      {option.carrier && (
                                        <div className="flex items-center space-x-2 mt-1">
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${
                                              option.carrier === 'USPS'
                                                ? 'border-blue-300 text-blue-700 bg-blue-50'
                                                : 'border-green-300 text-green-700 bg-green-50'
                                            }`}
                                          >
                                            {option.carrier}
                                          </Badge>
                                          {option.service && (
                                            <span className="text-xs text-gray-500">
                                              {option.service}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-right ml-4">
                                      {option.price === 0 ? (
                                        <div className="text-right">
                                          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                                            Contact for Quote
                                          </Badge>
                                        </div>
                                      ) : (
                                        <div className="text-right">
                                          <span className="text-xl font-bold text-gray-900">
                                            ${formatPrice(option.price)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {option.description}
                                    </p>

                                    {option.estimatedDays && (
                                      <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="h-4 w-4 mr-1.5" />
                                        <span>{option.estimatedDays}</span>
                                      </div>
                                    )}

                                    {option.price === 0 && (
                                      <div className="flex items-center text-sm text-amber-600 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                                        <Phone className="h-4 w-4 mr-2" />
                                        <span>Call (480) 581-7145 for freight shipping quote</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Selected indicator */}
                              {formState.shippingOption === option.id && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-200">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                  {/* Enhanced "Show All Options" button */}
                  {shippingRates.length > 3 && !loadingShipping && (
                    <div className="mt-6 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        data-expand-button
                        onClick={() => {
                          const newShowAll = !showAllShippingOptions
                          console.log('Button clicked:', {
                            currentShowAll: showAllShippingOptions,
                            newShowAll,
                            totalRates: shippingRates.length,
                            currentDisplayed: displayedShippingRates.length
                          })
                          setShowAllShippingOptions(newShowAll)
                          // If user is collapsing (going from true to false), mark as manually collapsed
                          // If user is expanding (going from false to true), reset the manual collapse flag
                          if (!newShowAll) {
                            setUserManuallyCollapsed(true)
                          } else {
                            setUserManuallyCollapsed(false)
                            // When expanding, scroll to keep the button area in view after animation
                            setTimeout(() => {
                              const button = document.querySelector('[data-expand-button]')
                              if (button) {
                                button.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'center'
                                })
                              }
                            }, 300) // Wait for animation to start
                          }
                        }}
                        className="group relative px-6 py-3 text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {showAllShippingOptions ? (
                              `Show Top 3 Options`
                            ) : (
                              `Show All ${shippingRates.length} Options`
                            )}
                          </span>
                          <div className="transition-transform duration-200">
                            {showAllShippingOptions ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>

                        {/* Subtle background animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl -z-10" />
                      </Button>

                      {!showAllShippingOptions && (
                        <p className="text-xs text-gray-500 mt-2">
                          {shippingRates.length - 3} more shipping options available
                        </p>
                      )}
                    </div>
                  )}


                  </>
                )}

                {!loadingShipping && shippingRates.length === 0 && !shippingError && (
                  <div className="text-center py-12">
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700">Ready for shipping options</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter your shipping address above to see available delivery options
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  disabled={isSubmitting || (shippingRates.find(rate => rate.id === formState.shippingOption)?.price === 0)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating checkout session...
                    </>
                  ) : shippingRates.find(rate => rate.id === formState.shippingOption)?.price === 0 ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Contact for Freight Quote - (480) 581-7145
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment - ${formatPrice((orderTotal?.subtotal || 0) + (orderTotal?.shipping || 0))}
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

                {/* Shipping Method Info */}
                {shippingProvider.provider && (
                  <div className="pt-2 pb-2 border-b">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Shipping Method:</span>
                      <span className="font-medium">
                        {shippingProvider.provider === 'USPS' ? 'USPS Parcel' : 'LTL Freight'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {shippingProvider.provider === 'USPS'
                        ? 'Standard delivery for orders up to 5,000 dowels'
                        : 'Professional freight delivery for bulk orders'
                      }
                    </p>
                  </div>
                )}

                {/* Order Calculations */}
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

                  <div className="flex justify-between text-sm text-gray-500 italic">
                    <span>Tax:</span>
                    <span>Calculated during payment</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-amber-600">${formatPrice((orderTotal?.subtotal || 0) + (orderTotal?.shipping || 0))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
