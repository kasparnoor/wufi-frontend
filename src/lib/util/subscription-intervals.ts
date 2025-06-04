export interface SubscriptionInterval {
  value: string
  label: string
}

// Complete mapping of all standardized interval codes with Estonian labels
export const SUBSCRIPTION_INTERVALS: SubscriptionInterval[] = [
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

// Helper function to get label for a specific interval code
export const getIntervalLabel = (intervalCode: string): string => {
  const interval = SUBSCRIPTION_INTERVALS.find(i => i.value === intervalCode)
  return interval?.label || intervalCode
}

// Helper function to filter available intervals based on product data
export const getAvailableIntervals = (productIntervals?: string[]): SubscriptionInterval[] => {
  if (!productIntervals || productIntervals.length === 0) {
    // Return comprehensive default intervals if none specified
    return [
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
  }
  
  return SUBSCRIPTION_INTERVALS.filter(interval => 
    productIntervals.includes(interval.value)
  )
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