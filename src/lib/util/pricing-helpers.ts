/**
 * Pricing utilities for subscription discounts and calculations
 */

// Subscription discount percentage (5%)
export const SUBSCRIPTION_DISCOUNT_RATE = 0.05

/**
 * Calculate the subscription price with discount
 * @param originalPrice - The original product price
 * @returns The discounted subscription price
 */
export function calculateSubscriptionPrice(originalPrice: number): number {
  return originalPrice * (1 - SUBSCRIPTION_DISCOUNT_RATE)
}

/**
 * Calculate the subscription savings amount
 * @param originalPrice - The original product price
 * @returns The amount saved with subscription
 */
export function calculateSubscriptionSavings(originalPrice: number): number {
  return originalPrice * SUBSCRIPTION_DISCOUNT_RATE
}

/**
 * Format subscription pricing display
 * @param originalPrice - The original product price
 * @returns Object with formatted pricing strings
 */
export function formatSubscriptionPricing(originalPrice: number) {
  const subscriptionPrice = calculateSubscriptionPrice(originalPrice)
  const savings = calculateSubscriptionSavings(originalPrice)
  const discountPercentage = Math.round(SUBSCRIPTION_DISCOUNT_RATE * 100)
  
  return {
    subscriptionPrice: subscriptionPrice.toFixed(2),
    savings: savings.toFixed(2),
    discountPercentage: `${discountPercentage}%`,
    discountLabel: `(-${discountPercentage}%)`
  }
} 