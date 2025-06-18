"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, ShoppingBag, Loader2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"


export default function CartPage() {
  const { items, updateItemQuantity, removeItem, clearCart, consolidateCart, totalPrice } = useCart()
  const user = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your cart.",
        variant: "destructive",
      })
      router.push('/handler/sign-in?redirect=/cart')
    }
  }, [user, router, toast])

  // Format number with commas and null/undefined safety
  const formatNumber = (num: number | undefined | null) => {
    if (num === null || num === undefined || isNaN(num)) {
      return "0"
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Format price for totals with proper currency formatting and rounding up
  const formatPrice = (price: number | undefined | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "0.00"
    }
    // Round up to nearest cent and format as currency
    return Math.ceil(price * 100) / 100
  }

  // Format as currency string
  const formatCurrency = (price: number | undefined | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "$0.00"
    }
    // Round up to nearest cent and format as currency
    const roundedPrice = Math.ceil(price * 100) / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedPrice)
  }

  // Format price for per-unit display with exact precision
  const formatExactPrice = (price: number | undefined | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "0"
    }
    return price.toString()
  }

  // Handle quantity change
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value.replace(/,/g, ""), 10)
    if (!isNaN(quantity) && quantity > 0) {
      updateItemQuantity(id, quantity)
    }
  }

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login or create an account to complete your purchase.",
        variant: "destructive",
      })
      router.push("/handler/sign-in?redirect=/cart")
      return
    }

    // Navigate to the checkout page
    router.push('/checkout')
  }

  const handleConsolidateCart = () => {
    const beforeCount = items.length
    consolidateCart()

    // Show success message
    toast({
      title: "Items consolidated",
      description: "Duplicate Force Dowels have been combined with updated bulk pricing.",
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/order" className="flex items-center text-gray-600 hover:text-amber-600 mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        {items.length > 1 && items.filter(item => item.name === "Force Dowels").length > 1 && (
          <Button
            variant="outline"
            onClick={handleConsolidateCart}
            className="text-amber-600 border-amber-600 hover:bg-amber-50"
          >
            Combine Duplicate Items
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">Add some items to your cart to get started.</p>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => router.push('/order')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 grid-cols-1 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md"
                    >
                      <div className="flex-1 mb-2 sm:mb-0">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">Tier: {item.tier}</p>
                        <p className="text-sm text-gray-500">
                          ${formatExactPrice(item?.pricePerUnit || 0)} per unit
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-28">
                          <Input
                            type="text"
                            value={formatNumber(item?.quantity || 0)}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="text-right"
                            aria-label="Quantity"
                          />
                        </div>
                        <div className="w-24 text-right">
                          {formatCurrency((item?.quantity || 0) * (item?.pricePerUnit || 0))}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button variant="outline" onClick={consolidateCart}>
                    Consolidate Items
                  </Button>
                </div>
                <Button
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => router.push('/order')}
                >
                  Add More Items
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totalPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(totalPrice || 0)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  size="lg"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
