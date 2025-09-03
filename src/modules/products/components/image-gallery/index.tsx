"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const hasThumbnails = images.length > 1
  const currentUrl = useMemo(() => images[currentImageIndex]?.url || "", [images, currentImageIndex])
  const [ratio, setRatio] = useState<number | null>(null)

  // Derive aspect ratio from the current image so the container gets auto height from width
  useEffect(() => {
    if (!currentUrl) return
    let cancelled = false
    const img = new window.Image()
    img.src = currentUrl
    img.onload = () => {
      if (cancelled) return
      if (img.naturalWidth && img.naturalHeight) {
        setRatio(img.naturalWidth / img.naturalHeight)
      }
    }
    return () => {
      cancelled = true
    }
  }, [currentUrl])

  // If no images, show placeholder
  if (!images.length) {
    return (
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group hover:from-gray-200 hover:to-gray-300 transition-all duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            📷
          </div>
          <span className="text-gray-500 text-sm md:text-base font-medium">No image available</span>
        </div>
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

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    setRotation(0) // Reset rotation when changing images
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    setRotation(0) // Reset rotation when changing images
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 h-full">
      {/* Main Image Container */}
      <div
        className={`relative w-full ${hasThumbnails ? 'lg:w-4/5' : 'lg:w-full'} bg-white rounded-lg border border-gray-100 overflow-hidden order-2 lg:order-1 group min-h-[220px]`}
        style={{
          aspectRatio: ratio || 4 / 3,
        }}
      >
        
        {/* Image Controls Overlay */}
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleZoom}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white hover:scale-110 transition-all duration-300 border border-gray-200"
            title={isZoomed ? "Zoom välja" : "Zoom sisse"}
          >
            {isZoomed ? (
              <ZoomOut className="h-4 w-4 text-gray-700" aria-hidden="true" />
            ) : (
              <ZoomIn className="h-4 w-4 text-gray-700" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={rotateImage}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white hover:scale-110 transition-all duration-300 border border-gray-200"
            title="Pööra pilti"
          >
            <RotateCw className="h-4 w-4 text-gray-700" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Arrows (only show if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-200"
              title="Eelmine pilt"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-200"
              title="Järgmine pilt"
            >
              →
            </button>
          </>
        )}

        {/* Main Image */}
        <button 
          className={`relative w-full h-full cursor-${isZoomed ? 'zoom-out' : 'zoom-in'} bg-transparent border-0 p-0`}
          onMouseMove={(e: React.MouseEvent<HTMLButtonElement>) => handleMouseMove(e as any)}
          onMouseEnter={() => !isZoomed && setIsZoomed(false)}
          onClick={toggleZoom}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleZoom()
            }
          }}
          title={isZoomed ? "Zoom välja" : "Zoom sisse"}
        >
          {images[currentImageIndex]?.url && (
            <Image
              src={images[currentImageIndex].url}
              priority={true}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+"
              className={`transition-all duration-500 ease-out ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              alt={`Product image ${currentImageIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{
                objectFit: "contain",
                objectPosition: "center",
                transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : "center",
                transform: `scale(${isZoomed ? 1.5 : 1}) rotate(${rotation}deg)`,
              }}
            />
          )}
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm" aria-hidden="true">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="w-full lg:w-1/5 order-1 lg:order-2 2xl:max-h-full">
          <div className="flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-x-visible 2xl:overflow-y-auto 2xl:h-full 2xl:max-h-full pb-2 lg:pb-0">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index)
                  setRotation(0) // Reset rotation when changing images
                }}
                className={`relative flex-shrink-0 w-16 h-16 lg:w-full lg:h-20 rounded-lg overflow-hidden bg-white border-2 transition-all duration-300 hover:scale-105 ${
                  index === currentImageIndex
                    ? "border-yellow-400 shadow-lg ring-2 ring-yellow-400/30"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                title={`View image ${index + 1}`}
              >
                {image.url && (
                  <Image
                    src={image.url}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nOTYnIGhlaWdodD0nOTYnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0nI2VlZWVlZScvPjwvc3ZnPiI="
                    alt={`Product thumbnail ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-contain p-1 transition-transform duration-300 hover:scale-110"
                  />
                )}
                
                {/* Active indicator */}
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-yellow-400/10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></div>
                  </div>
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
