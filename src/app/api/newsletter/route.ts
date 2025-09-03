import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recaptchaToken, ...restBody } = body.metadata ? { recaptchaToken: body.metadata.recaptchaToken, ...body } : body;

    if (!RECAPTCHA_SECRET_KEY) {
      console.error("RECAPTCHA_SECRET_KEY is not set.")
      return NextResponse.json(
        { error: "Server configuration error: reCAPTCHA secret key missing." },
        { status: 500 }
      )
    }

    // Verify reCAPTCHA token
    const recaptchaVerifyResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      {
        method: 'POST',
      }
    )
    const recaptchaData = await recaptchaVerifyResponse.json()

    if (!recaptchaData.success || recaptchaData.score < 0.5) { // Adjust score threshold as needed
      console.warn('reCAPTCHA verification failed:', recaptchaData)
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      )
    }
    
    // Forward the newsletter subscription to your Medusa backend
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      },
      body: JSON.stringify({ ...restBody, metadata: { ...restBody.metadata, recaptchaToken: undefined } }), // Remove recaptchaToken from metadata before forwarding
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          error: errorData.message || "Failed to subscribe to newsletter",
          details: errorData.details || []
        },
        { status: response.status }
      )
    }

    // Handle both JSON responses and empty responses (204)
    let result
    try {
      result = await response.json()
    } catch {
      // If response is empty (204), create a success response
      result = {
        success: true,
        message: "Successfully subscribed to newsletter!"
      }
    }

    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { 
        error: "Network error. Please check your connection and try again.",
        message: "Failed to subscribe to newsletter" 
      },
      { status: 500 }
    )
  }
}  