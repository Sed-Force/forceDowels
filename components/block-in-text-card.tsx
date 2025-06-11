"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface TypewriterProps {
  text: string
  delay?: number
  speed?: number
}

function Typewriter({ text, delay = 0, speed = 50 }: TypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setCurrentIndex(0)
      setDisplayText("")
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [delay])

  return (
    <span className="inline-block">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-0.5 h-6 bg-amber-600 ml-1"
      />
    </span>
  )
}

export function BlockInTextCard() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="py-16"></div>
  }

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                      Need Support?{" "}
                      <span className="text-amber-600">
                        <Typewriter 
                          text="We're here to help!" 
                          delay={1000}
                          speed={80}
                        />
                      </span>
                    </h2>
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                      Our expert team is ready to assist you with Force Dowels™ implementation, 
                      technical questions, and custom solutions for your cabinetry projects.
                    </p>
                    <div className="text-sm text-amber-600 font-medium mb-8">
                      Patent Pending Technology
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Link href="/contact">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          size="lg"
                          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Get in Touch
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <Phone className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Quick Response</p>
                      <p className="text-sm text-gray-600">Get answers within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <Mail className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Expert Guidance</p>
                      <p className="text-sm text-gray-600">Technical support from our team</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <MessageCircle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Custom Solutions</p>
                      <p className="text-sm text-gray-600">Tailored advice for your projects</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
