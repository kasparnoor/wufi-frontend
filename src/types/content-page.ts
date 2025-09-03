export interface ContentPage {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  seo_title?: string
  seo_description?: string
  og_image?: string
  sections: ContentSection[]
  created_at: string
  updated_at: string
  published_at?: string
  created_by: string
  updated_by: string
}

export interface ContentSection {
  id: string
  type: SectionType
  data: SectionData
  order: number
  is_visible: boolean
}

export type SectionType = 
  | 'hero'
  | 'team'
  | 'values_grid'
  | 'feature_block'
  | 'stats'
  | 'markdown'
  | 'text_block'  // Backend compatibility - maps to markdown
  | 'contact'
  | 'faq'
  | 'cta'
  // Phase 1: Layout Components
  | 'two_column'
  | 'three_column'
  | 'four_column'
  | 'grid_2x2'
  | 'grid_3x3'
  // Phase 2: Content Display Components
  | 'image_text'
  | 'gallery'
  | 'video'
  | 'testimonials'
  // Phase 3: Interactive Components
  | 'accordion'
  | 'tabs'
  | 'content_slider'
  | 'countdown'
  | 'countdown_timer'
  // Phase 4: Business Components
  | 'pricing_table'
  | 'features_list'
  // Phase 5: Form Components
  | 'newsletter'
  | 'contact_form'
  // Phase 6: Utility Components
  | 'spacer'
  | 'divider'

export type SectionData = 
  | HeroSectionData
  | TeamSectionData
  | ValuesGridData
  | FeatureBlockData
  | StatsData
  | MarkdownData
  | ContactData
  | FaqData
  | CtaData
  // Phase 1
  | TwoColumnData
  | ThreeColumnData
  | FourColumnData
  | Grid2x2Data
  | Grid3x3Data
  // Phase 2
  | ImageTextData
  | GalleryData
  | VideoData
  | TestimonialsData
  // Phase 3
  | AccordionData
  | TabsData
  | ContentSliderData
  | CountdownData
  | CountdownTimerData
  // Phase 4
  | PricingTableData
  | FeaturesListData
  // Phase 5
  | NewsletterData
  | ContactFormData
  // Phase 6
  | SpacerData
  | DividerData

export interface HeroSectionData {
  title: string
  subtitle: string
  badge?: string
  background_gradient: string
  cta_buttons: Array<{
    text: string
    href: string
    variant: 'primary' | 'secondary'
  }>
}

export interface TeamSectionData {
  title: string
  description: string
  members: Array<{
    name: string
    role: string
    bio: string
    image_url: string
    pets?: string
    social_links?: Array<{
      platform: string
      url: string
    }>
  }>
}

export interface ValuesGridData {
  title: string
  description: string
  layout: '2x2' | '1x4' | '2x3'
  items: Array<{
    title: string
    description: string
    icon: string
    highlight?: boolean
  }>
}

export interface FeatureBlockData {
  title: string
  description: string
  icon: string
  visual_type: 'stats' | 'image' | 'custom'
  visual_data: Record<string, any>
  reverse_layout: boolean
}

export interface StatsData {
  title?: string
  layout: 'horizontal' | 'grid'
  stats: Array<{
    value: string
    label: string
    icon?: string
  }>
}

export interface MarkdownData {
  content: string
  max_width: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  text_align: 'left' | 'center' | 'right'
}

export interface ContactData {
  title: string
  description: string
  methods: Array<{
    type: 'email' | 'phone' | 'address'
    label: string
    value: string
    description?: string
    icon: string
  }>
}

export interface FaqData {
  title: string
  description: string
  layout: '1-column' | '2-column'
  questions: Array<{
    question: string
    answer: string
  }>
}

export interface CtaData {
  title: string
  description: string
  buttons: Array<{
    text: string
    href: string
    variant: 'primary' | 'secondary'
    icon?: string
  }>
  max_width?: 'sm' | 'md' | 'lg' | 'xl'
}

// Phase 1: Layout Components

export interface ColumnItem {
  content: string
  background_color?: string
  padding: 'none' | 'small' | 'medium' | 'large'
}

export interface TwoColumnData {
  title?: string
  columns: [ColumnItem, ColumnItem]
  gap: 'none' | 'small' | 'medium' | 'large'
  vertical_align: 'top' | 'center' | 'bottom' | 'stretch'
  column_ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1'
}

export interface ThreeColumnData {
  title?: string
  columns: [ColumnItem, ColumnItem, ColumnItem]
  gap: 'none' | 'small' | 'medium' | 'large'
  vertical_align: 'top' | 'center' | 'bottom' | 'stretch'
}

export interface FourColumnData {
  title?: string
  columns: [ColumnItem, ColumnItem, ColumnItem, ColumnItem]
  gap: 'none' | 'small' | 'medium' | 'large'
  vertical_align: 'top' | 'center' | 'bottom' | 'stretch'
}

