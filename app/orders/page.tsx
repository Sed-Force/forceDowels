"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Order {
  id: number
  user_id: string
  user_email: string
  user_name: string
  quantity: number
  tier: string
  total_price: number
  status: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const user = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your orders.",
        variant: "destructive",
      })
      router.push("/handler/sign-in")
      return
    }

    // Fetch orders
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders")

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()

        if (data.success && data.orders) {
          setOrders(data.orders)
        } else {
          setOrders([])
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to fetch your orders. Please try again later.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, router, toast])

  if (!user) {
    return null // Don't render anything if not authenticated
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="ml-2">Loading your orders...</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Quantity:</span>
                    <span>{order.quantity.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tier:</span>
                    <span>{order.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span>${order.total_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
            <CardDescription>
              You haven't placed any orders yet. Start shopping to see your orders here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => router.push("/order")}
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
