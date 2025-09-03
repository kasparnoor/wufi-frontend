"use client"

import { useEffect, useState } from 'react'
import { ContentPage } from '../../types/content-page'

interface UseContentPagesOptions {
  status?: 'draft' | 'published' | 'archived'
  search?: string
  limit?: number
  offset?: number
}

interface ContentPagesResponse {
  content_pages: ContentPage[]
  count: number
  offset: number
  limit: number
}

interface ContentPageResponse {
  content_page: ContentPage
}

/**
 * Hook to fetch multiple content pages
 */
export const useContentPages = (options: UseContentPagesOptions = {}) => {
  const [pages, setPages] = useState<ContentPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options.status) params.append('status', options.status)
        if (options.search) params.append('search', options.search)
        if (options.limit) params.append('limit', options.limit.toString())
        if (options.offset) params.append('offset', options.offset.toString())

        const response = await fetch(`/api/content-pages?${params}`)
        
        if (response.ok) {
          const data: ContentPagesResponse = await response.json()
          setPages(data.content_pages || [])
        } else {
          setError('Failed to fetch content pages')
          setPages([])
        }
      } catch (err) {
        setError('Failed to fetch content pages')
        setPages([])
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [options.status, options.search, options.limit, options.offset])

  return { pages, loading, error }
}

/**
 * Hook to fetch a single content page by slug
 */
export const useContentPage = (slug: string) => {
  const [page, setPage] = useState<ContentPage | null>(null)
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

        const response = await fetch(`/api/content-pages/${slug}`)
        
        if (response.ok) {
          const data: ContentPageResponse = await response.json()
          setPage(data.content_page)
        } else if (response.status === 404) {
          setError('Content page not found')
          setPage(null)
        } else {
          setError('Failed to fetch content page')
          setPage(null)
        }
      } catch (err) {
        setError('Failed to fetch content page')
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
 * Hook to fetch published content pages for navigation
 */
export const usePublishedContentPages = () => {
  return useContentPages({ status: 'published' })
} 