"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { HelpCircle, ArrowRight, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function PricingComponent() {
  const [quantity, setQuantity] = useState<number>(5000)
  const [selectedTier, setSelectedTier] = useState<string>("tier1")
  const [isClient, setIsClient] = useState(false)
  const user = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // Refs for GSAP animations
  const headerRef = useRef(null)
  const calculatorRef = useRef(null)
  const tiersRef = useRef(null)
  const customQuoteRef = useRef(null)

  // Pricing tiers with placeholder prices
  const tiers = [
    {
      id: "tier1",
      name: "Standard",
      description: "For small to medium scale projects",
      range: "5,000 - 249,999 units",
      minUnits: 5000,
      maxUnits: 249999,
      pricePerUnit: "$0.15", // Updated with placeholder price
    },
    {
      id: "tier2",
      name: "Professional",
      description: "For larger commercial applications",
      range: "250,000 - 1,000,000 units",
      minUnits: 250000,
      maxUnits: 1000000,
      pricePerUnit: "$0.12", // Updated with placeholder price
    },
    {
      id: "tier3",
      name: "Enterprise",
      description: "For major industrial requirements",
      range: "1,000,000 - 10,000,000 units",
      minUnits: 1000000,
      maxUnits: 10000000,
      pricePerUnit: "$0.10", // Updated with placeholder price
    },
  ]

  // Animation variants for Framer Motion
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration: 0.4,
      },
    },
    hover: {
      y: -8,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  }

  // Initialize GSAP animations
  useEffect(() => {
    setIsClient(true)

    // GSAP animations with smoother transitions
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })

    tl.fromTo(
      calculatorRef.current,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, clearProps: "all" },
      "-=0.3",
    )

    tl.fromTo(tiersRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, clearProps: "all" }, "-=0.5")

    tl.fromTo(customQuoteRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2")

    // Animate features with staggered effect
    const features = document.querySelectorAll(".feature-item")
    gsap.fromTo(
      features,
      { y: 15, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.3,
        delay: 0.8,
        clearProps: "all",
      },
    )

    return () => {
      tl.kill()
    }
  }, [])

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value.replace(/,/g, ""), 10) || 0
    setQuantity(value)

    // Update selected tier based on quantity
    const newTier = tiers.find((t) => value >= t.minUnits && value <= t.maxUnits)
    if (newTier) {
      setSelectedTier(newTier.id)
    }
  }

  // Handle tier selection
  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId)
    const selectedTier = tiers.find((t) => t.id === tierId)
    if (selectedTier) {
      setQuantity(selectedTier.minUnits)
    }
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login or create an account to make a purchase.",
        variant: "destructive",
      })
      router.push("/handler/sign-in?redirect=/pricing")
      return
    }

    // In a real app, you would add the item to the cart
    toast({
      title: "Added to cart",
      description: `${formatNumber(quantity)} units of Force Dowels added to your cart.`,
    })
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Calculate total price
  const calculateTotalPrice = (quantity: number, pricePerUnit: string) => {
    const price = Number.parseFloat(pricePerUnit.replace("$", ""))
    return (quantity * price).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Get current tier
  const currentTier = tiers.find((t) => t.id === selectedTier) || tiers[0]

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10" ref={headerRef}>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Force Dowels Bulk Pricing
          <span className="block text-lg text-amber-600 font-medium mt-2">Patent Pending Technology</span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-2 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          High-quality dowels for your industrial and commercial needs. Our tiered pricing ensures you get the best
          value for your bulk orders.
        </motion.p>
      </div>

      {!user ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view pricing information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Our pricing tiers and detailed pricing information are available to registered users only.</p>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => router.push('/handler/sign-in?redirect=/pricing')}
            >
              <Lock className="h-4 w-4 mr-2" />
              Sign In to View Pricing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
        <div ref={calculatorRef}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" layout transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Calculate Your Price</CardTitle>
                <CardDescription>Enter your required quantity to see pricing</CardDescription>
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

                  <motion.div
                    className="space-y-4 pt-4"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Price per unit:</span>
                      <motion.span
                        className="font-bold"
                        layout
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {currentTier.pricePerUnit}
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total price:</span>
                      <motion.span
                        className="text-2xl font-bold"
                        layout
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {calculateTotalPrice(quantity, currentTier.pricePerUnit)}
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Current tier:</span>
                      <motion.span
                        className="font-bold text-primary"
                        layout
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        key={currentTier.id}
                        transition={{ duration: 0.2 }}
                      >
                        {currentTier.name}
                      </motion.span>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
              <CardFooter>
                <motion.div className="w-full" variants={buttonVariants} whileHover="hover" whileTap="tap">
                  {user ? (
                    <Button className="w-full bg-amber-600 hover:bg-amber-700" size="lg" onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      size="lg"
                      onClick={() => router.push("/handler/sign-in?redirect=/pricing")}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Login to Purchase
                    </Button>
                  )}
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <div ref={tiersRef}>
          <Tabs value={selectedTier} onValueChange={handleTierSelect} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              {tiers.map((tier) => (
                <TabsTrigger key={tier.id} value={tier.id}>
                  {tier.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="relative">
              <AnimatePresence mode="wait">
                {tiers.map((tier) => (
                  <TabsContent key={tier.id} value={tier.id} className="mt-0 absolute w-full">
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>{tier.name}</CardTitle>
                          <CardDescription>{tier.description}</CardDescription>
                          <motion.div
                            className="mt-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="text-3xl font-bold">{tier.pricePerUnit}</div>
                            <div className="text-sm text-muted-foreground">per unit</div>
                          </motion.div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm font-medium mb-4 flex items-center">
                            <span>Quantity range: </span>
                            <span className="ml-1 font-bold">{tier.range}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                    <HelpCircle className="h-4 w-4" />
                                    <span className="sr-only">More info</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    This tier applies to orders between {tier.minUnits.toLocaleString()} and{" "}
                                    {tier.maxUnits.toLocaleString()} units.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <motion.div className="w-full" variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button
                              variant="outline"
                              className="w-full border-amber-600 text-amber-600 hover:bg-amber-50"
                              onClick={() => setQuantity(tier.minUnits)}
                            >
                              Select {tier.name} Tier
                            </Button>
                          </motion.div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
      )}

      <div className="mt-12 text-center" ref={customQuoteRef}>
        <motion.h2
          className="text-xl font-semibold mb-4 text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Need a custom quote?
        </motion.h2>
        <motion.p
          className="text-muted-foreground max-w-2xl mx-auto mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          For orders exceeding 10 million units or for special requirements, please contact our sales team for a
          customized solution.
        </motion.p>
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Link href="/contact">
            <Button variant="outline" size="lg" className="border-amber-600 text-amber-600 hover:bg-amber-50">
              Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
