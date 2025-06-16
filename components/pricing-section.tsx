"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const tiers = [
  {
    id: "tier1",
    name: "Standard",
    description: "For small to medium scale projects",
    range: "5,000 - 249,999 units",
    minUnits: 5000,
    maxUnits: 249999,
    pricePerUnit: "TBD", // Placeholder
  },
  {
    id: "tier2",
    name: "Professional",
    description: "For larger commercial applications",
    range: "250,000 - 1,000,000 units",
    minUnits: 250000,
    maxUnits: 1000000,
    pricePerUnit: "TBD", // Placeholder
  },
  {
    id: "tier3",
    name: "Enterprise",
    description: "For major industrial requirements",
    range: "1,000,000 - 10,000,000 units",
    minUnits: 1000000,
    maxUnits: 10000000,
    pricePerUnit: "TBD", // Placeholder
  },
]

export function PricingSection() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card key={tier.id} className={`flex flex-col ${selectedTier === tier.id ? "border-amber-600 shadow-lg" : ""}`}>
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">Quantity Range</p>
              <p className="text-lg font-bold">{tier.range}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">Price Per Unit</p>
              <p className="text-lg font-bold">Contact for Pricing</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4 text-green-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Reduced labor costs
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4 text-green-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                No exterior fasteners
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4 text-green-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Flush finish
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className={`w-full ${selectedTier === tier.id ? "bg-amber-600 hover:bg-amber-700" : ""}`}
              variant={selectedTier === tier.id ? "default" : "outline"}
              onClick={() => setSelectedTier(tier.id)}
            >
              {selectedTier === tier.id ? "Selected" : "Select Plan"}
            </Button>
          </CardFooter>
        </Card>
      ))}

      <div className="md:col-span-3 mt-8 text-center">
        <p className="mb-4 text-lg">Ready to place an order or need custom pricing?</p>
        <Link href="/contact">
          <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
            Contact Us for a Quote
          </Button>
        </Link>
      </div>
    </div>
  )
}
