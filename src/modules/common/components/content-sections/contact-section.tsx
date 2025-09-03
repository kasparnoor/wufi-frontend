import { ContactData } from "../../../../types/content-page"
import { AnimatedSection } from "../animated-section"
import * as LucideIcons from "lucide-react"

interface ContactSectionProps {
  data: ContactData
}

const getIconComponent = (iconName: string) => {
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName]
  return IconComponent || LucideIcons.Mail // Fallback icon
}

const ContactSection = ({ data }: ContactSectionProps) => {
  // Provide fallback if methods is not defined
  if (!data.methods || data.methods.length === 0) {
    return (
      <AnimatedSection variant="highlight" className="content-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title || 'Contact Us'}</h2>
          <p className="text-lg text-gray-700">
            {data.description || 'Get in touch with us'}
          </p>
        </div>
        <div className="text-center text-gray-500">
          No contact methods configured.
        </div>
      </AnimatedSection>
    )
  }

  return (
    <AnimatedSection variant="highlight" className="content-container">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
        <p className="text-lg text-gray-700">
          {data.description}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {data.methods.map((method, index) => {
          const IconComponent = getIconComponent(method.icon)
          
          return (
            <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <IconComponent className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{method.label}</h4>
              {method.description && (
                <p className="text-gray-700 mb-4">{method.description}</p>
              )}
              
              {method.type === 'email' ? (
                <a href={`mailto:${method.value}`} className="text-yellow-600 font-medium hover:text-yellow-700">
                  {method.value}
                </a>
              ) : method.type === 'phone' ? (
                <a href={`tel:${method.value}`} className="text-yellow-600 font-medium hover:text-yellow-700">
                  {method.value}
                </a>
              ) : (
                <span className="text-yellow-600 font-medium">
                  {method.value}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </AnimatedSection>
  )
}

export default ContactSection 