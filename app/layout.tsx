import type React from "react"
import {
  ClerkProvider
} from '@clerk/nextjs'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context" 
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Force Dowels | Revolutionary Cabinetry Fasteners - Patent Pending",
  description: "Experience the next generation of cabinet assembly: faster, stronger, and with a flawless finish. Patent pending technology.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <SpeedInsights/>
              <AuthProvider> 
                <CartProvider>
                  <Header />
                  <div className="flex-1 overflow-auto">{children}</div>
                  <Footer />
                  <Toaster />
                </CartProvider>
              </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
