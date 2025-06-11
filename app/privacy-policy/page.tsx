"use client"

import { motion } from "framer-motion"

export default function PrivacyPolicyPage() {
  // Get current date for the effective date if not specified
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <motion.main
      className="flex min-h-[calc(100vh-4rem)] flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container max-w-4xl flex flex-1 px-4 py-12 md:py-16 md:px-6">
        <div className="w-full">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Privacy Policy
          </motion.h1>
          
          <motion.div
            className="prose prose-amber max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-sm text-gray-500 mb-6">Effective Date: {currentDate}</p>
            
            <p className="mb-6">
              Force Dowels Company™ is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
              and protect your personal information when you visit https://forcedowels.com.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">
                <strong>Personal Information:</strong> Name, email address, phone number, shipping address (when you submit a form or place an order).
              </li>
              <li className="mb-2">
                <strong>Non-Personal Information:</strong> Browser type, device info, pages visited, and time spent on site (collected via cookies and analytics tools).
              </li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Process and fulfill orders</li>
              <li className="mb-2">Respond to inquiries</li>
              <li className="mb-2">Improve website performance and user experience</li>
              <li className="mb-2">Send occasional updates or promotional emails (you can opt out anytime)</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">3. Sharing Your Information</h2>
            <p className="mb-4">We do not sell or rent your personal data. We may share your information with:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Service providers (e.g., payment processors, shipping companies)</li>
              <li className="mb-2">Legal authorities if required by law</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">4. Cookies</h2>
            <p className="mb-6">
              We use cookies to track site usage and improve user experience. You can disable cookies in your browser settings.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Data Security</h2>
            <p className="mb-6">
              We implement reasonable security measures to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">6. Your Rights</h2>
            <p className="mb-6">
              You may request to access, correct, or delete your personal data by contacting us at info@forcedowels.com.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">7. Updates</h2>
            <p className="mb-6">
              We may update this policy periodically. Changes will be posted on this page with a revised date.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Contact Us</h2>
            <p className="mb-6">
              For questions, contact us at info@forcedowels.com.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.main>
  )
}
