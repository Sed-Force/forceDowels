"use client"

import { useState, useEffect } from "react"
import Image, { type ImageProps } from "next/image"
import { motion } from "framer-motion"

interface TransitionImageProps extends Omit<ImageProps, "onLoad"> {
  transitionDuration?: number
}

export function TransitionImage({ src, alt, className, transitionDuration = 0.5, ...props }: TransitionImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Reset loaded state when src changes
  useEffect(() => {
    setIsLoaded(false)
  }, [src])

  return (
    <motion.div
      className={`relative overflow-hidden ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.1,
        }}
        transition={{
          opacity: { duration: transitionDuration, ease: "easeOut" },
          scale: { duration: transitionDuration * 1.2, ease: "easeOut" },
        }}
        className="w-full h-full"
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`object-cover ${isLoaded ? "" : "opacity-0"}`}
          {...props}
        />
      </motion.div>
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />}
    </motion.div>
  )
}
