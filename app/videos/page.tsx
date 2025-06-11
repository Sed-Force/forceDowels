"use client"

import { motion } from "framer-motion"
import VideoGallery from "@/components/video-gallery"

export default function VideosPage() {
  return (
    <motion.main
      className="flex min-h-[calc(100vh-4rem)] flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VideoGallery />
    </motion.main>
  )
}