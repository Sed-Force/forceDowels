"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function FindDistributorPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Placeholder for future search functionality
    console.log("Search button clicked")
  }

  return (
    <main className="flex min-h-screen flex-col">
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Find a Local Distributor
            </h1>
            <p className="mt-4 text-gray-700 md:text-xl max-w-[700px] mx-auto">
              Work with one of our local partners for quick access and tailored purchasing options.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your ZIP Code
                </label>
                <Input
                  type="text"
                  id="zipcode"
                  name="zipcode"
                  placeholder="e.g., 90210"
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
