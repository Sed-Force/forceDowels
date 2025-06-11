"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

// Define the media item type
type MediaItem = {
  src: string
  alt: string
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

  // Load images from public/pics folder
  useEffect(() => {
    // Create media array from images in public/pics folder
    const imageFiles = [
      '_DSF1596.JPG',
      '_DSF1597.JPG',
      '_DSF1599.JPG',
      '_DSF1600.JPG',
      '_DSF1601.JPG',
      'IMG_6806.JPG',
    ]

    const mediaItems: MediaItem[] = imageFiles.map(filename => ({
      src: `/pics/${filename}`,
      alt: generateAltText(filename),
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
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === media.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setDirection(1)
    setCurrentIndex(newIndex)
    setIsPlaying(false)
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (media[currentIndex].type === "video") {
      setIsPlaying(!isPlaying)
    }
  }

  // Enhanced animation variants for visible slide transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      zIndex: 1,
      opacity: 1, // Keep entering slide visible
    }),
    center: {
      x: 0,
      zIndex: 2,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      zIndex: 0,
      opacity: .85, // Keep exiting slide visible
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
      },
    }),
  }

  return (
    <div className="relative h-full w-full">
      {/* We're using the native Image preloading approach instead of this div */}

      {/* Previous button */}
      {media.length > 0 && (
        <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md"
              onClick={goToPrevious}
              disabled={!imagesLoaded}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous slide</span>
            </Button>
          </motion.div>
        </div>
      )}

      {/* Slider content */}
      <div className="w-full overflow-hidden rounded-lg border relative aspect-[4/3]">
        {media.length > 0 ? (
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute h-full w-full"
            >
              {media[currentIndex].type === "image" ? (
                <>
                  <Image
                    src={media[currentIndex].src || "/placeholder.svg"}
                    alt={media[currentIndex].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={100}
                  />
                  {!imagesLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mb-2"></div>
                        <p className="text-gray-700">Loading all images...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                media[currentIndex].type === "video" && (
                  <div className="relative h-full w-full">
                    <video
                      src={media[currentIndex].src}
                      className="h-full w-full object-cover"
                      controls={isPlaying}
                      autoPlay={isPlaying}
                      loop={false}
                      muted={!isPlaying}
                      playsInline
                    />
                    {!isPlaying && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                        onClick={togglePlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="rounded-full bg-white/80 p-4"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="h-10 w-10 text-amber-600" />
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                )
              )}
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
      </div>

      {/* Next button */}
      {media.length > 0 && (
        <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md"
              onClick={goToNext}
              disabled={!imagesLoaded}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next slide</span>
            </Button>
          </motion.div>
        </div>
      )}

      {/* Slide indicators */}
      {media.length > 0 && (
        <div className="absolute mt-2 left-1/2 z-10 flex -translate-x-1/2 space-x-3">
          {media.map((_, index) => (
            <button
              key={index}
              className={`h-3.5 w-3.5 rounded-full transition-colors duration-200 ${
                index === currentIndex ? "bg-amber-600" : "bg-gray-300"
              } ${!imagesLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => imagesLoaded && goToSlide(index)}
              disabled={!imagesLoaded}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
