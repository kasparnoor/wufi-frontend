import { ImageTextData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import Image from "next/image"
import { sanitizeHtml } from "../../../../lib/util/sanitize"

interface ImageTextSectionProps {
  data: ImageTextData
}

const ImageTextSection = ({ data }: ImageTextSectionProps) => {
  // Text alignment mapping
  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  } as const

  // Layout-specific classes
  const getLayoutClasses = () => {
    switch (data.layout) {
      case 'image_left':
        return {
          container: 'lg:grid-cols-2',
          imageOrder: 'order-1 lg:order-1',
          textOrder: 'order-2 lg:order-2'
        }
      case 'image_right':
        return {
          container: 'lg:grid-cols-2',
          imageOrder: 'order-1 lg:order-2',
          textOrder: 'order-2 lg:order-1'
        }
      case 'image_top':
        return {
          container: 'grid-cols-1',
          imageOrder: 'order-1',
          textOrder: 'order-2'
        }
      case 'image_bottom':
        return {
          container: 'grid-cols-1',
          imageOrder: 'order-2',
          textOrder: 'order-1'
        }
      default:
        return {
          container: 'lg:grid-cols-2',
          imageOrder: 'order-1',
          textOrder: 'order-2'
        }
    }
  }

  const layoutClasses = getLayoutClasses()
  const isVerticalLayout = data.layout === 'image_top' || data.layout === 'image_bottom'

  return (
    <section 
      className="py-16 px-4"
      style={{ backgroundColor: data.background_color || undefined }}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={cn(
            'grid gap-8 items-center',
            layoutClasses.container
          )}
        >
          {/* Image Container */}
          <div className={cn('relative', layoutClasses.imageOrder)}>
            <div 
              className={cn(
                'relative overflow-hidden rounded-lg',
                isVerticalLayout ? 'aspect-video' : 'aspect-square lg:aspect-[4/3]'
              )}
              style={{ 
                width: isVerticalLayout ? '100%' : (data.image_width || '100%') 
              }}
            >
              <Image
                src={data.image_url}
                alt={data.image_alt}
                fill
                className="object-cover"
                sizes={isVerticalLayout 
                  ? "(max-width: 768px) 100vw, 100vw"
                  : "(max-width: 768px) 100vw, 50vw"
                }
              />
            </div>
          </div>

          {/* Text Content */}
          <div className={cn('space-y-6', layoutClasses.textOrder)}>
            <div className={cn('space-y-4', textAlignClasses[data.text_align])}>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {data.title}
              </h2>
              
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.content) }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ImageTextSection 