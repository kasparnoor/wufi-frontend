// Simple in-memory rate limiter
// In production, use Redis or similar for distributed rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export function rateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60 * 1000 // 1 minute
): RateLimitResult {
  const now = Date.now()
  const key = `rate_limit:${identifier}`
  
  let entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitStore.set(key, entry)
  }
  
  entry.count++
  
  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit
  
  return {
    success,
    limit,
    remaining,
    reset: entry.resetTime
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
} 