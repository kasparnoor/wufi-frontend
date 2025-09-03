/**
 * Secure error handling utilities
 */

// Known safe error messages that can be shown to users
const SAFE_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Võrguühenduse viga. Palun kontrollige internetiühendust ja proovige uuesti.',
  TIMEOUT_ERROR: 'Serveriga ühenduse loomine aegus. Palun proovige uuesti.',
  VALIDATION_ERROR: 'Sisestatud andmed on vigased. Palun kontrollige ja proovige uuesti.',
  AUTHENTICATION_ERROR: 'Autentimise viga. Palun logige uuesti sisse.',
  AUTHORIZATION_ERROR: 'Teil pole õigust selle toimingu teostamiseks.',
  RATE_LIMIT_ERROR: 'Liiga palju päringuid. Palun oodake enne uuesti proovimist.',
  PAYMENT_ERROR: 'Makse ebaõnnestus. Palun proovige uuesti või kasutage teist makseviisi.',
  CART_ERROR: 'Ostukorvi viga. Palun värskendage lehte ja proovige uuesti.',
  GENERIC_ERROR: 'Midagi läks valesti. Palun proovige uuesti.',
} as const

// Patterns to identify error types
const ERROR_PATTERNS = {
  NETWORK: /network|fetch|connection|cors/i,
  TIMEOUT: /timeout|timed out|aborted/i,
  VALIDATION: /validation|invalid|required|format/i,
  AUTHENTICATION: /unauthorized|auth|login|token/i,
  AUTHORIZATION: /forbidden|permission|access denied/i,
  RATE_LIMIT: /rate limit|too many requests|throttle/i,
  PAYMENT: /payment|stripe|card|charge/i,
  CART: /cart|item|quantity|line/i,
} as const

/**
 * Sanitize error message for display to users
 * @param error - The error object or message
 * @param fallback - Fallback message if error cannot be categorized
 * @returns Safe error message for user display
 */
export const sanitizeErrorMessage = (
  error: unknown, 
  fallback: string = SAFE_ERROR_MESSAGES.GENERIC_ERROR
): string => {
  let errorMessage = ''
  
  // Extract error message
  if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message)
  } else {
    return fallback
  }
  
  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    // Check for common error patterns and return safe messages
    if (ERROR_PATTERNS.NETWORK.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.NETWORK_ERROR
    }
    if (ERROR_PATTERNS.TIMEOUT.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.TIMEOUT_ERROR
    }
    if (ERROR_PATTERNS.VALIDATION.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.VALIDATION_ERROR
    }
    if (ERROR_PATTERNS.AUTHENTICATION.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.AUTHENTICATION_ERROR
    }
    if (ERROR_PATTERNS.AUTHORIZATION.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.AUTHORIZATION_ERROR
    }
    if (ERROR_PATTERNS.RATE_LIMIT.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.RATE_LIMIT_ERROR
    }
    if (ERROR_PATTERNS.PAYMENT.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.PAYMENT_ERROR
    }
    if (ERROR_PATTERNS.CART.test(errorMessage)) {
      return SAFE_ERROR_MESSAGES.CART_ERROR
    }
    
    // Return fallback for unrecognized errors
    return fallback
  }
  
  // In development, show the actual error message but sanitized
  return sanitizeString(errorMessage)
}

/**
 * Basic string sanitization to remove potential XSS vectors
 */
const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .slice(0, 500) // Limit length
    .trim()
}

/**
 * Log error securely (removes sensitive information)
 * @param error - The error to log
 * @param context - Additional context for debugging
 */
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(context ? `${context}:` : 'Error:', error)
  } else {
    // In production, log only sanitized error information
    const sanitizedMessage = sanitizeErrorMessage(error)
    console.error(context ? `${context}: ${sanitizedMessage}` : sanitizedMessage)
  }
}

/**
 * Create a user-friendly error handler function
 * @param setError - Function to set error state
 * @param fallbackMessage - Optional fallback message
 * @returns Error handler function
 */
export const createErrorHandler = (
  setError: (message: string) => void,
  fallbackMessage?: string
) => {
  return (error: unknown, context?: string) => {
    logError(error, context)
    const userMessage = sanitizeErrorMessage(error, fallbackMessage)
    setError(userMessage)
  }
}

/**
 * Wrap async functions with error handling
 * @param fn - Async function to wrap
 * @param errorHandler - Error handler function
 * @returns Wrapped function with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler: (error: unknown) => void
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler(error)
      throw error // Re-throw for caller to handle if needed
    }
  }) as T
}

/**
 * Check if an error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return ERROR_PATTERNS.NETWORK.test(message)
}

/**
 * Check if an error is a timeout error
 */
export const isTimeoutError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return ERROR_PATTERNS.TIMEOUT.test(message)
}

/**
 * Check if an error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return ERROR_PATTERNS.VALIDATION.test(message)
} 