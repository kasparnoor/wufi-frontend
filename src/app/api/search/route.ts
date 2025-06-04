import { NextRequest, NextResponse } from "next/server"
import { searchProducts } from "../../../lib/data/search"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      q: searchParams.get("q") || undefined,
      brand: searchParams.get("brand") || undefined,
      categories: searchParams.get("categories") || undefined,
      subscription_enabled: searchParams.get("subscription_enabled") === "true" ? true : 
                           searchParams.get("subscription_enabled") === "false" ? false : undefined,
      min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
      max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      sort: searchParams.get("sort") || undefined,
    }

    const results = await searchProducts(params)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error("Search API route error:", error)
    
    return NextResponse.json(
      { 
        error: "Search failed",
        query: "",
        hits: [],
        total: 0,
        page: 0,
        pages: 0,
        facets: { brand: {}, categories: {} },
        processingTimeMS: 0
      },
      { status: 500 }
    )
  }
} 