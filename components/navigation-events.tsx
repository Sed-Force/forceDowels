"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function NavigationEvents({ setLoading }: { setLoading: (loading: boolean) => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + searchParams.toString()

    const handleRouteChangeStart = () => {
      setLoading(true)
    }

    const handleRouteChangeComplete = () => {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }

    // Listen for route changes
    window.addEventListener("popstate", handleRouteChangeStart)

    // Create a custom event for navigation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        anchor.href !== window.location.href
      ) {
        handleRouteChangeStart()
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("popstate", handleRouteChangeStart)
      document.removeEventListener("click", handleClick)
    }
  }, [pathname, searchParams, setLoading])

  return null
}
