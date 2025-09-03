import { Grid2x2Data, GridItem } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import { ImageWithFallback } from "../../../../lib/components/content"
import Link from "next/link"
import { sanitizeHtml } from "../../../../lib/util/sanitize"

interface Grid2x2SectionProps {
  data: Grid2x2Data
}

const Grid2x2Section = ({ data }: Grid2x2SectionProps) => {
  // Gap mapping
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8'
  } as const

  // Card style mapping
  const cardStyleClasses = {
    default: 'bg-white rounded-lg overflow-hidden',
    bordered: 'bg-white border border-gray-200 rounded-lg overflow-hidden',
    shadow: 'bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-shadow',
    minimal: 'bg-transparent'
  } as const

  const renderCard = (item: GridItem, index: number) => {
    const cardContent = (
      <div
        className={cn(
          cardStyleClasses[data.card_style],
          data.equal_height && 'h-full',
          'group cursor-pointer' // For hover effects
        )}
        style={{
          backgroundColor: item.background_color || undefined
        }}
      >
        {/* Image */}
        {item.image && (
          <div className="relative aspect-video overflow-hidden">
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              fill
              className="group-hover:scale-105 transition-transform duration-300"
              aspectRatio="custom"
            />
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'p-6',
          data.card_style === 'minimal' && 'p-4'
        )}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>
          
          <div 
            className="prose prose-gray prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
          />
          
          {/* CTA Link */}
          {item.cta_text && (
            <div className="mt-4">
              <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                {item.cta_text} →
              </span>
            </div>
          )}
        </div>
      </div>
    )

    // Wrap in link if URL provided
    if (item.link) {
      return (
        <Link
          key={index}
          href={item.link}
          className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        >
          {cardContent}
        </Link>
      )
    }

    return (
      <div key={index}>
        {cardContent}
      </div>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Optional Section Title */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.title}
            </h2>
          </div>
        )}

        {/* 2x2 Grid */}
        <div
          className={cn(
            // Responsive: 1 column on mobile, 2x2 on desktop
            'grid grid-cols-1 md:grid-cols-2',
            gapClasses[data.gap],
            data.equal_height && 'items-stretch'
          )}
        >
          {data.items.map((item, index) => renderCard(item, index))}
        </div>
      </div>
    </section>
  )
}

export default Grid2x2Section 