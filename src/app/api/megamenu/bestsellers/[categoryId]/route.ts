import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params
    
    // TODO: Replace with Algolia API call for better performance and analytics
    // For now, using Medusa to get best-selling products in category
    
    const { products } = await sdk.client.fetch<{ 
      products: HttpTypes.StoreProduct[] 
    }>(`/store/products`, {
      query: {
        category_id: [categoryId],
        limit: 6,
        order: "-sales_count", // Order by sales count descending
        fields: "*variants.calculated_price,+metadata"
      }
    })

    // Transform products to bestseller format
    const bestSellers = products.map(product => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      price: product.variants?.[0]?.calculated_price?.calculated_amount || 0,
      categoryId
    }))

    return NextResponse.json(bestSellers)
    
  } catch (error) {
    console.error('Error fetching bestsellers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bestsellers' }, 
      { status: 500 }
    )
  }
}

// Alternative Algolia implementation (uncomment when ready):
/*
import algoliasearch from 'algoliasearch'

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params
    const index = client.initIndex('products')
    
    const { hits } = await index.search('', {
      filters: `category_id:${categoryId}`,
      hitsPerPage: 6,
      attributesToRetrieve: ['objectID', 'title', 'handle', 'thumbnail', 'price'],
      analytics: true,
      clickAnalytics: true
    })

    const bestSellers = hits.map(hit => ({
      id: hit.objectID,
      title: hit.title,
      handle: hit.handle,
      thumbnail: hit.thumbnail,
      price: hit.price,
      categoryId
    }))

    return NextResponse.json(bestSellers)
    
  } catch (error) {
    console.error('Error fetching bestsellers from Algolia:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bestsellers' }, 
      { status: 500 }
    )
  }
}
*/ 