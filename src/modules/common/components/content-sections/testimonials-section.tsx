import { TestimonialsData, TestimonialItem } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import { ImageWithFallback, CarouselDots, CarouselArrows, useCarousel } from "../../../../lib/components/content"
import { Star } from "lucide-react"

interface TestimonialsSectionProps {
  data: TestimonialsData
}

const TestimonialsSection = ({ data }: TestimonialsSectionProps) => {
  const carousel = useCarousel({ 
    total: data.testimonials.length, 
    autoplay: true,
    interval: 6000,
    loop: true 
  })

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    )
  }

  // Render single testimonial card
  const renderTestimonialCard = (testimonial: TestimonialItem, index: number) => (
    <div
      key={index}
      className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col"
    >
      {/* Quote */}
      <div className="flex-grow mb-6">
        <blockquote className="text-gray-700 italic">
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>
      </div>

      {/* Rating */}
      {data.show_ratings && testimonial.rating && (
        <div className="mb-4">
          {renderStars(testimonial.rating)}
        </div>
      )}

      {/* Author Info */}
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        {data.show_avatars && testimonial.avatar && (
          <div className="flex-shrink-0">
            <ImageWithFallback
              src={testimonial.avatar}
              alt={testimonial.author}
              width={48}
              height={48}
              className="rounded-full"
              aspectRatio="square"
            />
          </div>
        )}

        {/* Author Details */}
        <div className="flex-grow">
          <div className="font-semibold text-gray-900">
            {testimonial.author}
          </div>
          {testimonial.role && (
            <div className="text-sm text-gray-600">
              {testimonial.role}
              {testimonial.company && ` at ${testimonial.company}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render grid layout
  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.testimonials.map((testimonial, index) => 
        renderTestimonialCard(testimonial, index)
      )}
    </div>
  )

  // Render carousel layout
  const renderCarouselLayout = () => (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${carousel.current * 100}%)` }}
        >
          {data.testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="text-center max-w-3xl mx-auto">
                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-gray-700 italic mb-8">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                {/* Rating */}
                {data.show_ratings && testimonial.rating && (
                  <div className="flex justify-center mb-6">
                    {renderStars(testimonial.rating)}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center justify-center space-x-4">
                  {/* Avatar */}
                  {data.show_avatars && testimonial.avatar && (
                    <ImageWithFallback
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      width={64}
                      height={64}
                      className="rounded-full"
                      aspectRatio="square"
                    />
                  )}

                  {/* Author Details */}
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-lg">
                      {testimonial.author}
                    </div>
                    {testimonial.role && (
                      <div className="text-gray-600">
                        {testimonial.role}
                        {testimonial.company && ` at ${testimonial.company}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {data.testimonials.length > 1 && (
        <>
          <CarouselArrows
            onPrevious={carousel.goToPrevious}
            onNext={carousel.goToNext}
            canGoPrevious={carousel.canGoPrevious}
            canGoNext={carousel.canGoNext}
            variant="outside"
            className="mt-8"
          />

          <CarouselDots
            total={data.testimonials.length}
            current={carousel.current}
            onDotClick={carousel.goToSlide}
            className="mt-6"
          />
        </>
      )}
    </div>
  )

  // Render single layout
  const renderSingleLayout = () => {
    const testimonial = data.testimonials[carousel.current]
    
    return (
      <div className="max-w-4xl mx-auto text-center">
        {/* Quote */}
        <blockquote className="text-2xl md:text-3xl text-gray-700 italic mb-8">
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>

        {/* Rating */}
        {data.show_ratings && testimonial.rating && (
          <div className="flex justify-center mb-8">
            {renderStars(testimonial.rating)}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center justify-center space-x-6">
          {/* Avatar */}
          {data.show_avatars && testimonial.avatar && (
            <ImageWithFallback
              src={testimonial.avatar}
              alt={testimonial.author}
              width={80}
              height={80}
              className="rounded-full"
              aspectRatio="square"
            />
          )}

          {/* Author Details */}
          <div className="text-left">
            <div className="font-semibold text-gray-900 text-xl">
              {testimonial.author}
            </div>
            {testimonial.role && (
              <div className="text-gray-600 text-lg">
                {testimonial.role}
                {testimonial.company && ` at ${testimonial.company}`}
              </div>
            )}
          </div>
        </div>

        {/* Navigation for single layout */}
        {data.testimonials.length > 1 && (
          <>
            <CarouselArrows
              onPrevious={carousel.goToPrevious}
              onNext={carousel.goToNext}
              canGoPrevious={carousel.canGoPrevious}
              canGoNext={carousel.canGoNext}
              variant="outside"
              className="mt-12"
            />

            <CarouselDots
              total={data.testimonials.length}
              current={carousel.current}
              onDotClick={carousel.goToSlide}
              className="mt-6"
            />
          </>
        )}
      </div>
    )
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            {data.title}
          </h2>
        </div>

        {/* Testimonials Content */}
        {data.layout === 'grid' && renderGridLayout()}
        {data.layout === 'carousel' && renderCarouselLayout()}
        {data.layout === 'single' && renderSingleLayout()}
      </div>
    </section>
  )
}

export default TestimonialsSection 