"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, RotateCcw } from "lucide-react"

interface GalleryImage {
  id: number
  src: string
  alt: string
  title: string
  description: string
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/pics/dowels.jpg",
    alt: "Force Dowels™ Product",
    title: "Force Dowels™ System",
    description: "Revolutionary dowel system for cabinet assembly"
  },
  {
    id: 2,
    src: "/pics/dowels.jpg", // You can replace with different images
    alt: "Installation Process",
    title: "Easy Installation",
    description: "Simple and efficient installation process"
  },
  {
    id: 3,
    src: "/pics/dowels.jpg", // You can replace with different images
    alt: "Finished Result",
    title: "Professional Finish",
    description: "Clean, flush finish with no visible fasteners"
  }
]

export function InteractiveGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length)
    setIsZoomed(false)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    setIsZoomed(false)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  if (!isMounted) {
    return <div className="py-16"></div>
  }

  const currentImage = galleryImages[currentIndex]

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            See Force Dowels™ in Action
            <span className="block text-lg text-amber-600 font-medium mt-2">Patent Pending Technology</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our innovative dowel system and see the difference it makes
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Thumbnails */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:order-1 order-2"
            >
              <div className="space-y-4">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`cursor-pointer transition-all duration-300 ${
                      index === currentIndex 
                        ? 'ring-2 ring-amber-600 ring-offset-2' 
                        : 'hover:ring-2 hover:ring-amber-300 hover:ring-offset-2'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index)
                      setIsZoomed(false)
                    }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-2">
                        <div className="relative aspect-[4/3] w-full">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover rounded"
                            sizes="(max-width: 768px) 100vw, 300px"
                          />
                        </div>
                        <div className="p-2">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {image.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {image.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 lg:order-2 order-1"
            >
              <Card className="overflow-hidden shadow-xl">
                <CardContent className="p-0 relative">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isZoomed ? 1.5 : 1,
                          transition: { duration: 0.5 }
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full h-full cursor-pointer"
                        onClick={toggleZoom}
                      >
                        <Image
                          src={currentImage.src}
                          alt={currentImage.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 800px"
                          quality={100}
                          priority
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={toggleZoom}
                        className="bg-white/90 hover:bg-white"
                      >
                        {isZoomed ? <RotateCcw className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Navigation Arrows */}
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Info */}
                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {currentImage.title}
                      </h3>
                      <p className="text-gray-700">
                        {currentImage.description}
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Image Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <div className="flex justify-center gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsZoomed(false)
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-amber-600 scale-110" 
                      : "bg-amber-200 hover:bg-amber-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {currentIndex + 1} of {galleryImages.length} • Click to zoom
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
