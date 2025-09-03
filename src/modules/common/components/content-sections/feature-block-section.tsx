import { FeatureBlockData } from "../../../../types/content-page"
import { AnimatedSection, FeatureBlock } from "../animated-section"
import * as LucideIcons from "lucide-react"
import Image from "next/image"

interface FeatureBlockSectionProps {
  data: FeatureBlockData
}

const getIconComponent = (iconName: string) => {
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName]
  return IconComponent || LucideIcons.Star // Fallback icon
}

const renderVisual = (visualType: FeatureBlockData['visual_type'], visualData: Record<string, any>) => {
  switch (visualType) {
    case 'stats':
      return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
          <div className="space-y-6">
            {visualData.items?.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <h5 className="font-semibold text-indigo-900">{item.title}</h5>
                  <p className="text-sm text-indigo-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    
    case 'image':
      return visualData.image_url ? (
        <div className="rounded-2xl overflow-hidden">
          <Image 
            src={visualData.image_url} 
            alt={visualData.alt_text || ''} 
            width={500}
            height={300}
            className="w-full h-auto"
          />
        </div>
      ) : null
    
    case 'custom':
    default:
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{visualData.emoji || '✨'}</div>
            <h4 className="text-xl font-semibold text-blue-800 mb-2">
              {visualData.title || 'Feature'}
            </h4>
            <p className="text-blue-700">
              {visualData.description || 'Powerful functionality'}
            </p>
          </div>
        </div>
      )
  }
}

const FeatureBlockSection = ({ data }: FeatureBlockSectionProps) => {
  const IconComponent = getIconComponent(data.icon)
  const visual = renderVisual(data.visual_type, data.visual_data)

  return (
    <AnimatedSection variant="feature" className="content-container">
      <FeatureBlock
        icon={IconComponent}
        title={data.title}
        description={data.description}
        visual={visual}
        reverse={data.reverse_layout}
      />
    </AnimatedSection>
  )
}

export default FeatureBlockSection 