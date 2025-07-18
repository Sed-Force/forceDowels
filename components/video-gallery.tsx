"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

// Define the video data type
interface VideoItem {
  id: number;
  title: string;
  youtubeId: string;
  youtubeUrl: string;
}



const videoData: VideoItem[] = [
  {
    id: 1,
    title: "540lb Structural Load Test",
    youtubeUrl: "https://youtu.be/bQ3HrRR9ERU?si=1E359MoO2DSqZTbm",
    youtubeId: "bQ3HrRR9ERU"
  },
  {
    id: 2,
    title: "Drill and Dowel Machine",
    youtubeUrl: "https://youtu.be/2yGzh8P3YB8?si=cbaI4IcPbglzSEtm",
    youtubeId: "2yGzh8P3YB8"
  },
  {
    id: 3,
    title: "Sideways Endurance Test- Over 330 lbs - 9 days",
    youtubeUrl: "https://youtu.be/OfQiub4Szm4?si=v2amaLXhlN9sMBFY",
    youtubeId: "OfQiub4Szm4"
  },
  {
    id: 4,
    title: "Sink Base Cabinet Assembly Video",
    youtubeUrl: "https://youtu.be/VgTYhwdQtBk?si=pFxL62bQaHWTuY-g",
    youtubeId: "VgTYhwdQtBk"
  },
  {
    id: 5,
    title: "Base Cabinet Assembly Video",
    youtubeUrl: "https://youtu.be/2JwbYhqQLgo?si=5pR2LT_6JQxtjoUk",
    youtubeId: "2JwbYhqQLgo"
  },
  {
    id: 6,
    title: "Upper Cabinet Assembly Video",
    youtubeUrl: "https://youtu.be/Y7wXrM5CKj8?si=pW-LkSDLORzXfxtS",
    youtubeId: "Y7wXrM5CKj8"
  },
  {
    id: 7,
    title: "Drawer Base Cabinet Assembly Video",
    youtubeUrl: "https://youtu.be/FMUZqFzqhos?si=EfN55O2nvBjXmg9o",
    youtubeId: "FMUZqFzqhos"
  },
];

const VideoGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const openVideoModal = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="container py-8 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Force Dowels Video Gallery
          <span className="block text-lg text-amber-600 font-medium mt-2">Patent Pending Technology</span>
        </h1>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-center"
      >
        <BentoGrid className="gap-5 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
          {videoData.map((video) => (
            <motion.div
              key={video.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <BentoGridItem
                colSpan={{ md: 1, lg: 1 }}
                rowSpan={1}
                className="overflow-hidden hover:border-amber-400 transition-colors duration-300 flex flex-col [&>div]:p-1 [&>div>div:last-child]:p-2"
                header={
                  <div className="relative aspect-[16/9] bg-muted overflow-hidden rounded-lg shadow-md mx-auto w-full p-[1px]">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover object-center"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex items-center justify-center cursor-pointer transition-all hover:bg-black/30"
                      onClick={() => openVideoModal(video)}
                    >
                      <div className="bg-amber-600 rounded-full p-3 shadow-lg transition-transform hover:bg-amber-500 hover:scale-110">
                        <Play className="h-6 w-6 text-white" fill="white" />
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="mt-1 mb-1">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-sm truncate">
                    {video.title}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-0 w-full bg-amber-50 border-amber-600 text-amber-600 hover:bg-amber-100 font-medium text-xs py-1"
                  onClick={() => openVideoModal(video)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Watch Video
                </Button>
              </BentoGridItem>
            </motion.div>
          ))}
        </BentoGrid>
      </motion.div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full max-w-4xl bg-background rounded-lg overflow-hidden relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 text-white bg-black/20 hover:bg-black/40"
              onClick={closeVideoModal}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="aspect-video bg-black w-full">
              {/* YouTube iframe embed */}
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;