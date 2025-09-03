export interface PolicyPage {
  id: string
  title: string
  slug: string
  content: string
  type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'refund_policy' | 'shipping_policy' | 'general'
  is_published: boolean
  display_order: number
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

export interface PolicyPagesResponse {
  policy_pages: PolicyPage[]
}

export interface PolicyPageResponse {
  policy_page: PolicyPage
}

export type PolicyPageType = PolicyPage['type'] 