import { HttpTypes } from "@medusajs/types"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

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

/**
 * Retrieve all published policy pages
 * @param queryParams - Optional query parameters for filtering
 * @returns Promise<PolicyPagesResponse | null>
 */
export const retrievePolicyPages = cache(async (queryParams?: {
  type?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<PolicyPagesResponse | null> => {
  const { getAuthHeaders } = await import("@lib/data/cookies")

  try {
    const searchParams = new URLSearchParams()
    
    if (queryParams?.type) {
      searchParams.append('type', queryParams.type)
    }
    if (queryParams?.search) {
      searchParams.append('search', queryParams.search)
    }
    if (queryParams?.limit) {
      searchParams.append('limit', queryParams.limit.toString())
    }
    if (queryParams?.offset) {
      searchParams.append('offset', queryParams.offset.toString())
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const headers = await getAuthHeaders()

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/policy-pages${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
          ...headers,
        },
        next: {
          tags: ["policy-pages"],
          revalidate: 3600, // Cache for 1 hour
        },
      }
    )

    if (!response.ok) {
      // Log the error but don't throw, return null to allow graceful fallback
      console.warn(`Policy pages endpoint not available: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data as PolicyPagesResponse

  } catch (error) {
    console.error("Error fetching policy pages:", error)
    return null
  }
})

/**
 * Retrieve a single policy page by slug
 * @param slug - The policy page slug
 * @returns Promise<PolicyPage | null>
 */
export const retrievePolicyPageBySlug = cache(async (
  slug: string
): Promise<PolicyPage | null> => {
  const { getAuthHeaders } = await import("@lib/data/cookies")

  try {
    const headers = await getAuthHeaders()

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/policy-pages/${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
          ...headers,
        },
        next: {
          tags: ["policy-pages", `policy-page-${slug}`],
          revalidate: 3600, // Cache for 1 hour
        },
      }
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      // Log the error but don't throw, return null to allow graceful fallback
      console.warn(`Policy page endpoint not available: ${response.status}`)
      return null
    }

    const data = await response.json() as PolicyPageResponse
    return data.policy_page

  } catch (error) {
    console.error(`Error fetching policy page "${slug}":`, error)
    return null
  }
})

/**
 * Get policy pages by type
 * @param type - The policy page type
 * @returns Promise<PolicyPage[]>
 */
export const retrievePolicyPagesByType = cache(async (
  type: PolicyPage['type']
): Promise<PolicyPage[]> => {
  const response = await retrievePolicyPages({ type })
  return response?.policy_pages || []
})

/**
 * Get policy pages for footer display (sorted by display_order)
 * @returns Promise<PolicyPage[]>
 */
export const retrieveFooterPolicyPages = cache(async (): Promise<PolicyPage[]> => {
  const response = await retrievePolicyPages({ limit: 10 })
  
  if (!response) {
    return []
  }

  // Sort by display_order
  return response.policy_pages.sort((a, b) => a.display_order - b.display_order)
})

/**
 * Generate metadata for policy pages
 * @param page - The policy page
 * @returns Metadata object
 */
export const generatePolicyPageMetadata = (page: PolicyPage) => {
  return {
    title: page.seo_title || `${page.title} | Kraps`,
    description: page.seo_description || `${page.title} - Kraps lemmikloomade toidupood`,
    openGraph: {
      title: page.seo_title || page.title,
      description: page.seo_description || `${page.title} - Kraps`,
      type: 'article' as const,
      url: `https://kraps.ee/policy/${page.slug}`,
    },
    twitter: {
      card: 'summary' as const,
      title: page.seo_title || page.title,
      description: page.seo_description || `${page.title} - Kraps`,
    }
  }
}

 