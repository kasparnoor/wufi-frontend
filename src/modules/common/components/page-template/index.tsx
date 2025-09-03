"use client"

import { ReactNode } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import { LocalizedClientLink, KrapsButton } from "@lib/components"

interface PageTemplateProps {
  children: ReactNode
  title: string
  subtitle?: string
  badge?: string
  hero?: {
    backgroundImage?: string
    backgroundGradient?: string
    overlay?: string
  }
  breadcrumb?: {
    href: string
    label: string
  }
  className?: string
}

const PageTemplate = ({ 
  children, 
  title, 
  subtitle, 
  badge,
  hero = {
    backgroundGradient: "from-yellow-400/20 via-orange-300/20 to-amber-400/20",
    overlay: "bg-gradient-to-br from-white/95 via-white/90 to-white/95"
  },
  breadcrumb,
  className = ""
}: PageTemplateProps) => {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {hero.backgroundImage ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${hero.backgroundImage})` }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${hero.backgroundGradient}`} />
          )}
          <div className={`absolute inset-0 ${hero.overlay}`} />
        </div>

        {/* Content */}
        <div className="relative z-10 content-container py-16 lg:py-24">
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="mb-8 animate-slide-up-1">
              <button
                onClick={() => {
                  if (breadcrumb.href === '/') {
                    window.location.href = '/'
                  } else {
                    window.location.href = breadcrumb.href
                  }
                }}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors group cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">{breadcrumb.label}</span>
              </button>
            </div>
          )}

          <div className="max-w-4xl">
            {/* Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 mb-6 bg-yellow-400/10 backdrop-blur-sm px-6 py-2.5 rounded-full border border-yellow-400/30 animate-slide-up-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-700 font-semibold">{badge}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-slide-up-3">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-3xl animate-slide-up-4">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-8 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-8 w-24 h-24 bg-orange-400/10 rounded-full blur-2xl animate-pulse delay-300" />
      </div>

      {/* Main Content */}
      <main className={`relative z-10 ${className}`}>
        {children}
      </main>


    </div>
  )
}

export default PageTemplate 