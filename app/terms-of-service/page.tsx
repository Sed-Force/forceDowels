"use client"

import { motion } from "framer-motion"

export default function TermsOfServicePage() {
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
            Terms of Service
          </motion.h1>
          
          <motion.div
            className="prose prose-amber max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-sm text-gray-500 mb-6">Effective Date: 05/06/2025</p>
            
            <p className="mb-6">
              Welcome to https://forcedowels.com, operated by Force Dowels™. By accessing or using our Site,
              you agree to be bound by these Terms of Service.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">1. Use of Site</h2>
            <p className="mb-6">
              You agree to use this Site only for lawful purposes and in accordance with these Terms. 
              You may not use the Site for any fraudulent or harmful activity.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">2. Intellectual Property</h2>
            <p className="mb-6">
              All content on this site (logo, product descriptions, images, etc.) is owned by Force Dowels™
              and may not be reused without permission.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">3. Product Information</h2>
            <p className="mb-6">
              We strive for accuracy, but we do not guarantee that all product descriptions or availability 
              are error-free. Prices and product offerings are subject to change without notice.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">4. Payments & Orders</h2>
            <p className="mb-6">
              By placing an order, you agree to provide accurate information and authorize payment through 
              our approved methods. We reserve the right to cancel or refuse any order at our discretion.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
            <p className="mb-6">
              Force Dowels™ is not liable for any indirect, incidental, or consequential damages resulting
              from use of our site or products.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">6. Governing Law</h2>
            <p className="mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the State of Arizona, 
              without regard to its conflict of law principles.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">7. Contact</h2>
            <p className="mb-6">
              If you have any questions, contact us at info@forcedowels.com.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.main>
  )
}
