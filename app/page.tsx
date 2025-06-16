"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"
import { BlockInTextCard } from "@/components/block-in-text-card"
import { AnimatedStats } from "@/components/animated-stats"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { BenefitsComparison } from "@/components/benefits-comparison"
import { InteractiveGallery } from "@/components/interactive-gallery"

export default function Home() {
  // Add state to track if component is mounted
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  // Only render content when mounted to avoid hydration issues
  if (!isMounted) {
    return <div className="flex min-h-[calc(100vh-4rem)] flex-col"></div>
  }

  return (
    <motion.main
      className="flex min-h-[calc(100vh-4rem)] flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Hero Section */}
      <div className="container max-w-7xl flex flex-1 px-4 py-12 md:py-16 md:px-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-amber-100 opacity-20"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6" variants={itemVariants}>
              Force Dowels™
              <span className="block text-2xl md:text-3xl text-amber-600 font-medium mt-2">Patent Pending</span>
            </motion.h1>
            <motion.p className="text-2xl md:text-3xl text-gray-700 mb-8" variants={itemVariants}>
              Experience the next generation of cabinet assembly: faster, stronger, and with a flawless finish.
            </motion.p>

            <motion.ul
              className="space-y-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.3, staggerChildren: 0.1 }}
            >
              {[
                "No Exterior Fastener for a Cleaner Look",
                "No Glue Necessary",
                "Significantly Reduced Labor Cost",
                "Patent Pending",
                "Built for RTA Efficiency — Strong, Simple, Reliable",
                "Intergrates seamlessly with most 8mm dowel systems",
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mr-3 mt-1">
                    <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
                      <Check className="h-6 w-6 text-amber-600" />
                    </motion.div>
                  </div>
                  <span className="text-xl text-gray-700">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            className="h-[550px] md:h-[600px] w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative w-full h-full rounded-lg border overflow-hidden aspect-[4/3] shadow-2xl">
              <Image
                src="/pics/dowels.jpg"
                alt="Force Dowels™"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={100}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* New Dynamic Sections */}
      <BlockInTextCard />
      <InteractiveGallery />
      <BenefitsComparison />
    </motion.main>
  )
}