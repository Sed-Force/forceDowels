"use client"

import { ContactForm } from "@/components/contact-form"
import { ContactInfo } from "@/components/contact-info"

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-amber-50">
      <section className="py-12 md:py-20 ">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-gray-700 md:text-xl max-w-[700px] mx-auto">
              Have questions about Force Dowels? Our team is here to help you with any inquiries about our products.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:gap-12 max-w-5xl mx-auto">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>
    </main>
  )
}
