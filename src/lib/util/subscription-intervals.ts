export interface SubscriptionInterval {
  value: string
  label: string
}

// Toggle test intervals via env (client-visible)
const ENABLE_TEST_INTERVALS = process.env.NEXT_PUBLIC_ENABLE_TEST_INTERVALS === 'true'

// Base mapping of standardized interval codes with Estonian labels
const BASE_INTERVALS: SubscriptionInterval[] = [
  { value: "daily", label: "Iga päev" },
  { value: "3d", label: "Iga 3 päeva tagant" },
  { value: "weekly", label: "Iga nädal" },
  { value: "2w", label: "Iga 2 nädala tagant" },
  { value: "3w", label: "Iga 3 nädala tagant" },
  { value: "4w", label: "Iga 4 nädala tagant" },
  { value: "monthly", label: "Iga kuu" },
  { value: "6w", label: "Iga 6 nädala tagant" },
  { value: "2m", label: "Iga 2 kuu tagant" },
  { value: "3m", label: "Iga 3 kuud (kvartaalselt)" },
  { value: "4m", label: "Iga 4 kuu tagant" },
  { value: "6m", label: "Iga 6 kuud (poolaastas)" },
  { value: "yearly", label: "Iga aasta" },
]

// Test-only intervals (appear only when enabled)
const TEST_INTERVALS: SubscriptionInterval[] = [
  { value: "2min", label: "Iga 2 minuti tagant (TEST)" },
]

// Export final list with optional test intervals
export const SUBSCRIPTION_INTERVALS: SubscriptionInterval[] = ENABLE_TEST_INTERVALS
  ? [...TEST_INTERVALS, ...BASE_INTERVALS]
  : BASE_INTERVALS

// Helper function to get label for a specific interval code
export const getIntervalLabel = (intervalCode: string): string => {
  const interval = SUBSCRIPTION_INTERVALS.find(i => i.value === intervalCode)
  return interval?.label || intervalCode
}

// Helper function to filter available intervals based on product data
export const getAvailableIntervals = (productIntervals?: string[]): SubscriptionInterval[] => {
  if (!productIntervals || productIntervals.length === 0) {
    // Use full set (with test intervals if enabled) when none specified
    return SUBSCRIPTION_INTERVALS
  }
  
  const filtered = SUBSCRIPTION_INTERVALS.filter(interval => 
    productIntervals.includes(interval.value)
  )

  // When testing is enabled, force-inject 2min even if product restricts intervals
  if (ENABLE_TEST_INTERVALS) {
    const hasTwoMin = filtered.some((i) => i.value === '2min')
    if (!hasTwoMin) {
      const twoMin = SUBSCRIPTION_INTERVALS.find((i) => i.value === '2min')
      if (twoMin) {
        // Prepend to emphasize test option
        return [twoMin, ...filtered]
      }
    }
  }

  return filtered
}

// Helper function to get the default/recommended interval for a product
export const getDefaultInterval = (productMetadata?: Record<string, any>): string => {
  // First check if there's a default_interval set in product metadata
  if (productMetadata?.default_interval) {
    return productMetadata.default_interval as string
  }
  
  // Then get available intervals and use the first one
  const availableIntervals = getAvailableIntervals(productMetadata?.available_intervals as string[] | undefined)
  
  if (availableIntervals.length > 0) {
    return availableIntervals[0].value
  }
  
  // Final fallback
  return "2w"
}

// Helper function to check if an interval is the recommended/default one
export const isRecommendedInterval = (interval: string, productMetadata?: Record<string, any>): boolean => {
  const defaultInterval = getDefaultInterval(productMetadata)
  return interval === defaultInterval
}

// Helper function to convert interval code to human-readable Estonian text for display
export const convertIntervalToText = (interval?: string): string => {
  if (!interval) return '—'
  
  const intervalMapping = SUBSCRIPTION_INTERVALS.find(i => i.value === interval)
  if (intervalMapping) {
    return intervalMapping.label.toLowerCase()
  }
  
  // Fallback for legacy interval codes like "2w", "3m" etc.
  const match = interval.match(/(\d+)(\w+)/)
  if (match) {
    const [, value, unit] = match
    const unitMapping: Record<string, string> = { 
      w: 'nädala', 
      m: 'kuu', 
      d: 'päeva' 
    }
    const unitText = unitMapping[unit] || unit
    return `iga ${value} ${unitText} tagant`
  }
  
  return interval
} 