export interface GridItem {
  title: string
  content: string
  image?: string
  link?: string
  cta_text?: string
  background_color?: string
}

export interface Grid2x2Data {
  title?: string
  items: [GridItem, GridItem, GridItem, GridItem]
  gap: 'none' | 'small' | 'medium' | 'large'
  card_style: 'default' | 'bordered' | 'shadow' | 'minimal'
  equal_height: boolean
}

export interface Grid3x3Data {
  title?: string
  items: [GridItem, GridItem, GridItem, GridItem, GridItem, GridItem, GridItem, GridItem, GridItem]
  gap: 'none' | 'small' | 'medium' | 'large'
  card_style: 'default' | 'bordered' | 'shadow' | 'minimal'
  equal_height: boolean
}

// Phase 2: Content Display Components

export interface ImageTextData {
  title: string
  content: string
  image_url: string
  image_alt: string
  layout: 'image_left' | 'image_right' | 'image_top' | 'image_bottom'
  image_width?: string
  text_align: 'left' | 'center' | 'right'
  background_color?: string
}

export interface GalleryImage {
  url: string
  alt: string
  caption?: string
}

export interface GalleryData {
  title?: string
  images: GalleryImage[]
  layout: 'grid' | 'masonry' | 'carousel'
  columns: number
  spacing: 'none' | 'small' | 'medium' | 'large'
  show_captions: boolean
}

export interface VideoData {
  title?: string
  video_url: string
  video_type: 'youtube' | 'vimeo' | 'direct'
  thumbnail?: string
  autoplay: boolean
  controls: boolean
  background_color?: string
}

export interface TestimonialItem {
  content: string
  author: string
  role?: string
  company?: string
  avatar?: string
  rating?: number
}

export interface TestimonialsData {
  title: string
  testimonials: TestimonialItem[]
  layout: 'carousel' | 'grid' | 'single'
  show_avatars: boolean
  show_ratings: boolean
}

// Phase 3: Interactive Components

export interface AccordionItem {
  title: string
  content: string
}

export interface AccordionData {
  title?: string
  subtitle?: string
  items: AccordionItem[]
  allow_multiple: boolean
  default_open?: number
  style?: 'arrow' | 'plus' | 'chevron'
}

export interface TabItem {
  label: string
  title?: string
  content: string
}

export interface TabsData {
  title?: string
  tabs: TabItem[]
  style: 'default' | 'pills' | 'underline'
  position: 'top' | 'left' | 'right'
}

export interface ContentSliderData {
  title?: string
  slides: Array<{
    title?: string
    content: string
    background_color?: string
    cta_text?: string
    cta_url?: string
  }>
  autoplay: boolean
  autoplay_interval?: number
  interval: number
  show_dots: boolean
  show_arrows: boolean
}

export interface CountdownData {
  title: string
  target_date: string
  timezone: string
  format: 'days_hours_minutes' | 'hours_minutes_seconds' | 'days_only'
  expired_message: string
}

export interface CountdownTimerData {
  title: string
  description?: string
  target_date: string
  timezone: string
  format: 'days_hours_minutes' | 'hours_minutes_seconds' | 'days_only'
  expired_message: string
  cta_text?: string
  cta_url?: string
}

// Phase 4: Business Components

export interface PricingPlan {
  name: string
  price: string
  original_price?: string
  period: string
  description: string
  features: Array<{
    text: string
    included: boolean
  }>
  cta_text: string
  cta_url: string
  highlighted?: boolean
  featured?: boolean
}

export interface PricingTableData {
  title: string
  subtitle?: string
  additional_info?: string
  plans: PricingPlan[]
  billing_period: 'monthly' | 'yearly' | 'both'
  highlight_plan?: number
}

export interface FeaturesListData {
  title: string
  subtitle?: string
  description?: string
  features: Array<{
    title: string
    description: string
    icon: string
    highlight?: boolean
  }>
  layout: 'list' | 'grid' | 'comparison' | 'checklist'
  columns?: number
  cta_text?: string
  cta_url?: string
}

// Phase 5: Form Components

export interface NewsletterData {
  title: string
  subtitle?: string
  description?: string
  placeholder: string
  button_text: string
  background_color?: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface ContactFormData {
  title: string
  subtitle?: string
  fields: FormField[]
  submit_text: string
  success_message: string
}

// Phase 6: Utility Components

export interface SpacerData {
  size: 'small' | 'medium' | 'large' | 'extra-large' | 'custom'
  height: 'small' | 'medium' | 'large' | 'extra-large' | 'custom'
  custom_height?: string
  background_color?: string
}

export interface DividerData {
  style: 'solid' | 'dashed' | 'dotted' | 'gradient' | 'thick'
  color: string
  thickness: string
  width: string
  margin: 'none' | 'small' | 'medium' | 'large'
} 