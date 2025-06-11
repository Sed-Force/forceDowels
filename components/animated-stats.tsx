"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock, Users, Award } from "lucide-react"

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

function Counter({ end, duration = 2, suffix = "", prefix = "" }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationFrame: number

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [isInView, end, duration])

  return (
    <span ref={ref} className="font-bold text-3xl md:text-4xl text-amber-600">
      {prefix}{count}{suffix}
    </span>
  )
}

export function AnimatedStats() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="py-16"></div>
  }

  const stats = [
    {
      icon: TrendingUp,
      value: 40,
      suffix: "%",
      label: "Labor Cost Reduction",
      description: "Significant savings on installation time and labor costs"
    },
    {
      icon: Clock,
      value: 60,
      suffix: "%",
      label: "Faster Assembly",
      description: "Streamlined installation process with our dowel system"
    },
    {
      icon: Users,
      value: 500,
      suffix: "+",
      label: "Satisfied Customers",
      description: "Professional contractors trust Force Dowels™"
    },
    {
      icon: Award,
      value: 99,
      suffix: "%",
      label: "Quality Rating",
      description: "Consistent, professional results every time"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Proven Results
            <span className="block text-lg text-amber-600 font-medium mt-2">Patent Pending Technology</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See why professionals choose Force Dowels™ for their cabinetry projects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50">
                <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4"
                    >
                      <stat.icon className="h-8 w-8 text-amber-600" />
                    </motion.div>
                    
                    <div className="mb-2">
                      <Counter 
                        end={stat.value} 
                        suffix={stat.suffix}
                        duration={2.5}
                      />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {stat.label}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-amber-600 font-medium">
            * Results based on customer feedback and industry testing
          </p>
        </motion.div>
      </div>
    </section>
  )
}
