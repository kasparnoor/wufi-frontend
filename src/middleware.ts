import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
// Set a fallback region that actually exists in your Medusa database
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"

// For debugging region issues
console.log("Default region:", DEFAULT_REGION)

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
    
    // Log available regions for debugging
    console.log("Available regions:", Array.from(regionMap.keys()))
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlPathParts = request.nextUrl.pathname.split("/")
    const urlCountryCode = urlPathParts[1]?.toLowerCase()
    
    // Check if the URL has a language format like dk/en
    const hasLanguageFormat = urlPathParts.length > 2 && 
      urlPathParts[1]?.length === 2 && 
      urlPathParts[2]?.length === 2

    // Get a valid region that exists in the database
    const validCountryCode = getValidCountryCode(regionMap)
    
    // If URL has language format, use the first part as countryCode if valid
    if (hasLanguageFormat) {
      if (regionMap.has(urlPathParts[1])) {
        countryCode = urlPathParts[1]
      } else {
        countryCode = validCountryCode
      }
    } else if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else {
      countryCode = validCountryCode
    }
    
    // Debug country code resolution
    console.log("Resolved country code:", countryCode, "from:", {
      urlCountryCode,
      vercelCountryCode,
      DEFAULT_REGION,
      hasAvailableRegions: regionMap.size > 0,
      validCountryCode
    })

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
    
    // Return a known valid country code on error
    return "gb"
  }
}

/**
 * Get a valid country code that exists in the region map
 */
function getValidCountryCode(regionMap: Map<string, HttpTypes.StoreRegion | number>) {
  // Try to use DEFAULT_REGION if it exists in the map
  if (regionMap.has(DEFAULT_REGION)) {
    return DEFAULT_REGION
  }
  
  // Fallback to 'gb' (UK) if available
  if (regionMap.has("gb")) {
    return "gb"
  }
  
  // Last resort: use the first available region
  return Array.from(regionMap.keys())[0] || "gb"
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  // Prevent infinite redirects - if we've redirected too many times, just proceed
  const redirectCount = parseInt(request.headers.get("x-redirect-count") || "0")
  if (redirectCount > 1) {
    console.log("Too many redirects, proceeding without redirect")
    return NextResponse.next()
  }
  
  // Initialize basic response
  const response = NextResponse.next()
  
  let redirectUrl = request.nextUrl.href
  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  try {
    const regionMap = await getRegionMap(cacheId)
    
    // Get a valid country code that exists in our database
    const validCountryCode = getValidCountryCode(regionMap)
    
    // Check if the URL path starts with valid country code
    const urlPathParts = request.nextUrl.pathname.split("/")
    const currentUrlCountryCode = urlPathParts[1]?.toLowerCase()
    
    // If we're already at the root, redirect to the valid country code
    if (request.nextUrl.pathname === "/") {
      redirectUrl = `${request.nextUrl.origin}/${validCountryCode}`
      console.log("Redirecting to:", redirectUrl)
      const redirectResponse = NextResponse.redirect(redirectUrl, 307)
      
      // Track redirect count to prevent loops
      redirectResponse.headers.set("x-redirect-count", (redirectCount + 1).toString())
      
      redirectResponse.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
      return redirectResponse
    }
    
    // If current URL country code is invalid but not empty, redirect to valid one
    if (currentUrlCountryCode && !regionMap.has(currentUrlCountryCode)) {
      // Replace invalid country code with valid one
      const newPath = request.nextUrl.pathname.replace(
        `/${currentUrlCountryCode}`, 
        `/${validCountryCode}`
      )
      redirectUrl = `${request.nextUrl.origin}${newPath}${request.nextUrl.search}`
      console.log("Redirecting invalid country code to:", redirectUrl)
      
      const redirectResponse = NextResponse.redirect(redirectUrl, 307)
      redirectResponse.headers.set("x-redirect-count", (redirectCount + 1).toString())
      redirectResponse.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
      return redirectResponse
    }
    
    // Set cache ID cookie if needed
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    
    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, don't redirect and just proceed
    return response
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
