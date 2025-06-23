"use client"

import DistributorMap from "@/components/distributor-map"

export default function FindDistributorPage() {
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

          <DistributorMap />
        </div>
      </section>
    </main>
  )
}
