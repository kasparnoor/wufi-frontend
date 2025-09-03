"use client"

import { GalleryData, GalleryImage } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import { ImageWithFallback, CarouselDots, CarouselArrows, useCarousel } from "../../../../lib/components/content"
import { useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"

interface GallerySectionProps {
  data: GalleryData
}

const GallerySection = ({ data }: GallerySectionProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  
  const carousel = useCarousel({ 
    total: data.images.length, 
    autoplay: false,
    loop: true 
  })

  // Spacing mapping
  const spacingClasses = {
    none: 'gap-0',
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  } as const

  // Open lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    carousel.goToSlide(index)
  }

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  // Handle keyboard navigation in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLightbox()
    } else if (e.key === 'ArrowLeft') {
      carousel.goToPrevious()
    } else if (e.key === 'ArrowRight') {
      carousel.goToNext()
    }
  }

  // Render grid layout
  const renderGridLayout = () => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }[data.columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

    return (
      <div className={cn('grid', gridCols, spacingClasses[data.spacing])}>
        {data.images.map((image, index) => (
          <button
            key={index}
            className="relative group cursor-pointer w-full text-left"
            onClick={() => openLightbox(index)}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
            aria-label={`View image: ${image.alt}`}
          >
            <div className="aspect-square overflow-hidden rounded-lg">
              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                fill
                className="group-hover:scale-105 transition-transform duration-300"
                aspectRatio="custom"
              />
            </div>
            
            {/* Caption overlay */}
            {data.show_captions && image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Render masonry layout (simplified - using CSS columns)
  const renderMasonryLayout = () => {
    const columnCount = Math.min(data.columns, 4)
    
    return (
      <div 
        className={cn('columns-1 md:columns-2 lg:columns-3', spacingClasses[data.spacing])}
        style={{ columnCount }}
      >
        {data.images.map((image, index) => (
          <button
            key={index}
            className="relative group cursor-pointer break-inside-avoid mb-4 w-full text-left"
            onClick={() => openLightbox(index)}
            aria-label={`View image: ${image.alt}`}
          >
            <div className="overflow-hidden rounded-lg">
              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                width={400}
                height={300}
                className="w-full group-hover:scale-105 transition-transform duration-300"
                aspectRatio="custom"
              />
            </div>
            
            {/* Caption */}
            {data.show_captions && image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Render carousel layout
  const renderCarouselLayout = () => {
    return (
      <div className="relative">
        <div className="overflow-hidden rounded-lg">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${carousel.current * 100}%)` }}
          >
            {data.images.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="cursor-pointer"
                    onClick={() => openLightbox(index)}
                    aspectRatio="custom"
                  />
                  
                  {/* Caption */}
                  {data.show_captions && image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white">{image.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        <CarouselArrows
          onPrevious={carousel.goToPrevious}
          onNext={carousel.goToNext}
          canGoPrevious={carousel.canGoPrevious}
          canGoNext={carousel.canGoNext}
          variant="floating"
        />

        {/* Dots */}
        <CarouselDots
          total={data.images.length}
          current={carousel.current}
          onDotClick={carousel.goToSlide}
          className="mt-4"
        />
      </div>
    )
  }

  return (
    <>
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          {data.title && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {data.title}
              </h2>
            </div>
          )}

          {/* Gallery Content */}
          {data.layout === 'grid' && renderGridLayout()}
          {data.layout === 'masonry' && renderMasonryLayout()}
          {data.layout === 'carousel' && renderCarouselLayout()}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          tabIndex={-1}
        >
          <button
            className="absolute inset-0 w-full h-full"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            aria-label="Close lightbox"
          />
          <div className="relative max-w-4xl max-h-full z-10">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative">
              <ImageWithFallback
                src={data.images[carousel.current].url}
                alt={data.images[carousel.current].alt}
                width={800}
                height={600}
                className="max-h-[80vh] w-auto object-contain"
                aspectRatio="custom"
              />
              
              {/* Caption */}
              {data.show_captions && data.images[carousel.current].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4">
                  <p className="text-white text-center">{data.images[carousel.current].caption}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            {data.images.length > 1 && (
              <>
                <CarouselArrows
                  onPrevious={carousel.goToPrevious}
                  onNext={carousel.goToNext}
                  canGoPrevious={carousel.canGoPrevious}
                  canGoNext={carousel.canGoNext}
                  variant="floating"
                />
                
                <CarouselDots
                  total={data.images.length}
                  current={carousel.current}
                  onDotClick={carousel.goToSlide}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default GallerySection 