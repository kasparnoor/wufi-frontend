"use server"

import { sdk } from "@lib/config"
import { SearchParams, SearchResponse } from "../../types/search"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const searchProducts = async (
  searchParams: SearchParams
): Promise<SearchResponse> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const cacheOptions = await getCacheOptions("search")

  // Build query parameters for Medusa /store/products endpoint
  const query: Record<string, any> = {
    limit: searchParams.limit || 20,
    offset: ((searchParams.page || 0) * (searchParams.limit || 20)),
    fields: "*variants.calculated_price,*images,*categories"
  }
  
  // Add search query
  if (searchParams.q) {
    query.q = searchParams.q
  }

  // Add category filter
  if (searchParams.categories) {
    query.category_id = [searchParams.categories]
  }

  // Add sorting
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case 'price_asc':
        query.order = 'variants.calculated_price.calculated_amount'
        break
      case 'price_desc':
        query.order = '-variants.calculated_price.calculated_amount'
        break
      case 'popularity':
        query.order = '-sales_count'
        break
      default:
        query.order = '-created_at'
    }
  } else {
    query.order = '-created_at'
  }

  try {
    const startTime = Date.now()
    const response = await sdk.client.fetch<{ 
      products: HttpTypes.StoreProduct[]
      count: number 
    }>("/store/products", {
      method: "GET",
      query,
      headers,
      next: cacheOptions,
      cache: "no-store", // Don't cache search results by default
    })

    const processingTime = Date.now() - startTime

    // Transform Medusa products to search format
    const hits = response.products.map(product => ({
      objectID: product.id,
      title: product.title || '',
      description: product.description || '',
      brand: (product.metadata?.brand as string) || 'Unknown',
      categories: product.categories?.map(cat => cat.name) || [],
      price_eur: product.variants?.[0]?.calculated_price?.calculated_amount 
        ? product.variants[0].calculated_price.calculated_amount 
        : 0,
      subscription_enabled: product.metadata?.subscription_enabled === true,
      handle: product.handle || '',
      thumbnail: product.thumbnail || '',
      sku: product.variants?.[0]?.sku || ''
    }))

    const limit = searchParams.limit || 20
    const totalPages = Math.ceil(response.count / limit)

    return {
      query: searchParams.q || "",
      hits,
      total: response.count,
      page: searchParams.page || 0,
      pages: totalPages,
      facets: {
        brand: {},
        categories: {}
      },
      processingTimeMS: processingTime
    }
  } catch (error) {
    console.error("Search API error:", error)
    
    // Return empty results on error
    return {
      query: searchParams.q || "",
      hits: [],
      total: 0,
      page: searchParams.page || 0,
      pages: 0,
      facets: {
        brand: {},
        categories: {}
      },
      processingTimeMS: 0
    }
  }
}

export const getSearchSuggestions = async (
  query: string,
  limit: number = 5
): Promise<SearchResponse> => {
  if (!query || query.length < 2) {
    return {
      query: "",
      hits: [],
      total: 0,
      page: 0,
      pages: 0,
      facets: { brand: {}, categories: {} },
      processingTimeMS: 0
    }
  }

  return searchProducts({
    q: query,
    limit,
    page: 0
  })
} 