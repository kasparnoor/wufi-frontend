// Get backend URL from environment or default
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export interface NewsletterSubscriptionRequest {
  email_address: string
  metadata?: {
    name?: string
    source: "homepage" | "footer" | "checkout"
  }
  tags?: string[]
}

export interface NewsletterSubscriptionResponse {
  success: boolean
  message: string
  subscriber?: {
    id: string
    email_address: string
    type: string
  }
}

export interface NewsletterError {
  error: string
  message: string
  details?: string[]
}

/**
 * Subscribe to newsletter using the store API endpoint
 */
export async function subscribeToNewsletter(
  data: NewsletterSubscriptionRequest
): Promise<NewsletterSubscriptionResponse> {
  try {
    // Use the Next.js API route to avoid CORS issues
    const response = await fetch(`/api/newsletter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Handle different error statuses
      if (response.status === 400) {
        const errorData: NewsletterError = await response.json()
        throw new Error(errorData.message || "Invalid email address")
      }
      
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.")
      }

      throw new Error("Failed to subscribe to newsletter. Please try again.")
    }

    const result: NewsletterSubscriptionResponse = await response.json()
    return result
  } catch (error) {
    // Network or other errors
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error. Please check your connection and try again.")
  }
} 