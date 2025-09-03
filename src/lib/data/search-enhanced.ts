"use server"

import { getAuthHeaders } from "./cookies"

// Use environment variable for backend URL like other parts of the codebase
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

// Types
interface SearchRequest {
  q?: string
  brands?: string[]
  category_ids?: string[]
  features?: string[]
  weight_ranges?: string[]
  min_price?: number
  max_price?: number
  min_rating?: number
  sort?: string
  page?: number
  limit?: number
}

interface SearchResponse {
  query: string
  hits: ProductHit[]
  total: number
  page: number
  pages: number
  facets: {
    brands: Record<string, number>
    categories: Record<string, number>
    price_ranges: Record<string, number>
    weight_ranges: Record<string, number>
    features: Record<string, number>
  }
  processingTimeMS: number
}

interface ProductHit {
  objectID: string
  title: string
  description: string
  brand: string
  categories: string[]
  category_handles: string[]
  price_eur: number
  rating: number
  subscription_enabled: boolean
  features: string[]
  handle: string
  thumbnail: string
  sku: string
  weight_grams?: number
}

export async function searchProductsEnhanced(params: any): Promise<SearchResponse> {
  console.log("🔍 Enhanced search called with params:", JSON.stringify(params, null, 2))

  try {
    const headers = {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      ...(await getAuthHeaders()),
    }

    // Handle both old nested format and new flat format
    let searchParams: SearchRequest
    
    if (params.filters || params.pagination) {
      // Old nested format - transform to flat
      searchParams = {
        q: params.q,
        brands: params.filters?.brands,
        category_ids: params.filters?.categories, // Note: categories -> category_ids
        features: params.filters?.features,
        weight_ranges: params.filters?.weight_ranges,
        min_price: params.filters?.price_range?.min,
        max_price: params.filters?.price_range?.max,
        min_rating: params.filters?.min_rating,
        sort: params.sort || "newest",
        page: params.pagination?.page || 0,
        limit: params.pagination?.limit || 20,
      }
    } else {
      // New flat format - use directly
      searchParams = {
        q: params.q,
        brands: params.brands,
        category_ids: params.categories || params.category_ids,
        features: params.features,
        weight_ranges: params.weight_ranges,
        min_price: params.priceRange?.min || params.min_price,
        max_price: params.priceRange?.max || params.max_price,
        min_rating: params.minRating || params.min_rating,
        sort: params.sortBy || params.sort || "newest",
        page: params.page || 0,
        limit: params.limit || 20,
      }
    }

    // Remove undefined values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key as keyof SearchRequest] === undefined) {
        delete searchParams[key as keyof SearchRequest]
      }
    })

    console.log("📤 Sending request to backend:", JSON.stringify(searchParams, null, 2))
    console.log("🌐 Request URL:", `${MEDUSA_BACKEND_URL}/store/products/search`)
    console.log("🔑 Request headers:", JSON.stringify(headers, null, 2))

    // Call the backend search endpoint using environment variable
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(searchParams),
      cache: "no-store", // Don't cache search results
    })

    console.log("📥 Backend response status:", response.status)
    console.log("📥 Backend response headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Backend search error response:", errorText)
      throw new Error(`Backend search failed with status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log("✅ Backend search success:", {
      query: data.query,
      totalHits: data.total,
      pages: data.pages,
      processingTime: data.processingTimeMS,
      facetCounts: Object.keys(data.facets || {}).map(key => `${key}: ${Object.keys(data.facets[key] || {}).length}`)
    })

    return data
  } catch (error) {
    console.error("❌ Backend Algolia search error:", error)
    throw error
  }
} 