import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    
    const backendUrl = `${MEDUSA_BACKEND_URL}/store/policy-pages/${slug}`
    
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

    if (response.status === 404) {
      return NextResponse.json({ error: 'Policy page not found' }, { status: 404 })
    }

    if (!response.ok) {
      console.warn(`Policy page backend returned ${response.status} for slug: ${slug}`)
      return NextResponse.json({ error: 'Policy page not found' }, { status: 404 })
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching policy page:', error)
    return NextResponse.json({ error: 'Policy page not found' }, { status: 404 })
  }
} 