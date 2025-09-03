import { HeroSectionData } from "../../../../types/content-page"
import { AnimatedSection } from "../animated-section"
import { KrapsButton, LocalizedClientLink } from "@lib/components"
import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
  data: HeroSectionData
}

const HeroSection = ({ data }: HeroSectionProps) => {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${data.background_gradient} py-24 sm:py-32`}>
      <div className="content-container">
        <AnimatedSection variant="default" className="text-center">
          <div className="max-w-4xl mx-auto">
            {data.badge && (
              <div className="inline-flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/20">
                <span className="text-gray-800 font-semibold text-sm">{data.badge}</span>
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {data.title}
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              {data.subtitle}
            </p>
            
            {data.cta_buttons && data.cta_buttons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {data.cta_buttons.map((button, index) => (
                  <LocalizedClientLink key={index} href={button.href}>
                    <KrapsButton 
                      variant={button.variant} 
                      size="large"
                      className="min-w-[200px]"
                    >
                      {button.text}
                      {button.variant === 'primary' && (
                        <ArrowRight className="h-4 w-4 ml-2" />
                      )}
                    </KrapsButton>
                  </LocalizedClientLink>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-5"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full opacity-5"></div>
      </div>
    </div>
  )
}

export default HeroSection 