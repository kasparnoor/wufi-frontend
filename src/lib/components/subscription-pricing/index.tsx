import { formatSubscriptionPricing } from "@lib/util/pricing-helpers"

interface SubscriptionPricingProps {
  originalPrice: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function SubscriptionPricing({ 
  originalPrice, 
  className = "",
  size = 'md'
}: SubscriptionPricingProps) {
  const pricing = formatSubscriptionPricing(originalPrice)
  
  const sizeClasses = {
    sm: {
      price: "text-xs",
      discount: "text-xs"
    },
    md: {
      price: "text-sm",
      discount: "text-xs"
    },
    lg: {
      price: "text-base",
      discount: "text-sm"
    }
  }
  
  return (
    <div className={`mt-1 ${className}`}>
      <span className={`text-blue-700 font-medium ${sizeClasses[size].price}`}>
        Püsitellimusega: €{pricing.subscriptionPrice}
      </span>
      <span className={`text-green-600 ml-1 ${sizeClasses[size].discount}`}>
        {pricing.discountLabel}
      </span>
    </div>
  )
} 