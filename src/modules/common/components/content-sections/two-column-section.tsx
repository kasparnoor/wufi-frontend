import { TwoColumnData, ColumnItem } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import { sanitizeHtml } from "../../../../lib/util/sanitize"

interface TwoColumnSectionProps {
  data: TwoColumnData
}

const TwoColumnSection = ({ data }: TwoColumnSectionProps) => {
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

  // Column ratio mapping for desktop
  const ratioClasses = {
    '1:1': 'md:grid-cols-2',
    '1:2': 'md:grid-cols-3 [&>*:first-child]:md:col-span-1 [&>*:last-child]:md:col-span-2',
    '2:1': 'md:grid-cols-3 [&>*:first-child]:md:col-span-2 [&>*:last-child]:md:col-span-1',
    '1:3': 'md:grid-cols-4 [&>*:first-child]:md:col-span-1 [&>*:last-child]:md:col-span-3',
    '3:1': 'md:grid-cols-4 [&>*:first-child]:md:col-span-3 [&>*:last-child]:md:col-span-1'
  } as const

  // Padding mapping
  const paddingClasses = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  } as const

  const ratio = data.column_ratio || '1:1'

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

        {/* Two Column Grid */}
        <div
          className={cn(
            // Base: Stack on mobile, grid on desktop
            'grid grid-cols-1',
            ratioClasses[ratio],
            gapClasses[data.gap],
            alignClasses[data.vertical_align]
          )}
        >
          {data.columns.map((column, index) => (
            <div
              key={index}
              className={cn(
                'content-column',
                paddingClasses[column.padding],
                column.background_color && `bg-[${column.background_color}]`,
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

export default TwoColumnSection 