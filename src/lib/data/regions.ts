"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  try {
    // Add timeout for build-time API calls
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // Increased to 15 second timeout

    const result = await sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        next,
        cache: "force-cache",
        signal: controller.signal,
      })
    
    clearTimeout(timeoutId)
    console.log("Fetched regions:", JSON.stringify(result.regions, null, 2))
    return result.regions
  } catch (e) {
    console.error("Error fetching regions:", e)
    
    // Fallback for build time - return a default region structure
    if (process.env.NODE_ENV !== 'production') {
      console.log("Falling back to default regions for build")
      return [{
        id: 'reg_default',
        name: 'Estonia', 
        currency_code: 'eur',
        countries: [{
          iso_2: 'ee',
          iso_3: 'est',
          name: 'ESTONIA',
          display_name: 'Estonia'
        }]
      }] as HttpTypes.StoreRegion[]
    }
    
    throw e
  }
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode.toLowerCase())) {
      return regionMap.get(countryCode.toLowerCase())
    }

    const regions = await listRegions()
    console.log("Regions in getRegion:", JSON.stringify(regions, null, 2))

    if (!regions) {
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2?.toLowerCase() ?? "", region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode.toLowerCase())
      : regionMap.get("us")

    if (!region) {
      console.warn(`No region found for countryCode: ${countryCode}`)
    }

    return region
  } catch (e: any) {
    console.error("Error in getRegion:", e)
    return null
  }
}
