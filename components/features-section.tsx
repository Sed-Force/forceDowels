"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Animate the heading
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      },
    )

    // Animate the features with staggered effect
    const features = featuresRef.current?.querySelectorAll(".feature-card")
    if (features) {
      gsap.fromTo(
        features,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 75%",
          },
        },
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  // Feature card hover animation
  const cardVariants = {
    initial: { y: 0 },
    hover: { y: -6, transition: { duration: 0.2 } },
  }

  // Icon animation
  const iconVariants = {
    initial: { rotate: 0 },
    hover: { rotate: 10, scale: 1.1, transition: { duration: 0.3 } },
  }

  return (
    <section ref={sectionRef} className="py-10 md:py-16 bg-white" id="features">
      <div className="container px-4 md:px-6">
        <div ref={headingRef} className="text-center mb-8 scroll-fade-in">
          <motion.h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Choose Force Dowels?
            <span className="block text-lg text-amber-600 font-medium mt-2">Patent Pending Technology</span>
          </motion.h2>
          <motion.p
            className="mt-3 text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our innovative dowel system revolutionizes cabinetry construction
          </motion.p>
        </div>
        <div ref={featuresRef} className="grid gap-6 md:grid-cols-3">
          <motion.div
            className="feature-card scroll-fade-in stagger-1 flex flex-col items-center text-center p-5 bg-gray-50 rounded-lg"
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3"
              variants={iconVariants}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-600"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </motion.div>
            <h3 className="text-lg font-bold mb-2">Reduced Labor Costs</h3>
            <p className="text-gray-700 text-sm">
              Simplify assembly and reduce installation time with our easy-to-use dowel system.
            </p>
          </motion.div>
          <motion.div
            className="feature-card scroll-fade-in stagger-2 flex flex-col items-center text-center p-5 bg-gray-50 rounded-lg"
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3"
              variants={iconVariants}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-600"
              >
                <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-2" />
                <path d="M9 14v-3" />
                <path d="M6 14v-1" />
                <path d="M12 14v-5" />
                <path d="M18 16v.01" />
                <path d="M18 13v.01" />
                <path d="M18 10v.01" />
                <path d="M21 12l-3-3-3 3" />
                <path d="M15 12h6" />
              </svg>
            </motion.div>
            <h3 className="text-lg font-bold mb-2">No Exterior Fasteners</h3>
            <p className="text-gray-700 text-sm">
              Create clean, professional finishes without visible screws or nails.
            </p>
          </motion.div>
          <motion.div
            className="feature-card scroll-fade-in stagger-3 flex flex-col items-center text-center p-5 bg-gray-50 rounded-lg"
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3"
              variants={iconVariants}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-600"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </motion.div>
            <h3 className="text-lg font-bold mb-2">Flush Finish</h3>
            <p className="text-gray-700 text-sm">
              Achieve perfectly flush surfaces for a premium look and feel in all your cabinetry.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
