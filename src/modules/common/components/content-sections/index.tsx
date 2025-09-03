import { ContentSection, SectionType } from "../../../../types/content-page"
import HeroSection from "./hero-section"
import TeamSection from "./team-section"
import ValuesGridSection from "./values-grid-section"
import StatsSection from "./stats-section"
import MarkdownSection from "./markdown-section"
import ContactSection from "./contact-section"
import FaqSection from "./faq-section"
import CtaSection from "./cta-section"
import FeatureBlockSection from "./feature-block-section"

// Phase 1: Layout Components
import TwoColumnSection from "./two-column-section"
import ThreeColumnSection from "./three-column-section"
import FourColumnSection from "./four-column-section"
import Grid2x2Section from "./grid-2x2-section"
import Grid3x3Section from "./grid-3x3-section"

// Phase 2: Content Display Components
import ImageTextSection from "./image-text-section"
import GallerySection from "./gallery-section"
import VideoSection from "./video-section"
import TestimonialsSection from "./testimonials-section"

// Phase 3: Interactive Components
import AccordionSection from "./accordion-section"
import TabsSection from "./tabs-section"
import ContentSliderSection from "./content-slider-section"
import CountdownSection from "./countdown-timer-section"

// Phase 4: Business Components
import PricingTableSection from "./pricing-table-section"
import FeaturesListSection from "./features-list-section"

// Phase 5: Form Components
import NewsletterSection from "./newsletter-signup-section"
import ContactFormSection from "./contact-form-section"

// Phase 6: Utility Components
import SpacerSection from "./spacer-section"
import DividerSection from "./divider-section"

// Component registry mapping section types to React components
const sectionComponents = {
  // Core 9 components from the guide
  hero: HeroSection,
  team: TeamSection,
  values_grid: ValuesGridSection,
  stats: StatsSection,
  markdown: MarkdownSection,
  contact: ContactSection,
  faq: FaqSection,
  cta: CtaSection,
  feature_block: FeatureBlockSection,
  
  // Phase 1: Layout Components
  two_column: TwoColumnSection,
  three_column: ThreeColumnSection,
  four_column: FourColumnSection,
  grid_2x2: Grid2x2Section,
  grid_3x3: Grid3x3Section,
  
  // Phase 2: Content Display Components
  image_text: ImageTextSection,
  gallery: GallerySection,
  video: VideoSection,
  testimonials: TestimonialsSection,
  
  // Phase 3: Interactive Components
  accordion: AccordionSection,
  tabs: TabsSection,
  content_slider: ContentSliderSection,
  countdown: CountdownSection,
  
  // Phase 4: Business Components
  pricing_table: PricingTableSection,
  features_list: FeaturesListSection,
  
  // Phase 5: Form Components
  newsletter: NewsletterSection,
  contact_form: ContactFormSection,
  
  // Phase 6: Utility Components
  spacer: SpacerSection,
  divider: DividerSection,
} as const

interface ContentSectionRendererProps {
  section: ContentSection
  delay?: number
}

/**
 * Renders a content section based on its type
 */
export const ContentSectionRenderer = ({ section, delay = 0 }: ContentSectionRendererProps) => {
  // Don't render invisible sections
  if (!section.is_visible) {
    return null
  }

  // Handle special cases and unknown section types
  let SectionComponent: React.ComponentType<{ data: any }> | null = null
  
  if (section.type === 'text_block') {
    SectionComponent = MarkdownSection
  } else {
    SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents] || null
  }
  
  if (!SectionComponent) {
    console.warn(`Unknown section type: ${section.type}`)
    return null
  }

  return (
    <div key={section.id} className="content-section" data-section-type={section.type}>
      <SectionComponent data={section.data} />
    </div>
  )
}

/**
 * Renders multiple content sections in order
 */
interface ContentSectionsRendererProps {
  sections: ContentSection[]
}

export const ContentSectionsRenderer = ({ sections }: ContentSectionsRendererProps) => {
  // Filter visible sections and sort by order
  const visibleSections = sections
    .filter(section => section.is_visible)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {visibleSections.map((section, index) => (
        <ContentSectionRenderer 
          key={section.id} 
          section={section} 
          delay={index * 0.5} 
        />
      ))}
    </>
  )
}

// Export individual components for direct use
export {
  // Core 9 components from the guide
  HeroSection,
  TeamSection,
  ValuesGridSection,
  StatsSection,
  MarkdownSection,
  ContactSection,
  FaqSection,
  CtaSection,
  FeatureBlockSection,
  
  // Phase 1: Layout Components
  TwoColumnSection,
  ThreeColumnSection,
  FourColumnSection,
  Grid2x2Section,
  Grid3x3Section,
  
  // Phase 2: Content Display Components
  ImageTextSection,
  GallerySection,
  VideoSection,
  TestimonialsSection,
  
  // Phase 3: Interactive Components
  AccordionSection,
  TabsSection,
  ContentSliderSection,
  CountdownSection,
  
  // Phase 4: Business Components
  PricingTableSection,
  FeaturesListSection,
  
  // Phase 5: Form Components
  NewsletterSection,
  ContactFormSection,
  
  // Phase 6: Utility Components
  SpacerSection,
  DividerSection,
}

// Export the registry for type checking and tooling
export { sectionComponents } 