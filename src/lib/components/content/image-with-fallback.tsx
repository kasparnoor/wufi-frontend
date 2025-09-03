"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "../../utils"

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  containerClassName?: string
  sizes?: string
  priority?: boolean
  fallbackSrc?: string
  showLoadingPlaceholder?: boolean
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "custom"
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  onClick?: () => void
}

const ImageWithFallback = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  sizes,
  priority = false,
  fallbackSrc = "/images/placeholder-image.jpg",
  showLoadingPlaceholder = true,
  aspectRatio = "landscape",
  objectFit = "cover",
  onClick,
}: ImageWithFallbackProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video", 
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    custom: ""
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }

  if (fill) {
    return (
      <div 
        className={cn("relative overflow-hidden", aspectRatioClasses[aspectRatio], containerClassName)}
        onClick={onClick}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Loading Placeholder */}
        {isLoading && showLoadingPlaceholder && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        
        {/* Image */}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={cn(
            `object-${objectFit} transition-opacity duration-300`,
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
        
        {/* Error State */}
        {hasError && imageSrc === fallbackSrc && (
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative", containerClassName)}>
      {/* Loading Placeholder */}
      {isLoading && showLoadingPlaceholder && (
        <div 
          className="bg-gray-200 animate-pulse flex items-center justify-center rounded"
          style={{ width: width || 400, height: height || 300 }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Image */}
      <Image
        src={imageSrc}
        alt={alt}
        width={width || 400}
        height={height || 300}
        className={cn(
          `object-${objectFit} transition-opacity duration-300 rounded`,
          isLoading ? "opacity-0 absolute" : "opacity-100",
          className
        )}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Error State */}
      {hasError && imageSrc === fallbackSrc && (
        <div 
          className="bg-gray-100 flex flex-col items-center justify-center text-gray-500 rounded"
          style={{ width: width || 400, height: height || 300 }}
        >
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span className="text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  )
}

export default ImageWithFallback 