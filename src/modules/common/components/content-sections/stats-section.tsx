import { StatsData } from "../../../../types/content-page"
import { AnimatedSection } from "../animated-section"
import * as LucideIcons from "lucide-react"

interface StatsSectionProps {
  data: StatsData
}

const getIconComponent = (iconName: string) => {
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName]
  return IconComponent || LucideIcons.TrendingUp // Fallback icon
}

const StatsSection = ({ data }: StatsSectionProps) => {
  const isGrid = data.layout === 'grid'
  
  return (
    <AnimatedSection variant="highlight" className="content-container">
      {data.title && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
        </div>
      )}

      <div className={`${
        isGrid 
          ? 'grid grid-cols-2 md:grid-cols-4 gap-8' 
          : 'flex flex-wrap justify-center gap-8 md:gap-16'
      }`}>
        {data.stats.map((stat, index) => {
          const IconComponent = stat.icon ? getIconComponent(stat.icon) : null
          
          return (
            <div key={index} className="text-center">
              {IconComponent && (
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              )}
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </AnimatedSection>
  )
}

export default StatsSection 