/**
 * Hydration debugging utilities
 */

export const debugHydration = {
  /**
   * Log differences between server and client state
   */
  logStateDiff: (component: string, serverState: any, clientState: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 Hydration Debug: ${component}`)
      console.log('Server State:', serverState)
      console.log('Client State:', clientState)
      console.log('Differences:', {
        server: serverState,
        client: clientState,
        areEqual: JSON.stringify(serverState) === JSON.stringify(clientState)
      })
      console.groupEnd()
    }
  },

  /**
   * Check if we're running on the client
   */
  isClient: () => typeof window !== 'undefined',

  /**
   * Safe wrapper for client-only operations
   */
  clientOnly: <T>(clientValue: T, serverValue?: T): T | undefined => {
    return typeof window !== 'undefined' ? clientValue : serverValue
  },

  /**
   * Create a stable ID that's consistent between server and client
   */
  createStableId: (prefix: string = 'stable'): string => {
    // Use a predictable ID that's the same on server and client
    return `${prefix}-${Date.now()}`
  }
}

/**
 * Hook to prevent hydration mismatches with dynamic content
 */
export const useHydrationSafe = <T>(
  serverValue: T, 
  clientValue: T, 
  componentName?: string
): T => {
  if (process.env.NODE_ENV === 'development' && componentName) {
    debugHydration.logStateDiff(componentName, serverValue, clientValue)
  }
  
  return debugHydration.isClient() ? clientValue : serverValue
} 