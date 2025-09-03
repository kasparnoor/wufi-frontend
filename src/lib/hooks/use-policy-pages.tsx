"use client"

import { useEffect, useState } from 'react'

interface PolicyPage {
  id: string
  title: string
  slug: string
  content: string
  type: string
  is_published: boolean
  display_order: number
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

interface UsePolicyPagesOptions {
  type?: string
  search?: string
  limit?: number
  offset?: number
}

interface PolicyPagesResponse {
  policy_pages: PolicyPage[]
}

interface PolicyPageResponse {
  policy_page: PolicyPage
}

/**
 * Hook to fetch multiple policy pages with options
 */
export const usePolicyPages = (options: UsePolicyPagesOptions = {}) => {
  const [pages, setPages] = useState<PolicyPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options.type) params.append('type', options.type)
        if (options.search) params.append('search', options.search)
        if (options.limit) params.append('limit', options.limit.toString())
        if (options.offset) params.append('offset', options.offset.toString())

        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/policy-pages?${params}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
          },
        })
        
        if (response.ok) {
          const data: PolicyPagesResponse = await response.json()
          setPages(data.policy_pages || [])
        } else {
          setError('Failed to fetch policy pages')
          setPages([])
        }
      } catch (err) {
        setError('Failed to fetch policy pages')
        setPages([])
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [options.type, options.search, options.limit, options.offset])

  return { pages, loading, error }
}

/**
 * Hook to fetch a single policy page by slug
 */
export const usePolicyPage = (slug: string) => {
  const [page, setPage] = useState<PolicyPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/policy-pages/${slug}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
          },
        })
        
        if (response.ok) {
          const data: PolicyPageResponse = await response.json()
          setPage(data.policy_page)
        } else if (response.status === 404) {
          setError('Policy page not found')
          setPage(null)
        } else {
          setError('Failed to fetch policy page')
          setPage(null)
        }
      } catch (err) {
        setError('Failed to fetch policy page')
        setPage(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  return { page, loading, error }
}

/**
 * Hook to get policy pages for footer (sorted by display_order)
 */
export const useFooterPolicyPages = () => {
  const { pages, loading, error } = usePolicyPages({ limit: 10 })
  
  // Sort by display_order
  const sortedPages = pages.sort((a, b) => a.display_order - b.display_order)
  
  return { pages: sortedPages, loading, error }
}

/**
 * Hook to get policy pages by type
 */
export const usePolicyPagesByType = (type: string) => {
  return usePolicyPages({ type })
} 