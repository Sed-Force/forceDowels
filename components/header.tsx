"use client"

import type React from "react"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ShoppingCart, Loader2, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SignedIn, SignedOut, UserButton, useClerk } from "@clerk/nextjs"
import { useCart } from "@/contexts/cart-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the interface for navigation links
interface NavLink {
  href: string;
  label: string;
  section: string;
  badge?: string;
  highlight?: boolean;
  onClick?: () => void;
}

// Auth-aware header content component
function HeaderContent() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  // const [isLoading, setIsLoading] = useState(true) // Clerk handles loading state via <ClerkLoading> or <ClerkLoaded> if needed
  const headerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  // const { user } = useUser() // Clerk's useUser hook - currently unused but available for future use
  const { signOut: clerkSignOut } = useClerk(); // Clerk's signOut method
  const { itemCount } = useCart()

  // Set loading state - No longer needed, Clerk handles this
  // useEffect(() => {
  //   setIsLoading(false) 
  // }, [])

  // Handle sign out for mobile menu if needed
  const handleMobileSignOut = () => {
    clerkSignOut();
    setIsOpen(false); // Close mobile menu
    router.push('/'); // Redirect to home or let Clerk handle redirect
  }

  // Handle scroll events and update active section
  useEffect(() => {
    const handleScroll = () => {
      // Update header style based on scroll position
      setScrolled(window.scrollY > 50)

      // If we're on the contact page, set activeSection to "contact"
      if (pathname === "/contact") {
        setActiveSection("contact")
        return
      }

      // If we're on the home page, check which section is in view
      if (pathname === "/") {
        const sections = ["features", "pricing"]
        const currentSection = sections.find((section) => {
          const element = document.getElementById(section)
          if (element) {
            const rect = element.getBoundingClientRect()
            return rect.top <= 100 && rect.bottom >= 100
          }
          return false
        })

        setActiveSection(currentSection || "")
      } else {
        // For any other page, clear the active section
        setActiveSection("")
      }
    }

    // Initial check when component mounts or pathname changes
    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  // Smooth scroll function for same-page navigation
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()

    // Close mobile menu if open
    if (isOpen) {
      setIsOpen(false)
    }

    // If we're not on the home page, navigate to home first
    if (pathname !== "/") {
      router.push(`/#${sectionId}`)
      return
    }

    // Get the section element
    const section = document.getElementById(sectionId)
    if (section) {
      // Get header height for offset
      const headerHeight = headerRef.current?.offsetHeight || 0

      // Calculate the position to scroll to
      const targetPosition = section.getBoundingClientRect().top + window.scrollY - headerHeight

      // Scroll smoothly to the section
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })

      // Update URL without full page reload
      window.history.pushState({}, "", `/#${sectionId}`)
    }
  }

  // Handle navigation to contact page
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't prevent default - let the link work normally
    if (isOpen) {
      setIsOpen(false)
    }
  }

  // Animation variants
  const headerVariants = {
    initial: { y: -100 },
    animate: { y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  const linkVariants = {
    initial: { opacity: 0, y: -10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.1 * i,
      },
    }),
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  return (
    <motion.header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full border-b ${
        scrolled ? "bg-gray-900/95 backdrop-blur-sm shadow-sm" : "bg-gray-900"
      } transition-all duration-300`}
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="flex items-center gap-2">
            <motion.img
            src="/fdLogo.jpg"
            alt="logo"
            className="h-14 w-full rounded-lg" // Corrected w-fill to w-full
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            />
          </Link>
        </motion.div>
        <nav className="hidden md:flex gap-6">
          {[ // Start of the single array for .map
            ...([ // Spread the main navigation links
              { href: "/", label: "Home", section: "home" },
              { href: "/order", label: "Order", section: "order" },
              { href: "/videos", label: "Videos", section: "videos" },
              { href: "/faq", label: "FAQ", section: "faq" },
              { href: "/contact", label: "Contact", section: "contact" },
            ] as NavLink[])
          ].map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              variants={linkVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
            >
              {link.section === "home" ? (
                <Link
                  href="/"
                  className={`text-sm font-medium hover:underline underline-offset-4 text-white ${
                    pathname === "/" && !activeSection ? "text-amber-400" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  href={link.href}
                  className={`text-sm font-medium hover:underline underline-offset-4 text-white ${
                    pathname === link.href ? "text-amber-400" : ""
                  }`}
                >
                  {link.label}
                </Link>
              )}
            </motion.div>
          ))}

          {/* Distribution Dropdown */}
          <motion.div
            variants={linkVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            custom={4}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium text-white hover:text-amber-400 hover:underline underline-offset-4 hover:bg-transparent p-0 h-auto ${
                    pathname === "/find-a-distributor" || pathname === "/distributor-application" ? "text-amber-400" : ""
                  }`}
                >
                  Distribution
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem asChild>
                  <Link
                    href="/find-a-distributor"
                    className={`w-full cursor-pointer ${
                      pathname === "/find-a-distributor" ? "text-amber-600 font-medium" : ""
                    }`}
                  >
                    Find a Distributor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/distributor-application"
                    className={`w-full cursor-pointer font-semibold text-amber-600 ${
                      pathname === "/distributor-application" ? "text-amber-700" : ""
                    }`}
                  >
                    Become a Distributor
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </nav>
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <motion.div
            variants={linkVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            custom={2}
          >
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative text-white hover:text-amber-400">
                <ShoppingCart className={`h-5 w-5 ${itemCount > 0 ? 'text-amber-400' : ''}`} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 h-2 w-2 rounded-full" />
                )}
              </Button>
            </Link>
          </motion.div>

          {/* Clerk Auth Links */}
          <div className="hidden md:flex items-center gap-2">
            <SignedOut>
              <motion.div
                variants={linkVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                custom={3}
              >
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="text-white hover:text-amber-400">
                    Login
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                variants={linkVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                custom={4}
              >
                <Link href="/sign-up">
                  <Button size="sm" className="bg-amber-400 hover:bg-amber-500 text-gray-900">
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            </SignedOut>
            <SignedIn>
              <motion.div
                variants={linkVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                custom={3}
              >
                <UserButton afterSignOutUrl="/" />
              </motion.div>
            </SignedIn>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="border-2 border-amber-400 bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-all duration-200"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </motion.div>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <AnimatePresence>
                  {([
                    { href: "/", label: "Home", section: "home" },
                    { href: "/order", label: "Order", section: "order" },
                    { href: "/videos", label: "Videos", section: "videos" },
                    { href: "/faq", label: "FAQ", section: "faq" },
                    { href: "/contact", label: "Contact", section: "contact" },
                    {
                      href: "/cart",
                      label: "Cart",
                      section: "cart",
                      highlight: itemCount > 0
                    },
                    // Mobile menu auth links will be handled by Clerk components directly if possible,
                    // or by conditional rendering based on `user` from `useUser()`
                  ] as NavLink[]).map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      {link.onClick ? ( // This was used for the old sign out, might need adjustment for Clerk
                        <button
                          className={`text-lg font-medium hover:text-amber-600 text-left w-full ${
                            pathname === link.href ? "text-amber-600" : ""
                          }`}
                          onClick={() => {
                            // setIsOpen(false) // handleMobileSignOut will close it
                            if (link.onClick) link.onClick();
                          }}
                        >
                          <span className={link.highlight ? 'text-amber-600 font-semibold' : ''}>
                            {link.label}
                          </span>
                          {link.badge && (
                            <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-1">
                              {link.badge}
                            </span>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className={`text-lg font-medium hover:text-amber-600 ${
                            pathname === link.href ? "text-amber-600" : ""
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className={link.highlight ? 'text-amber-600 font-semibold' : ''}>
                            {link.label}
                          </span>
                          {link.badge && (
                            <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-1">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      )
                      }
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Distribution Section for Mobile */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Distribution</h3>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/find-a-distributor"
                      className={`text-lg font-medium hover:text-amber-600 ${
                        pathname === "/find-a-distributor" ? "text-amber-600" : ""
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Find a Distributor
                    </Link>
                    <Link
                      href="/distributor-application"
                      className="text-lg font-semibold text-amber-600 hover:text-amber-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Become a Distributor
                    </Link>
                  </div>
                </div>

                {/* Clerk Auth for Mobile Menu */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <SignedIn>
                    <div className="flex flex-col gap-2">
                       <Link href="/profile" className="text-lg font-medium hover:text-amber-600" onClick={() => setIsOpen(false)}>Profile</Link>
                       <button
                        onClick={handleMobileSignOut}
                        className="text-lg font-medium hover:text-amber-600 text-left w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <div className="flex flex-col gap-2">
                      <Link href="/sign-in" className="text-lg font-medium hover:text-amber-600" onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                      <Link href="/sign-up" className="text-lg font-medium hover:text-amber-600" onClick={() => setIsOpen(false)}>
                        Sign Up
                      </Link>
                    </div>
                  </SignedOut>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

// Main Header component with Suspense boundary
export function Header() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 w-full border-b bg-gray-900">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex flex-col">
              <span className="text-xl font-bold text-white">Force Dowels™</span>
              <span className="text-xs text-amber-400 font-medium">Patent Pending</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  )
}




