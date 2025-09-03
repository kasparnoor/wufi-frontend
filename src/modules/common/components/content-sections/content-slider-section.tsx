"use client"

import { ContentSliderData } from "../../../../types/content-page"
import { CarouselArrows, CarouselDots, useCarousel } from "../../../../lib/components/content"
import { cn } from "../../../../lib/utils"

interface ContentSliderSectionProps {
  data: ContentSliderData
}

const ContentSliderSection = ({ data }: ContentSliderSectionProps) => {
  const carousel = useCarousel({
    total: data.slides.length,
    autoplay: data.autoplay,
    interval: data.autoplay_interval || 5000,
  })

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.title}
            </h2>
          </div>
        )}

        {/* Slider Container */}
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${carousel.current * 100}%)` }}
            >
              {data.slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-white shadow-lg rounded-lg p-8 mx-2">
                    {/* Slide Title */}
                    {slide.title && (
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {slide.title}
                      </h3>
                    )}
                    
                    {/* Slide Content */}
                    <div className="prose prose-lg max-w-none text-gray-700">
                      {slide.content}
                    </div>
                    
                    {/* Slide CTA */}
                    {slide.cta_text && slide.cta_url && (
                      <div className="mt-6">
                        <a
                          href={slide.cta_url}
                          className={cn(
                            "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm",
                            "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                            "transition-colors duration-200"
                          )}
                        >
                          {slide.cta_text}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          {data.show_arrows && (
            <CarouselArrows
              onPrevious={carousel.goToPrevious}
              onNext={carousel.goToNext}
              canGoPrevious={carousel.canGoPrevious}
              canGoNext={carousel.canGoNext}
              variant="floating"
            />
          )}
        </div>

        {/* Dots Navigation */}
        {data.show_dots && (
          <CarouselDots
            total={data.slides.length}
            current={carousel.current}
            onDotClick={carousel.goToSlide}
            className="mt-8"
          />
        )}
      </div>
    </section>
  )
}

export default ContentSliderSection 