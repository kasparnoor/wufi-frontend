"use client"

import { ArrowRight, Star, ChevronRight } from "lucide-react"
import { CtaData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import * as LucideIcons from "lucide-react"

interface CtaSectionProps {
  data: CtaData
}

const getIconComponent = (iconName?: string) => {
  if (!iconName) return null
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName]
  return IconComponent || ArrowRight // Fallback icon
}

const CtaSection = ({ data }: CtaSectionProps) => {
  const getMaxWidthClass = () => {
    switch (data.max_width) {
      case 'sm':
        return 'max-w-2xl'
      case 'md':
        return 'max-w-4xl'
      case 'lg':
        return 'max-w-6xl'
      case 'xl':
        return 'max-w-7xl'
      default:
        return 'max-w-4xl'
    }
  }

  return (
    <section className="py-16 px-4">
      <div className={cn("mx-auto text-center", getMaxWidthClass())}>
        {/* Background Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 md:p-12">
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            {data.title}
          </h2>

          {/* Description */}
          {data.description && (
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {data.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {data.buttons.map((button, index) => {
              const IconComponent = getIconComponent(button.icon)
              
              return (
                <a
                  key={index}
                  href={button.href}
                  className={cn(
                    "inline-flex items-center px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                    // Primary button styles
                    button.variant === 'primary' && [
                      "bg-blue-600 text-white hover:bg-blue-700",
                      "shadow-lg hover:shadow-xl",
                      "focus:ring-blue-500"
                    ],
                    // Secondary button styles
                    button.variant === 'secondary' && [
                      "bg-white text-blue-600 border-2 border-blue-600",
                      "hover:bg-blue-50",
                      "focus:ring-blue-500"
                    ]
                  )}
                >
                  <span>{button.text}</span>
                  {IconComponent && (
                    <IconComponent className="ml-2 w-5 h-5" />
                  )}
                </a>
              )
            })}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-blue-200">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>Trusted by 1000+ customers</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-green-500" />
                <span>Free setup & migration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection 