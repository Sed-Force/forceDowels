"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getPricingTier, calculatePricePerUnit, roundToValidQuantity, isValidQuantityIncrement } from "@/lib/pricing"

export interface CartItem {
  id: string
  name: string
  quantity: number
  tier: string
  pricePerUnit: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateItemQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  consolidateCart: () => void
  itemCount: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Helper function to consolidate duplicate items by name
  const consolidateItems = (items: CartItem[]): CartItem[] => {
    const consolidated: CartItem[] = []

    items.forEach((item) => {
      const existingIndex = consolidated.findIndex((c) => c.name === item.name)

      if (existingIndex >= 0) {
        // Combine with existing item
        const newQuantity = consolidated[existingIndex].quantity + item.quantity
        const tier = getPricingTier(newQuantity)
        const pricePerUnit = calculatePricePerUnit(newQuantity)

        consolidated[existingIndex] = {
          ...consolidated[existingIndex],
          quantity: newQuantity,
          tier: tier?.range || consolidated[existingIndex].tier,
          pricePerUnit: pricePerUnit || consolidated[existingIndex].pricePerUnit,
        }
      } else {
        // Add as new item
        consolidated.push(item)
      }
    })

    return consolidated
  }

  // Initialize cart from localStorage when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        const loadedItems = JSON.parse(storedCart)
        // Automatically consolidate items when loading from storage
        setItems(consolidateItems(loadedItems))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Update localStorage whenever cart changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isClient])

  // Add an item to the cart
  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if this is a Force Dowels Kit
      const isKit = item.name === "Force Dowels Kit"
      
      // If it's a kit, check if one already exists
      if (isKit) {
        const existingKit = prevItems.find((i) => i.name === "Force Dowels Kit")
        if (existingKit) {
          // Kit already exists, don't add another one
          console.warn("Force Dowels Kit already in cart. Only one kit allowed per order.")
          return prevItems
        }
      }

      // Check if item already exists in cart by name (for Force Dowels, combine quantities)
      const existingItemIndex = prevItems.findIndex((i) => i.name === item.name)

      if (existingItemIndex >= 0 && !isKit) {
        // Update existing item with new quantity and recalculate pricing (not for kits)
        const updatedItems = [...prevItems]
        const newQuantity = updatedItems[existingItemIndex].quantity + item.quantity
        const tier = getPricingTier(newQuantity)
        const pricePerUnit = calculatePricePerUnit(newQuantity)

        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          tier: tier?.range || updatedItems[existingItemIndex].tier,
          pricePerUnit: pricePerUnit || updatedItems[existingItemIndex].pricePerUnit,
        }
        return updatedItems
      } else {
        // Add new item with proper pricing
        const tier = isKit ? null : getPricingTier(item.quantity)
        const pricePerUnit = isKit ? item.pricePerUnit : calculatePricePerUnit(item.quantity)

        return [...prevItems, {
          ...item,
          tier: isKit ? item.tier : (tier?.range || item.tier),
          pricePerUnit: pricePerUnit || item.pricePerUnit,
        }]
      }
    })
  }

  // Update item quantity and recalculate tier and price
  const updateItemQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          // Prevent modifying kit quantities
          if (item.name === "Force Dowels Kit") {
            console.warn("Cannot modify Force Dowels Kit quantity")
            return item
          }
          
          // Round quantity to valid 5,000-unit increment
          const validQuantity = roundToValidQuantity(quantity)
          
          // Recalculate tier and price based on new quantity
          const tier = getPricingTier(validQuantity)
          const pricePerUnit = calculatePricePerUnit(validQuantity)

          return {
            ...item,
            quantity: validQuantity,
            tier: tier?.range || item.tier,
            pricePerUnit: pricePerUnit || item.pricePerUnit,
          }
        }
        return item
      })
    )
  }

  // Remove an item from the cart
  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  // Clear the entire cart
  const clearCart = () => {
    setItems([])
  }

  // Consolidate duplicate items in cart (useful for fixing existing carts)
  const consolidateCart = () => {
    setItems((prevItems) => consolidateItems(prevItems))
  }

  // Calculate total number of items in cart
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Calculate total price of all items in cart
  const totalPrice = items.reduce(
    (total, item) => total + item.quantity * item.pricePerUnit, 
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        consolidateCart,
        itemCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
