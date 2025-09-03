"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { TimeoutHandler } from "@lib/util/timeout-handler"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam === 1) ? 0 : (_pageParam - 1) * limit;

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

/**
 * Retrieve a single product by its handle
 * More efficient than listing all products and filtering
 */
export const retrieveProductByHandle = async ({
  handle,
  countryCode,
  regionId,
}: {
  handle: string
  countryCode?: string
  regionId?: string
}): Promise<HttpTypes.StoreProduct | null> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  if (!handle || handle.trim() === '') {
    console.warn("retrieveProductByHandle: Empty or invalid handle provided")
    return null
  }

  let region: HttpTypes.StoreRegion | undefined | null

  try {
    if (countryCode) {
      region = await getRegion(countryCode)
    } else {
      region = await retrieveRegion(regionId!)
    }

    if (!region) {
      console.warn(`retrieveProductByHandle: Region not found for ${countryCode || regionId}`)
      return null
    }
  } catch (error) {
    console.error(`retrieveProductByHandle: Error getting region:`, error)
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
    // Use the new timeout handler for consistent error handling
    const result = await TimeoutHandler.withTimeout(
      () => sdk.client
        .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
          method: "GET",
          query: {
            handle: handle.trim(),
            region_id: region.id,
            // Include categories so product page can render category chips
            fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,categories.*",
            limit: 1, // We only need one product
          },
          headers,
          next,
          cache: "force-cache",
        }),
      {
        timeout: 15000,
        retries: 2,
        onTimeout: (attempt: number) => {
          console.warn(`retrieveProductByHandle: Request timeout for handle "${handle}" (attempt ${attempt})`)
        }
      }
    )
    
    const product = result.products?.[0] || null
    
    if (!product) {
      console.warn(`retrieveProductByHandle: Product not found for handle "${handle}"`)
    }
    
    return product
  } catch (error) {
    if (TimeoutHandler.isTimeoutError(error)) {
      console.error(`retrieveProductByHandle: Request timed out for handle "${handle}"`)
      // Don't throw timeout errors in production to prevent breaking the user experience
      if (process.env.NODE_ENV === 'production') {
        console.warn('Timeout error suppressed in production for better UX')
        return null
      }
    } else {
      console.error(`retrieveProductByHandle: Error fetching product with handle "${handle}":`, error)
    }
    return null
  }
}

