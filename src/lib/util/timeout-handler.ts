export interface TimeoutConfig {
  timeout?: number
  retries?: number
  backoffMultiplier?: number
  maxBackoff?: number
  onTimeout?: (attempt: number) => void
  onRetry?: (attempt: number, error: Error) => void
}

export interface TimeoutError extends Error {
  name: 'TimeoutError'
  isTimeout: true
  attempt: number
  totalAttempts: number
}

export class TimeoutHandler {
  private static createTimeoutError(attempt: number, totalAttempts: number): TimeoutError {
    const error = new Error(`Request timed out after ${attempt} attempts`) as TimeoutError
    error.name = 'TimeoutError'
    error.isTimeout = true
    error.attempt = attempt
    error.totalAttempts = totalAttempts
    return error
  }

  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private static calculateBackoff(attempt: number, backoffMultiplier: number, maxBackoff: number): number {
    return Math.min(1000 * Math.pow(backoffMultiplier, attempt - 1), maxBackoff)
  }

  /**
   * Wraps a promise with timeout and retry logic
   */
  static async withTimeout<T>(
    promiseFactory: (signal: AbortSignal) => Promise<T>,
    config: TimeoutConfig = {}
  ): Promise<T> {
    const {
      timeout = 15000, // 15 seconds default
      retries = 3,
      backoffMultiplier = 2,
      maxBackoff = 10000,
      onTimeout,
      onRetry
    } = config

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
        }, timeout)

        const promise = promiseFactory(controller.signal)
        
        // Race between the promise and timeout
        const result = await Promise.race([
          promise,
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(this.createTimeoutError(attempt, retries))
            }, timeout)
          })
        ])

        clearTimeout(timeoutId)
        return result

      } catch (error) {
        lastError = error as Error
        
        // Check if it's a timeout error
        if (error instanceof Error && 
            (error.name === 'AbortError' || 
             error.message?.toLowerCase().includes('timeout') ||
             (error as any).isTimeout)) {
          // Only warn on the final failed attempt; use debug for intermediate retries
          if (attempt === retries) {
            console.warn(`Timeout error on final attempt ${attempt}/${retries}:`, error.message)
            onTimeout?.(attempt)
            throw this.createTimeoutError(attempt, retries)
          } else {
            console.debug(`Timeout on attempt ${attempt}/${retries}:`, error.message)
            onTimeout?.(attempt)
            const backoffDelay = this.calculateBackoff(attempt, backoffMultiplier, maxBackoff)
            console.debug(`Retrying in ${backoffDelay}ms...`)
            onRetry?.(attempt, error)
            await this.delay(backoffDelay)
            continue
          }
        }
        
        // For non-timeout errors, throw immediately
        throw error
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Unknown error occurred')
  }

  /**
   * Wraps a promise with simple timeout (no retries)
   */
  static async withSimpleTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 15000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(TimeoutHandler.createTimeoutError(1, 1))
      }, timeoutMs)

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId))
    })
  }

  /**
   * Creates a promise that rejects after a specified timeout
   */
  static createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(TimeoutHandler.createTimeoutError(1, 1))
      }, ms)
    })
  }

  /**
   * Checks if an error is a timeout error
   */
  static isTimeoutError(error: unknown): error is TimeoutError {
    return error instanceof Error && 
           (error.name === 'TimeoutError' || 
            error.name === 'AbortError' || 
            error.message?.toLowerCase().includes('timeout') ||
            (error as any).isTimeout === true)
  }

  /**
   * Wraps API calls with standardized timeout handling for checkout
   */
  static async checkoutApiCall<T>(
    apiCall: (signal: AbortSignal) => Promise<T>,
    operation: string,
    config?: TimeoutConfig
  ): Promise<T> {
    const defaultConfig: TimeoutConfig = {
      // Relax timeouts for heavy checkout ops under load
      timeout: 30000,
      retries: 2,
      backoffMultiplier: 2,
      maxBackoff: 15000,
      onTimeout: (attempt) => {
        console.warn(`${operation} timed out on attempt ${attempt}`)
      },
      onRetry: (attempt, error) => {
        console.log(`Retrying ${operation} (attempt ${attempt}) after error:`, error.message)
      }
    }

    try {
      return await this.withTimeout(apiCall, { ...defaultConfig, ...config })
    } catch (error) {
      if (this.isTimeoutError(error)) {
        console.error(`${operation} failed after ${error.totalAttempts} attempts due to timeout`)
        throw new Error(`${operation} timed out. Please check your connection and try again.`)
      }
      throw error
    }
  }
}

// Utility functions for common checkout operations
export const checkoutTimeouts = {
  /**
   * Standard timeout for cart operations
   */
  cartOperation: <T>(operation: (signal: AbortSignal) => Promise<T>, operationName: string) => 
    TimeoutHandler.checkoutApiCall(operation, operationName, { timeout: 30000, retries: 1 }),

  /**
   * Longer timeout for payment operations - increased to accommodate authorization waits
   */
  paymentOperation: <T>(operation: (signal: AbortSignal) => Promise<T>, operationName: string) => 
    TimeoutHandler.checkoutApiCall(operation, operationName, { timeout: 60000, retries: 1 }),

  /**
   * Quick timeout for validation operations
   */
  validationOperation: <T>(operation: (signal: AbortSignal) => Promise<T>, operationName: string) => 
    TimeoutHandler.checkoutApiCall(operation, operationName, { timeout: 12000, retries: 1 })
} 