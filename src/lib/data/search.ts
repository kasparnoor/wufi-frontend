"use server"

import { sdk } from "@lib/config"
import { SearchParams, SearchResponse } from "../../types/search"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export const searchProducts = async (
  searchParams: SearchParams
): Promise<SearchResponse> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const cacheOptions = await getCacheOptions("search")

  // Build query parameters
  const query: Record<string, any> = {}
  
  if (searchParams.q) query.q = searchParams.q
  if (searchParams.brand) query.brand = searchParams.brand
  if (searchParams.categories) query.categories = searchParams.categories
  if (searchParams.subscription_enabled !== undefined) {
    query.subscription_enabled = searchParams.subscription_enabled
  }
  if (searchParams.min_price !== undefined) query.min_price = searchParams.min_price
  if (searchParams.max_price !== undefined) query.max_price = searchParams.max_price
  if (searchParams.page !== undefined) query.page = searchParams.page
  if (searchParams.limit !== undefined) query.limit = searchParams.limit
  if (searchParams.sort) query.sort = searchParams.sort

  try {
    const response = await sdk.client.fetch<SearchResponse>(
      "/store/search",
      {
        method: "GET",
        query,
        headers,
        next: cacheOptions,
        cache: "no-store", // Don't cache search results by default
      }
    )

    return response
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