"use client"

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  variant?: "default" | "highlight" | "feature" | "timeline"
  delay?: number
}

export const AnimatedSection = ({ 
  children, 
  className = "", 
  variant = "default",
  delay = 0 
}: AnimatedSectionProps) => {
  const baseClasses = "animate-fade-in-up"
  const variantClasses = {
    default: "py-12",
    highlight: "py-16 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl",
    feature: "py-12 bg-white rounded-xl shadow-sm border border-gray-100",
    timeline: "relative py-8"
  }
  
  const delayClass = delay > 0 ? `delay-${delay * 150}` : ""

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${delayClass} ${className}`}
      style={{ animationDelay: `${delay * 150}ms` }}
    >
      {children}
    </div>
  )
}

interface FeatureBlockProps {
  icon: LucideIcon
  title: string
  description: string
  visual?: ReactNode
  reverse?: boolean
  className?: string
}

export const FeatureBlock = ({ 
  icon: Icon, 
  title, 
  description, 
  visual, 
  reverse = false,
  className = ""
}: FeatureBlockProps) => {
  
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''} ${className}`}>
      <div className={reverse ? 'lg:col-start-2' : ''}>
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/10 rounded-2xl">
            <Icon className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h3>
          <p className="text-lg text-gray-700 leading-relaxed">{description}</p>
        </div>
      </div>
      {visual && (
        <div className={`${reverse ? 'lg:col-start-1' : ''}`}>
          {visual}
        </div>
      )}
    </div>
  )
}

interface InteractiveCardProps {
  title: string
  description: string
  icon: LucideIcon
  action?: ReactNode
  highlight?: boolean
  className?: string
}

export const InteractiveCard = ({ 
  title, 
  description, 
  icon: Icon, 
  action,
  highlight = false,
  className = ""
}: InteractiveCardProps) => {
  return (
    <div className={`
      group relative p-6 rounded-2xl border transition-all duration-300 
      ${highlight 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300' 
        : 'bg-white border-gray-200 hover:border-gray-300'
      }
      hover:shadow-lg hover:-translate-y-1 ${className}
    `}>
      <div className="space-y-4">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
          highlight ? 'bg-yellow-400/20' : 'bg-gray-100'
        }`}>
          <Icon className={`h-6 w-6 ${highlight ? 'text-yellow-600' : 'text-gray-600'}`} />
        </div>
        <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-700">{description}</p>
        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

interface TimelineItemProps {
  step: number
  title: string
  description: string
  icon: LucideIcon
  isLast?: boolean
}

export const TimelineItem = ({ step, title, description, icon: Icon, isLast = false }: TimelineItemProps) => {
  return (
    <div className="relative flex items-start space-x-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-yellow-400 to-orange-400 opacity-30" />
      )}
      
      {/* Step circle */}
      <div className="relative flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-sm">{step}</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-5 w-5 text-yellow-600" />
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        </div>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  )
} 