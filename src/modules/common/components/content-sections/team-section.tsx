import Image from "next/image"
import { TeamSectionData } from "../../../../types/content-page"
import { AnimatedSection } from "../animated-section"
import { Heart } from "lucide-react"

interface TeamSectionProps {
  data: TeamSectionData
}

const TeamSection = ({ data }: TeamSectionProps) => {
  // Provide fallback if members is not defined
  if (!data.members || data.members.length === 0) {
    return (
      <AnimatedSection variant="highlight" className="content-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title || 'Our Team'}</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {data.description || 'Meet our team'}
          </p>
        </div>
        <div className="text-center text-gray-500">
          No team members configured.
        </div>
      </AnimatedSection>
    )
  }

  return (
    <AnimatedSection variant="highlight" className="content-container">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          {data.description}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {data.members.map((member, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {member.image_url ? (
                <Image
                  src={member.image_url}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="text-2xl font-bold text-gray-500">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h4>
            <p className="text-yellow-600 font-medium mb-3">{member.role}</p>
            <p className="text-gray-700 text-sm mb-4">{member.bio}</p>
            
            {member.pets && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                <Heart className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-700">{member.pets}</span>
              </div>
            )}
            
            {member.social_links && member.social_links.length > 0 && (
              <div className="flex gap-2 justify-center mt-4">
                {member.social_links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-600 transition-colors"
                  >
                    <span className="sr-only">{link.platform}</span>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yellow-100 transition-colors">
                      {link.platform.charAt(0).toUpperCase()}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </AnimatedSection>
  )
}

export default TeamSection 