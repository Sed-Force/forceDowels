"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToSection() {
  const pathname = usePathname()

  useEffect(() => {
    // Function to handle scroll animations
    const handleScrollAnimations = () => {
      const elements = document.querySelectorAll(".scroll-fade-in")

      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top
        const elementBottom = element.getBoundingClientRect().bottom

        // Check if element is in viewport
        if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
          element.classList.add("visible")
        }
      })
    }

    // Handle hash links on page load
    const handleHashOnLoad = () => {
      // Only run on the home page
      if (pathname !== "/") return

      // Check if there's a hash in the URL
      if (window.location.hash) {
        const id = window.location.hash.substring(1)
        const element = document.getElementById(id)

        if (element) {
          // Wait a bit for page to fully load
          setTimeout(() => {
            const headerHeight = document.querySelector("header")?.offsetHeight || 0
            const elementPosition = element.getBoundingClientRect().top + window.scrollY

            window.scrollTo({
              top: elementPosition - headerHeight,
              behavior: "smooth",
            })
          }, 300)
        }
      }
    }

    // Initialize scroll animations
    handleScrollAnimations()

    // Handle hash links
    handleHashOnLoad()

    // Add scroll event listener
    window.addEventListener("scroll", handleScrollAnimations)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScrollAnimations)
    }
  }, [pathname])

  return null
}
