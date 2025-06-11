"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Lock, Loader2, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export default function OrderPage() {
  const [quantity, setQuantity] = useState<number>(5000)
  const [selectedTier, setSelectedTier] = useState<string>("5,000-19,999")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const { toast } = useToast()
  const user = useUser()
  const router = useRouter()
  const { addItem } = useCart()

  // Check if user is authenticated and control pricing visibility
  useEffect(() => {
    if (user) {
      setShowPricing(true)
    } else {
      setShowPricing(false)
    }
  }, [user])

  // Updated pricing tiers with 5 tiers instead of 4
  const tiers = [
    { range: "5,000-19,999", min: 5000, max: 19999 },
    { range: "20,000-79,999", min: 20000, max: 79999 },
    { range: "80,000-159,999", min: 80000, max: 159999 },
    { range: "160,000-239,999", min: 160000, max: 239999 },
    { range: "240,000-320,000", min: 240000, max: 320000 },
  ]

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value.replace(/,/g, ""), 10) || 0
    setQuantity(Math.max(5000, value)) // Ensure minimum quantity is 5000

    // Update selected tier based on quantity
    const newTier = tiers.find((tier) => value >= tier.min && value <= tier.max)
    if (newTier) {
      setSelectedTier(newTier.range)
    }
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

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

      // Calculate a mock price for demonstration
      const pricePerUnit = 0.25 // Mock price per unit

      // Add item to cart
      addItem({
        id: `force-dowels-${Date.now()}`, // Generate a unique ID
        name: "Force Dowels",
        quantity,
        tier: selectedTier,
        pricePerUnit,
      })

      // Show success message
      toast({
        title: "Added to cart",
        description: `${formatNumber(quantity)} units of Force Dowels added to your cart.`,
      })

      // Reset quantity to minimum
      setQuantity(5000)
      setSelectedTier("5,000-19,999")

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
    setSelectedTier(tier.range)
    setQuantity(tier.min)
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
                    <span className="text-amber-600 font-bold">$TBD/Unit</span>
                  </motion.div>
                ))}
              </div>

            <motion.div
              className="mt-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <motion.h3 className="text-xl font-bold mb-2" variants={itemVariants}>
                Need a Custom Quote?
              </motion.h3>
              <motion.p className="text-gray-700" variants={itemVariants}>
                For orders exceeding 320,000 units or for special requirements, please contact our sales team for a
                specialized quote.
              </motion.p>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="mt-4 bg-amber-600 hover:bg-amber-700">Contact Sales</Button>
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
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (units)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="quantity"
                        type="text"
                        value={formatNumber(quantity)}
                        onChange={handleQuantityChange}
                        className="text-right"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">units</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Price per unit:</span>
                      <span className="font-bold">$TBD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total price:</span>
                      <span className="text-2xl font-bold">$TBD</span>
                    </div>
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
        )}
      </div>
    </motion.main>
  )
}