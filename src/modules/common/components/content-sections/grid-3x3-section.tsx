import { Grid3x3Data, GridItem } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import { ImageWithFallback } from "../../../../lib/components/content"
import Link from "next/link"
import { sanitizeHtml } from "../../../../lib/util/sanitize"

interface Grid3x3SectionProps {
  data: Grid3x3Data
}

const Grid3x3Section = ({ data }: Grid3x3SectionProps) => {
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
          <div className="relative aspect-square overflow-hidden">
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
          'p-4',
          data.card_style === 'minimal' && 'p-3'
        )}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>
          
          <div 
            className="prose prose-gray prose-sm max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
          />
          
          {/* CTA Link */}
          {item.cta_text && (
            <div className="mt-3">
              <span className="text-blue-600 hover:text-blue-700 font-medium text-xs">
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
      <div className="max-w-7xl mx-auto">
        {/* Optional Section Title */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.title}
            </h2>
          </div>
        )}

        {/* 3x3 Grid */}
        <div
          className={cn(
            // Responsive: 1 column on mobile, 2 on tablet, 3x3 on desktop
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
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

export default Grid3x3Section 