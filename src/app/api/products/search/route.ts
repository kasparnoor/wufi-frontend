import { NextRequest, NextResponse } from "next/server"
import { searchProductsEnhanced } from "../../../../lib/data/search-enhanced"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const results = await searchProductsEnhanced(body)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Enhanced search API error:", error)
    return NextResponse.json(
      { 
        error: "Search failed",
        query: "",
        hits: [],
        total: 0,
        page: 0,
        pages: 0,
        facets: { brands: {}, categories: {}, price_ranges: {}, features: {} },
        processingTimeMS: 0
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Convert GET params to POST body format
    const searchRequest = {
      q: searchParams.get("q") || undefined,
      filters: {
        brands: searchParams.get("brands")?.split(',') || undefined,
        categories: searchParams.get("categories")?.split(',') || undefined,
        features: searchParams.get("features")?.split(',') || undefined,
        price_range: {
          min: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
          max: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
        },
        min_rating: searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : undefined,
      },
      sort: searchParams.get("sort") || "newest",
      pagination: {
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      }
    }

    const results = await searchProductsEnhanced(searchRequest)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Enhanced search API error:", error)
    return NextResponse.json(
      { 
        error: "Search failed",
        query: "",
        hits: [],
        total: 0,
        page: 0,
        pages: 0,
        facets: { brands: {}, categories: {}, price_ranges: {}, features: {} },
        processingTimeMS: 0
      },
      { status: 500 }
    )
  }
} 