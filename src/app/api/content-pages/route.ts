import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Forward all query parameters to backend
    const backendUrl = `${MEDUSA_BACKEND_URL}/store/content-pages?${searchParams.toString()}`
    
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
      console.warn(`Content pages backend returned ${response.status}`)
      return NextResponse.json({ 
        content_pages: [], 
        count: 0, 
        offset: 0, 
        limit: 0 
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching content pages:', error)
    return NextResponse.json({ 
      content_pages: [], 
      count: 0, 
      offset: 0, 
      limit: 0 
    })
  }
} 