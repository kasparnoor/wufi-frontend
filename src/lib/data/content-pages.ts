import { ContentPage } from "../../types/content-page"
import { cache } from "react"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export interface ContentPagesResponse {
  content_pages: ContentPage[]
  count: number
  offset: number
  limit: number
}

export interface ContentPageResponse {
  content_page: ContentPage
}

/**
 * Retrieve all published content pages
 * @param queryParams - Optional query parameters for filtering
 * @returns Promise<ContentPagesResponse | null>
 */
export const retrieveContentPages = cache(async (queryParams?: {
  status?: 'draft' | 'published' | 'archived'
  search?: string
  limit?: number
  offset?: number
}): Promise<ContentPagesResponse | null> => {
  const { getAuthHeaders } = await import("@lib/data/cookies")

  try {
    const searchParams = new URLSearchParams()
    
    // Default to published pages only
    searchParams.append('status', queryParams?.status || 'published')
    
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
      `${MEDUSA_BACKEND_URL}/store/content-pages${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
          ...headers,
        },
        next: {
          tags: ["content-pages"],
          revalidate: 3600, // Cache for 1 hour
        },
      }
    )

    if (!response.ok) {
      console.warn(`Content pages endpoint not available: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data as ContentPagesResponse

  } catch (error) {
    console.error("Error fetching content pages:", error)
    return null
  }
})

/**
 * Retrieve a single content page by slug
 * @param slug - The content page slug
 * @returns Promise<ContentPage | null>
 */
export const retrieveContentPageBySlug = cache(async (
  slug: string
): Promise<ContentPage | null> => {
  const { getAuthHeaders } = await import("@lib/data/cookies")

  try {
    const headers = await getAuthHeaders()

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/content-pages/${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
          ...headers,
        },
        next: {
          tags: ["content-pages", `content-page-${slug}`],
          revalidate: 3600, // Cache for 1 hour
        },
      }
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      console.warn(`Content page endpoint not available: ${response.status}`)
      return null
    }

    const data = await response.json() as ContentPageResponse
    return data.content_page

  } catch (error) {
    console.error(`Error fetching content page "${slug}":`, error)
    return null
  }
})

/**
 * Generate metadata for content pages
 * @param page - The content page
 * @returns Metadata object
 */
export const generateContentPageMetadata = (page: ContentPage) => {
  return {
    title: page.seo_title || `${page.title} | Kraps`,
    description: page.seo_description || `${page.title} - Kraps lemmikloomade toidupood`,
    openGraph: {
      title: page.seo_title || page.title,
      description: page.seo_description || `${page.title} - Kraps`,
      type: 'article' as const,
      url: `https://kraps.ee/${page.slug}`,
      images: page.og_image ? [{ url: page.og_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: page.seo_title || page.title,
      description: page.seo_description || `${page.title} - Kraps`,
      images: page.og_image ? [page.og_image] : undefined,
    },
  }
} 