"use client"

import { Check, Star, ArrowRight } from "lucide-react"
import { FeaturesListData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface FeaturesListSectionProps {
  data: FeaturesListData
}

const FeaturesListSection = ({ data }: FeaturesListSectionProps) => {
  const getLayoutClass = () => {
    switch (data.layout) {
      case 'grid':
        return 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
      case 'list':
        return 'space-y-6'
      case 'checklist':
        return 'grid md:grid-cols-2 gap-4'
      default:
        return 'space-y-6'
    }
  }

  const renderFeature = (feature: { title: string; description: string; icon: string; highlight?: boolean }, index: number) => {
    switch (data.layout) {
      case 'grid':
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-900 font-medium">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        )

      case 'checklist':
        return (
          <div key={index} className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-900">
              {feature.title}
            </span>
          </div>
        )

      case 'list':
      default:
        return (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <ArrowRight className="w-5 h-5 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-900 text-lg font-medium">
                {feature.title}
              </h3>
              <p className="text-gray-600 mt-1">
                {feature.description}
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.title}
            </h2>
            {data.description && (
              <p className="mt-4 text-lg text-gray-600">
                {data.description}
              </p>
            )}
          </div>
        )}

        {/* Features */}
        <div className={getLayoutClass()}>
          {data.features.map((feature, index) => renderFeature(feature, index))}
        </div>

        {/* Call to Action */}
        {data.cta_text && data.cta_url && (
          <div className="mt-12 text-center">
            <a
              href={data.cta_url}
              className={cn(
                "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm",
                "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "transition-colors duration-200"
              )}
            >
              {data.cta_text}
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturesListSection 