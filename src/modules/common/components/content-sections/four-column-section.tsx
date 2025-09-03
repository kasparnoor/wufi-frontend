import { FourColumnData, ColumnItem } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import { sanitizeHtml } from "../../../../lib/util/sanitize"

interface FourColumnSectionProps {
  data: FourColumnData
}

const FourColumnSection = ({ data }: FourColumnSectionProps) => {
  // Gap mapping
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-4',
    medium: 'gap-8',
    large: 'gap-12'
  } as const

  // Vertical alignment mapping
  const alignClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
    stretch: 'items-stretch'
  } as const

  // Padding mapping
  const paddingClasses = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  } as const

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

        {/* Four Column Grid */}
        <div
          className={cn(
            // Responsive: Stack on mobile, 2x2 on tablet, 4 columns on desktop
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
            gapClasses[data.gap],
            alignClasses[data.vertical_align]
          )}
        >
          {data.columns.map((column: ColumnItem, index: number) => (
            <div
              key={index}
              className={cn(
                'content-column',
                paddingClasses[column.padding],
                // Ensure proper height for stretch alignment
                data.vertical_align === 'stretch' && 'h-full'
              )}
              style={{
                backgroundColor: column.background_color || undefined
              }}
            >
              {/* Render markdown content */}
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(column.content) }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FourColumnSection 