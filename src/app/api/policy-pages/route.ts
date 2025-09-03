import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Forward all query parameters to the backend
    const backendUrl = `${MEDUSA_BACKEND_URL}/store/policy-pages?${searchParams.toString()}`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      },
      // Add caching
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    })

    if (!response.ok) {
      console.warn(`Policy pages backend returned ${response.status}`)
      // Return empty array instead of error for graceful fallback
      return NextResponse.json({ policy_pages: [] }, { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching policy pages:', error)
    // Return empty array instead of error for graceful fallback
    return NextResponse.json({ policy_pages: [] }, { status: 200 })
  }
} 