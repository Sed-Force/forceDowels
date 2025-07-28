"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Lock, Loader2, ShoppingCart, Plus, Minus, Info } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { PRICING_TIERS, getTierInfo, formatNumber as formatNum, formatCurrency, formatExactPrice, isValidQuantityIncrement, roundToValidQuantity } from "@/lib/pricing"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CardDescription, CardFooter } from "@/components/ui/card"

export default function OrderPage() {
  const [quantity, setQuantity] = useState<number>(5000)
  const [selectedTier, setSelectedTier] = useState<string>("5,000-20,000")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isKit, setIsKit] = useState(false)
  const { toast } = useToast()
  const user = useUser()
  const router = useRouter()
  const { addItem, items } = useCart()

  // Use the pricing tiers from the pricing utility
  const tiers = PRICING_TIERS

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value.replace(/,/g, ""), 10) || 0
    
    // Check if it's the kit quantity
    if (value === 300) {
      setQuantity(300)
      setIsKit(true)
      setSelectedTier("Kit - 300 units")
      return
    }
    
    setIsKit(false)
    const newQuantity = roundToValidQuantity(value) // Round to valid 5,000-unit increment
    setQuantity(newQuantity)

    // Update selected tier based on quantity using the pricing utility
    const tierInfo = getTierInfo(newQuantity)
    if (tierInfo.tier) {
      setSelectedTier(tierInfo.tier)
    }
  }

  // Handle quantity increment
  const handleQuantityIncrement = () => {
    if (isKit) return // Can't increment kit quantity
    
    const newQuantity = Math.min(960000, quantity + 5000)
    setQuantity(newQuantity)

    const tierInfo = getTierInfo(newQuantity)
    if (tierInfo.tier) {
      setSelectedTier(tierInfo.tier)
    }
  }

  // Handle quantity decrement
  const handleQuantityDecrement = () => {
    if (isKit) return // Can't decrement kit quantity
    
    const newQuantity = Math.max(5000, quantity - 5000)
    setQuantity(newQuantity)

    const tierInfo = getTierInfo(newQuantity)
    if (tierInfo.tier) {
      setSelectedTier(tierInfo.tier)
    }
  }

  // Use the formatNumber from pricing utility (renamed to avoid conflict)
  const formatNumber = formatNum

  // Handle add to cart
  const handleAddToCart = () => {
    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login or create an account to add items to your cart.",
          variant: "destructive",
        })
        router.push("/handler/sign-in?redirect=/order")
        return
      }

      setIsSubmitting(true)

      // Validate quantity increment (skip for kit)
      if (!isKit && !isValidQuantityIncrement(quantity)) {
        toast({
          title: "Invalid quantity",
          description: "Quantity must be in 5,000-unit increments (minimum 5,000 units; maximum 960,000 units).",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (isKit) {
        // Check if kit already exists in cart
        const existingKit = items.find((i) => i.name === "Force Dowels Kit")
        
        if (existingKit) {
          toast({
            title: "Kit already in cart",
            description: "You can only have one Force Dowels Kit per order.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
        
        // Add Force Dowels Kit to cart
        addItem({
          id: "force-dowels-kit", // Use consistent ID for Force Dowels Kit
          name: "Force Dowels Kit",
          quantity: 300,
          tier: "Kit - 300 units",
          pricePerUnit: 0.12,
        })
      } else {
        // Get the proper pricing based on quantity
        const tierInfo = getTierInfo(quantity)
        if (!tierInfo.pricePerUnit) {
          toast({
            title: "Invalid quantity",
            description: "Please enter a valid quantity within our pricing tiers.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        // Add item to cart with proper pricing
        addItem({
          id: "force-dowels", // Use consistent ID for Force Dowels
          name: "Force Dowels",
          quantity,
          tier: tierInfo.tier || selectedTier,
          pricePerUnit: tierInfo.pricePerUnit,
        })
      }

      // Show success message
      toast({
        title: "Added to cart",
        description: isKit 
          ? "Force Dowels Kit (300 units) added to your cart."
          : `${formatNumber(quantity)} units of Force Dowels added to your cart.`,
      })

      // Reset quantity to minimum
      setQuantity(5000)
      setSelectedTier("5,000-20,000")
      setIsKit(false)

    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error adding to cart",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle tier selection
  const handleTierSelect = (tier: (typeof tiers)[0]) => {
    setIsKit(false)
    setSelectedTier(tier.range)
    setQuantity(tier.min)
  }

  // Handle kit selection
  const handleKitSelect = () => {
    setIsKit(true)
    setQuantity(300)
    setSelectedTier("Kit - 300 units")
  }

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }



  return (
    <motion.main
      className="flex min-h-[calc(100vh-4rem)] flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex flex-1 px-4 py-8 md:px-6">
        {!user ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Please sign in to view pricing tiers and place orders.</p>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => router.push('/handler/sign-in?redirect=/order')}
              >
                <Lock className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
        

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.h2 className="text-2xl font-bold mb-6" variants={itemVariants}>
                Pricing Tiers
              </motion.h2>

              <div className="space-y-4">
                {tiers.map((tier) => (
                  <motion.div
                    key={tier.range}
                    variants={itemVariants}
                    className={`flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                      selectedTier === tier.range ? "border-amber-600 bg-amber-50" : ""
                    }`}
                    onClick={() => handleTierSelect(tier)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="font-medium">{tier.range}</span>
                    <span className="text-amber-600 font-bold">${formatExactPrice(tier.pricePerUnit)}/Unit</span>
                  </motion.div>
                ))}
              </div>

            {/* Force Dowels Kit Option */}
            <motion.div
              className="mt-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <motion.h3 className="text-xl font-bold mb-4" variants={itemVariants}>
                Or Try Our Starter Kit
              </motion.h3>
              <motion.div
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  isKit ? "border-amber-600 bg-amber-50" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={handleKitSelect}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Force Dowels Kit</h4>
                    <p className="text-sm text-gray-600">Perfect for small projects and testing</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-600">$36.00</span>
                    <p className="text-sm text-gray-600">300 dowels • $0.12/unit</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <motion.h3 className="text-xl font-bold mb-2" variants={itemVariants}>
                Need a Custom Quote?
              </motion.h3>
              <motion.p className="text-gray-700" variants={itemVariants}>
                For orders exceeding 960,000 units or for special requirements, please contact our sales team for a
                specialized quote.
              </motion.p>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/contact">
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">Contact Sales</Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Calculate Your Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Ordering Requirements Notice */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <Alert className="border-slate-200 bg-slate-50/50 shadow-sm">
                      <Info className="h-4 w-4 text-slate-600" />
                      <AlertDescription className="text-sm text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Ordering Requirements:</strong> Force Dowels are available in 5,000-unit increments only.
                        Minimum order quantity is 5,000 units, maximum is 960,000 units.
                      </AlertDescription>
                    </Alert>
                  </motion.div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (units)</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleQuantityDecrement}
                        disabled={isKit || quantity <= 5000}
                        className="h-10 w-10 shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="text"
                        value={formatNumber(quantity)}
                        onChange={handleQuantityChange}
                        className="text-right"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleQuantityIncrement}
                        disabled={isKit || quantity >= 960000}
                        className="h-10 w-10 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">units</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    {(() => {
                      const tierInfo = getTierInfo(quantity)
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Price per unit:</span>
                            <span className="font-bold">
                              {isKit ? '$0.12' : (tierInfo.pricePerUnit ? `$${formatExactPrice(tierInfo.pricePerUnit)}` : 'N/A')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total price:</span>
                            <span className="text-2xl font-bold">
                              {isKit ? '$36.00' : (tierInfo.totalPrice ? formatCurrency(tierInfo.totalPrice) : 'N/A')}
                            </span>
                          </div>
                          {isKit && (
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Selected:</span>
                              <span className="font-bold text-amber-600">Force Dowels Kit</span>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700 mt-4"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : user ? (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Login to Add to Cart
                        </>
                      )}
                    </Button>
                    <div className="mt-2 text-center">
                      <Button
                        variant="link"
                        className="text-amber-600 hover:text-amber-800"
                        onClick={() => router.push('/cart')}
                      >
                        View Cart
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </div>
          </>
        )}
      </div>
    </motion.main>
  )
}