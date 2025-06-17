"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, ZoomIn, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Define the enhanced media item type
type MediaItem = {
  src: string
  alt: string
  title: string
  description: string
  type: "image" | "video"
}

// Function to generate alt text from filename
const generateAltText = (filename: string): string => {
  // Remove extension and replace hyphens/underscores with spaces
  const name = filename
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/[-_]/g, ' ')

  // Capitalize first letter of each word
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper functions for image handling

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [direction, setDirection] = useState(0)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load images from public/pics folder
  useEffect(() => {
    // Create media array from images in public/pics folder with enhanced metadata
    const imageData = [
      {
        filename: 'dowels.jpg',
        title: 'Force Dowels™ System',
        description: 'Revolutionary dowel system for cabinet assembly'
      },
      {
        filename: 'Dowel-group.JPG',
        title: 'Precision Engineering',
        description: 'Engineered for perfect alignment and strength'
      },
      {
        filename: 'dowel-panel-side-shot.jpg',
        title: 'Easy Installation',
        description: 'Simple and efficient installation process'
      },
      {
        filename: 'dowel-close-up-2.JPG',
        title: 'Professional Finish',
        description: 'Clean, flush finish with no visible fasteners'
      },
      {
        filename: 'IMG_6806.JPG',
        title: 'Complete Solution',
        description: 'Everything you need for modern cabinet assembly'
      },
    ]

    const mediaItems: MediaItem[] = imageData.map(item => ({
      src: `/pics/${item.filename}`,
      alt: generateAltText(item.filename),
      title: item.title,
      description: item.description,
      type: 'image'
    }))

    setMedia(mediaItems)

    // Preload all images
    const preloadImages = async () => {
      try {
        const imagePromises = mediaItems
          .filter(item => item.type === 'image')
          .map(item => {
            return new Promise((resolve, reject) => {
              const img = new window.Image();
              img.src = item.src;
              img.onload = () => resolve(undefined);
              img.onerror = () => reject(new Error(`Failed to load image: ${item.src}`));
            });
          });

        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        // Still set as loaded even if there's an error to avoid blocking the UI
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, [])

  // Handle navigation
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? media.length - 1 : currentIndex - 1
    setDirection(-1)
    setCurrentIndex(newIndex)
    setIsPlaying(false)
    setIsZoomed(false)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === media.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setDirection(1)
    setCurrentIndex(newIndex)
    setIsPlaying(false)
    setIsZoomed(false)
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    setIsPlaying(false)
    setIsZoomed(false)
  }

  const togglePlay = () => {
    if (media[currentIndex].type === "video") {
      setIsPlaying(!isPlaying)
    }
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  if (!isMounted) {
    return <div className="h-full w-full"></div>
  }

  const currentImage = media[currentIndex]

  return (
    <div className="h-full w-full">
      {/* Main Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="h-full w-full"
      >
          <Card className="overflow-hidden shadow-xl h-full">
            <CardContent className="p-0 relative h-full flex flex-col">
              <div className="relative aspect-[4/3] w-full overflow-hidden flex-1">
                {media.length > 0 && currentImage ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-100">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mb-2"></div>
                      <p className="text-gray-700">Loading images...</p>
                    </div>
                  </div>
                )}

                {/* Overlay Controls */}
                {media.length > 0 && (
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
                )}

                {/* Navigation Arrows */}
                {media.length > 0 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Image Info */}
              {media.length > 0 && currentImage && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {currentImage.title}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {currentImage.description}
                    </p>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Counter */}
        {media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-4"
          >
            <div className="flex justify-center gap-2">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsZoomed(false)
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-amber-600 scale-110"
                      : "bg-amber-200 hover:bg-amber-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {currentIndex + 1} of {media.length} • Click to zoom
            </p>
          </motion.div>
        )}
      </div>
    )
  }
