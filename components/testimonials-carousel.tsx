"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  content: string
  rating: number
  image?: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Mike Johnson",
    role: "Lead Carpenter",
    company: "Johnson Custom Cabinets",
    content: "Force Dowels have revolutionized our cabinet assembly process. The clean finish and reduced labor time have significantly improved our bottom line.",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Project Manager",
    company: "Elite Kitchen Solutions",
    content: "The patent pending technology behind Force Dowels is impressive. Our clients love the seamless finish, and we love the efficiency gains.",
    rating: 5
  },
  {
    id: 3,
    name: "David Rodriguez",
    role: "Cabinet Installer",
    company: "Rodriguez Woodworking",
    content: "I've been in the business for 20 years, and Force Dowels are the most innovative fastening solution I've used. No more visible screws!",
    rating: 5
  },
  {
    id: 4,
    name: "Lisa Thompson",
    role: "Interior Designer",
    company: "Thompson Design Studio",
    content: "The flush finish achieved with Force Dowels gives our projects a premium look that clients notice immediately. Highly recommended!",
    rating: 5
  }
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isMounted])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (!isMounted) {
    return <div className="py-16"></div>
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            What Our Customers Say
            <span className="block text-lg text-amber-600 font-medium mt-2">Patent Pending Technology</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from professionals who have transformed their projects with Force Dowels™
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-0 shadow-xl bg-white">
                  <CardContent className="p-8 md:p-12">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6"
                      >
                        <Quote className="h-8 w-8 text-amber-600" />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center mb-6"
                      >
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                        ))}
                      </motion.div>

                      <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed italic"
                      >
                        "{testimonials[currentIndex].content}"
                      </motion.blockquote>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <h4 className="text-lg font-semibold text-gray-900">
                          {testimonials[currentIndex].name}
                        </h4>
                        <p className="text-amber-600 font-medium">
                          {testimonials[currentIndex].role}
                        </p>
                        <p className="text-gray-600">
                          {testimonials[currentIndex].company}
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full border-amber-200 hover:bg-amber-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-amber-600 scale-110" 
                      : "bg-amber-200 hover:bg-amber-300"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full border-amber-200 hover:bg-amber-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
