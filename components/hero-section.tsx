"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TransitionImage } from "@/components/transition-image"

export function HeroSection() {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <section className="bg-amber-50 py-8 md:py-12">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex-1 text-center md:text-left">
            <motion.h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" variants={itemVariants}>
              Force Dowels™
              <span className="block text-lg text-amber-600 font-medium mt-1">Patent Pending</span>
            </motion.h1>
            <motion.p className="text-gray-700 mb-4 max-w-md mx-auto md:mx-0" variants={itemVariants}>
              Revolutionary cabinetry fasteners that reduce labor costs and provide a flush finish.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-3 justify-center md:justify-start mb-6 md:mb-0"
              variants={itemVariants}
            >
              <Link href="#pricing">
                <Button className="bg-amber-600 hover:bg-amber-700" size="sm">
                  View Pricing
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50" size="sm">
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                className="col-span-2 sm:col-span-1"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <div className="relative h-[140px] sm:h-[180px] w-full overflow-hidden rounded-lg shadow-md">
                  <TransitionImage
                    src="/cabinetry-dowel-joint.png"
                    alt="Force Dowels™ in action"
                    fill
                    priority
                    className="object-cover"
                    transitionDuration={0.5}
                  />
                </div>
              </motion.div>
              <motion.div
                className="col-span-2 sm:col-span-1"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: 0.15 }}
              >
                <div className="relative h-[140px] sm:h-[180px] w-full overflow-hidden rounded-lg shadow-md">
                  <TransitionImage
                    src="/cabinet-assembly.jpg"
                    alt="Cabinet assembly with Force Dowels™"
                    fill
                    priority
                    className="object-cover"
                    transitionDuration={0.5}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
