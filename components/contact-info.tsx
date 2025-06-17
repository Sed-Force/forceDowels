"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ContactInfo() {
  const infoRef = useRef<HTMLDivElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate contact info items
    const infoItems = infoRef.current?.querySelectorAll(".info-item")
    if (infoItems) {
      gsap.fromTo(
        infoItems,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.5,
        },
      )
    }

    // Animate business hours
    const hoursItems = hoursRef.current?.querySelectorAll(".hours-item")
    if (hoursItems) {
      gsap.fromTo(
        hoursItems,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.8,
        },
      )
    }
  }, [])

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
    hover: { y: -5, transition: { duration: 0.2 } },
  }

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  return (
    <motion.div className="flex flex-col gap-8" variants={staggerContainerVariants} initial="hidden" animate="visible">
      <motion.div variants={cardVariants} whileHover="hover">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4" ref={infoRef}>
            <div className="flex items-start gap-3 info-item">
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
                className="h-5 w-5 text-amber-600 mt-0.5"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <motion.p
                  className="text-gray-700"
                  whileHover={{ color: "#d97706", x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  (480)-581-7145
                </motion.p>
              </div>
            </div>
            <div className="flex items-start gap-3 info-item">
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
                className="h-5 w-5 text-amber-600 mt-0.5"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <div>
                <h3 className="font-semibold">Email</h3>
                <motion.p
                  className="text-gray-700"
                  whileHover={{ color: "#d97706", x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  info@forcedowels.com
                </motion.p>
              </div>
            </div>
            <div className="flex items-start gap-3 info-item">
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
                className="h-5 w-5 text-amber-600 mt-0.5"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <h3 className="font-semibold">Address</h3>
                <motion.p
                  className="text-gray-700"
                  whileHover={{ color: "#d97706", x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  4455 E Nunneley Rd, Ste 103
                  <br />
                  Gilbert, AZ 85296
                </motion.p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} whileHover="hover">
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent ref={hoursRef}>
            <div className="grid gap-2">
              <div className="flex justify-between hours-item">
                <span className="font-medium">Monday - Friday</span>
                <span>7:30 AM - 4:30 PM</span>
              </div>
              <div className="flex justify-between hours-item">
                <span className="font-medium">Saturday</span>
                <span>Closed</span>
              </div>
              <div className="flex justify-between hours-item">
                <span className="font-medium">Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
