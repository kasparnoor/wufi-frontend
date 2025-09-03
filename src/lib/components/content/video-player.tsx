"use client"

import { useState } from "react"
import { cn } from "../../utils"
import { Play } from "lucide-react"
import ImageWithFallback from "./image-with-fallback"

interface VideoPlayerProps {
  videoUrl: string
  videoType: "youtube" | "vimeo" | "direct"
  thumbnail?: string
  title?: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
  aspectRatio?: "video" | "square" | "cinema"
}

const VideoPlayer = ({
  videoUrl,
  videoType,
  thumbnail,
  title,
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
  className,
  aspectRatio = "video"
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [hasStarted, setHasStarted] = useState(false)

  // Aspect ratio classes
  const aspectRatioClasses = {
    video: "aspect-video",
    square: "aspect-square", 
    cinema: "aspect-[21/9]"
  }

  // Extract video ID from URLs
  const getVideoId = (url: string, type: "youtube" | "vimeo") => {
    if (type === "youtube") {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      return match?.[1]
    } else if (type === "vimeo") {
      const match = url.match(/(?:vimeo\.com\/)(\d+)/)
      return match?.[1]
    }
    return null
  }

  // Generate embed URLs
  const getEmbedUrl = () => {
    const videoId = getVideoId(videoUrl, videoType as "youtube" | "vimeo")
    
    if (videoType === "youtube" && videoId) {
      const params = new URLSearchParams()
      if (autoplay) params.append('autoplay', '1')
      if (!controls) params.append('controls', '0')
      if (muted) params.append('mute', '1')
      if (loop) params.append('loop', '1')
      params.append('rel', '0') // Don't show related videos
      params.append('modestbranding', '1') // Minimal YouTube branding
      
      return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
    } else if (videoType === "vimeo" && videoId) {
      const params = new URLSearchParams()
      if (autoplay) params.append('autoplay', '1')
      if (muted) params.append('muted', '1')
      if (loop) params.append('loop', '1')
      params.append('dnt', '1') // Do not track
      
      return `https://player.vimeo.com/video/${videoId}?${params.toString()}`
    }
    
    return videoUrl // Direct video URL
  }

  // Get thumbnail URL
  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail
    
    const videoId = getVideoId(videoUrl, videoType as "youtube" | "vimeo")
    
    if (videoType === "youtube" && videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    } else if (videoType === "vimeo" && videoId) {
      // Vimeo thumbnails require API call, so we'll use a placeholder
      return `https://vumbnail.com/${videoId}.jpg`
    }
    
    return undefined
  }

  const handlePlay = () => {
    setIsPlaying(true)
    setHasStarted(true)
  }

  const thumbnailUrl = getThumbnailUrl()

  // If not playing and we have a thumbnail, show thumbnail with play button
  if (!isPlaying && thumbnailUrl) {
    return (
      <div className={cn("relative group cursor-pointer", aspectRatioClasses[aspectRatio], className)}>
        <ImageWithFallback
          src={thumbnailUrl}
          alt={title || "Video thumbnail"}
          fill
          className="group-hover:scale-105 transition-transform duration-300"
          aspectRatio="custom"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <button
            onClick={handlePlay}
            className="flex items-center justify-center w-16 h-16 bg-white/90 hover:bg-white rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50"
            aria-label={`Play video${title ? `: ${title}` : ''}`}
          >
            <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
          </button>
        </div>
        
        {/* Title overlay */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
          </div>
        )}
      </div>
    )
  }

  // Render embedded video
  if (videoType === "direct") {
    return (
      <div className={cn("relative", aspectRatioClasses[aspectRatio], className)}>
        <video
          src={videoUrl}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          className="w-full h-full object-cover rounded-lg"
          title={title}
        >
          <track kind="captions" srcLang="en" label="English captions" />
        </video>
      </div>
    )
  }

  // Render iframe for YouTube/Vimeo
  return (
    <div className={cn("relative", aspectRatioClasses[aspectRatio], className)}>
      <iframe
        src={getEmbedUrl()}
        title={title || "Video player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
        loading="lazy"
      />
    </div>
  )
}

export default VideoPlayer 