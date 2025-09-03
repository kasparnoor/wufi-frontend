import { NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export async function GET() {
  try {
    const { product_categories } = await sdk.client.fetch<{ 
      product_categories: HttpTypes.StoreProductCategory[] 
    }>("/store/product-categories", {
      query: {
        fields: "*category_children, *parent_category, *parent_category.parent_category",
        limit: 100
      },
      cache: "force-cache"
    })

    return NextResponse.json(product_categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' }, 
      { status: 500 }
    )
  }
} 