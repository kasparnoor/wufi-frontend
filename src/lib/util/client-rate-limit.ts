/**
 * Client-side rate limiting utility
 * Note: This is supplementary to server-side rate limiting and can be bypassed
 * by malicious actors. Always implement proper server-side rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface IRateLimiter {
  isAllowed(key: string, limit: number, windowMs: number): boolean
  getRemaining(key: string, limit: number): number
  getResetTime(key: string): number
  destroy(): void
}

class ClientRateLimit implements IRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private cleanup: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanup = setInterval(() => {
      this.cleanupExpired()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if an operation is allowed under rate limit
   * @param key - Unique key for the operation (e.g., 'cart-update', 'payment-attempt')
   * @param limit - Maximum number of operations allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if operation is allowed, false otherwise
   */
  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const resetTime = now + windowMs
    
    let entry = this.limits.get(key)
    
    // If no entry or expired, create new one
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime }
      this.limits.set(key, entry)
    }
    
    // Check if limit exceeded
    if (entry.count >= limit) {
      return false
    }
    
    // Increment counter
    entry.count++
    return true
  }

  /**
   * Get remaining attempts for a key
   */
  getRemaining(key: string, limit: number): number {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return limit
    }
    return Math.max(0, limit - entry.count)
  }

  /**
   * Get time until reset for a key
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return 0
    }
    return entry.resetTime - Date.now()
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now()
    Array.from(this.limits.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    })
  }

  /**
   * Destroy the rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanup) {
      clearInterval(this.cleanup)
      this.cleanup = null
    }
    this.limits.clear()
  }
}

// Global instance
let globalRateLimiter: ClientRateLimit | null = null

/**
 * Get the global rate limiter instance
 */
export const getRateLimiter = (): IRateLimiter => {
  if (typeof window === 'undefined') {
    // Server-side: return a mock that always allows
    return {
      isAllowed: () => true,
      getRemaining: (_, limit) => limit,
      getResetTime: () => 0,
      destroy: () => {},
    }
  }

  if (!globalRateLimiter) {
    globalRateLimiter = new ClientRateLimit()
  }
  
  return globalRateLimiter
}

/**
 * Convenience function for common rate limiting patterns
 */
export const rateLimitedAction = async <T>(
  key: string,
  action: () => Promise<T>,
  options: {
    limit: number
    windowMs: number
    errorMessage?: string
  }
): Promise<T> => {
  const rateLimiter = getRateLimiter()
  
  if (!rateLimiter.isAllowed(key, options.limit, options.windowMs)) {
    const resetTime = rateLimiter.getResetTime(key)
    const resetInSeconds = Math.ceil(resetTime / 1000)
    const message = options.errorMessage || 
      `Liiga palju päringuid. Proovige uuesti ${resetInSeconds} sekundi pärast.`
    
    throw new Error(message)
  }
  
  return action()
}

// Pre-defined rate limit configurations
export const RATE_LIMITS = {
  CART_UPDATE: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
  PAYMENT_ATTEMPT: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute (increased from 3)
  SEARCH: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute
  FORM_SUBMIT: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  ADDRESS_UPDATE: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
} as const 