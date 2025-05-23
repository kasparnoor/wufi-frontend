"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // If no images, show placeholder
  if (!images.length) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-100 rounded-md flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    
    setMousePosition({ x, y })
  }

  return (
    <div className="flex flex-col md:flex-row gap-1.5">
      {/* Main Image with Zoom */}
      <div 
        className="relative aspect-[4/3] w-full md:w-4/5 max-h-[310px] overflow-hidden bg-white rounded-md cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {images[currentImageIndex]?.url && (
          <div className="w-full h-full relative">
            <Image
              src={images[currentImageIndex].url}
              priority={true}
              className={`rounded-lg transition-transform duration-200 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              alt={`Product image ${currentImageIndex + 1}`}
              fill
              sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 640px"
              style={{
                objectFit: "contain",
                transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : "center",
              }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:w-1/5 flex-row md:flex-col gap-1 justify-start">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={image.id}
              className={`relative aspect-square overflow-hidden rounded-md border transition-all w-11 h-11 md:w-full md:h-auto flex-shrink-0 ${
                index === currentImageIndex 
                  ? "border-blue-500 opacity-100" 
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              {image.url && (
                <Image
                  src={image.url}
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 48px, 72px"
                  className="object-contain"
                />
              )}
            </button>
          ))}
          {images.length > 4 && (
            <button
              className="relative aspect-square overflow-hidden rounded-md border border-gray-200 w-11 h-11 md:w-full md:h-auto flex-shrink-0 bg-gray-50 flex items-center justify-center text-xs text-gray-500"
              onClick={() => setCurrentImageIndex(4)}
              aria-label="View more images"
            >
              +{images.length - 4}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
