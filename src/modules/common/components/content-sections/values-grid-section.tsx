import { ValuesGridData } from "../../../../types/content-page"
import { AnimatedSection, InteractiveCard } from "../animated-section"
import * as LucideIcons from "lucide-react"

interface ValuesGridSectionProps {
  data: ValuesGridData
}

const getLayoutClasses = (layout: ValuesGridData['layout']) => {
  switch (layout) {
    case '1x4':
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    case '2x2':
      return 'grid-cols-1 md:grid-cols-2'
    case '2x3':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    default:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
}

const getIconComponent = (iconName: string) => {
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName]
  return IconComponent || LucideIcons.Star // Fallback icon
}

const ValuesGridSection = ({ data }: ValuesGridSectionProps) => {
  const layoutClasses = getLayoutClasses(data.layout)

  return (
    <AnimatedSection variant="default" className="content-container">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
        <p className="text-lg text-gray-700">
          {data.description}
        </p>
      </div>

      <div className={`grid ${layoutClasses} gap-8`}>
        {data.items.map((item, index) => {
          const IconComponent = getIconComponent(item.icon)
          
          return (
            <InteractiveCard
              key={index}
              title={item.title}
              description={item.description}
              icon={IconComponent}
              highlight={item.highlight}
            />
          )
        })}
      </div>
    </AnimatedSection>
  )
}

export default ValuesGridSection 