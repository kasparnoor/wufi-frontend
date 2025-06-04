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
        <span className="text-gray-400 text-sm md:text-base">No image available</span>
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
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 h-full">
      {/* Main Image - Natural sizing, height responsive only on very large screens */}
      <div 
        className="relative aspect-[4/3] lg:aspect-[3/2] 2xl:aspect-auto 2xl:h-full w-full lg:w-4/5 bg-white rounded-md cursor-zoom-in order-2 lg:order-1"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {images[currentImageIndex]?.url && (
          <Image
            src={images[currentImageIndex].url}
            priority={true}
            className={`rounded-lg transition-transform duration-200 ${
              isZoomed ? "scale-150" : "scale-100"
            }`}
            alt={`Product image ${currentImageIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 90vw, 50vw"
            style={{
              objectFit: "contain",
              transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : "center",
            }}
          />
        )}
      </div>

      {/* Thumbnails - Natural sizing with overflow only when needed */}
      {images.length > 1 && (
        <div className="w-full lg:w-1/5 order-1 lg:order-2 2xl:max-h-full">
          <div className="flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto 2xl:overflow-y-auto 2xl:h-full 2xl:max-h-full">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 lg:w-full lg:h-20 rounded-md overflow-hidden bg-white border-2 transition-all duration-200 ${
                  index === currentImageIndex
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {image.url && (
                  <Image
                    src={image.url}
                    alt={`Product thumbnail ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-contain p-1"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
