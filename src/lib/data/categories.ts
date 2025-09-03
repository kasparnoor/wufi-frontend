"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  try {
    // Add timeout for build-time API calls
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // Increased to 15 second timeout

    const result = await sdk.client
      .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
        "/store/product-categories",
        {
          query: {
            fields: query?.fields || "*category_children, *parent_category",
            limit,
            ...query,
          },
          next,
          cache: "force-cache",
          signal: controller.signal,
        }
      )
    
    clearTimeout(timeoutId)
    return result.product_categories
  } catch (e) {
    console.error("Error fetching categories:", e)
    
    // Fallback for build time - return empty array to prevent build failure
    if (process.env.NODE_ENV !== 'production') {
      console.log("Falling back to empty categories for build")
      return []
    }
    
    throw e
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  try {
    // Add timeout for API calls
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // Increased to 15 second timeout

    const result = await sdk.client
      .fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children, *parent_category",
            handle,
          },
          next,
          cache: "force-cache",
          signal: controller.signal,
        }
      )
    
    clearTimeout(timeoutId)
    return result.product_categories[0]
  } catch (e) {
    console.error(`Error fetching category with handle "${handle}":`, e)
    
    // Return null instead of throwing to let the page handle it gracefully
    return null
  }
}
