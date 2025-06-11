"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // When pathname changes, we know navigation has completed
    setIsLoading(false)
  }, [pathname])

  useEffect(() => {
    // Listen for our custom navigation start event
    const handleNavigationStart = () => {
      setIsLoading(true)
    }

    // Listen for navigation events
    window.addEventListener("navigationStart", handleNavigationStart)

    // Listen for clicks on links
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.href.includes("#") && // Ignore hash links
        link.href !== window.location.href
      ) {
        setIsLoading(true)
      }
    }

    document.addEventListener("click", handleLinkClick)

    // Failsafe: force loader to disappear after a maximum time
    let timer: NodeJS.Timeout
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(false)
      }, 3000)
    }

    return () => {
      window.removeEventListener("navigationStart", handleNavigationStart)
      document.removeEventListener("click", handleLinkClick)
      if (timer) clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative w-16 h-16">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
            <motion.p
              className="mt-4 text-amber-800 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Loading...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
