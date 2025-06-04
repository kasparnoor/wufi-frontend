import { NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export async function GET() {
  try {
    const { regions } = await sdk.client.fetch<{ 
      regions: HttpTypes.StoreRegion[] 
    }>("/store/regions", {
      method: "GET",
      cache: "force-cache"
    })

    return NextResponse.json(regions)
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch regions' }, 
      { status: 500 }
    )
  }
} 