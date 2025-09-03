"use client"

import { SearchHit } from "../../../../types/search"
import { LocalizedClientLink } from "@lib/components"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"
import { formatSubscriptionPricing } from "@lib/util/pricing-helpers"

interface SearchProductCardProps {
  product: SearchHit
  priority?: boolean
  viewMode?: 'grid' | 'list'
}

export default function SearchProductCard({ 
  product, 
  priority = false,
  viewMode = 'grid'
}: SearchProductCardProps) {
  // Calculate subscription pricing once
  const subscriptionPricing = product.subscription_enabled 
    ? formatSubscriptionPricing(product.price_eur) 
    : null
  if (viewMode === 'list') {
    return (
      <LocalizedClientLink 
        href={`/products/${product.handle}`}
        className="group relative bg-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-yellow-200"
      >
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
            <Image
              src={product.thumbnail || "/placeholder-product.jpg"}
              alt={product.title}
              className="object-contain mix-blend-multiply"
              fill
              sizes="96px"
              priority={priority}
            />
            
            {/* No subscription badge in list view - we'll show pricing below */}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            {/* Brand */}
            {product.brand && product.brand !== 'Unknown' && (
              <p className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1">
                {product.brand}
              </p>
            )}

            {/* Title */}
            <h3 className="text-base font-medium text-gray-900 group-hover:text-yellow-800 transition-colors line-clamp-2 mb-2">
              {product.title}
            </h3>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            {/* Weight Display for List View */}
            {product.weight_grams && (
              <div className="mb-2">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                  {product.weight_grams > 1000 ? `${(product.weight_grams / 1000).toFixed(1)} kg` : `${product.weight_grams} g`}
                </span>
              </div>
            )}

            {/* Categories */}
            {product.category_handles && product.category_handles.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.category_handles.slice(0, 3).map((category, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium"
                  >
                    {category}
                  </span>
                ))}
                {product.category_handles.length > 3 && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                    +{product.category_handles.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price and Add to Cart */}
          <div className="flex flex-col items-end justify-between">
            <div className="text-right">
              <span className="text-xl font-semibold text-gray-900">
                €{product.price_eur.toFixed(2)}
              </span>
              {/* Subscription Price */}
              {subscriptionPricing && (
                <div className="mt-1">
                  <span className="text-sm text-blue-700 font-medium">
                    Püsitellimusega: €{subscriptionPricing.subscriptionPrice}
                  </span>
                  <span className="text-xs text-green-600 ml-1">{subscriptionPricing.discountLabel}</span>
                </div>
              )}
            </div>
            
            <button className="p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg transition-colors group/btn">
              <ShoppingBag className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </LocalizedClientLink>
    )
  }

  // Grid view (default)
  return (
    <LocalizedClientLink 
      href={`/products/${product.handle}`}
      className="group relative bg-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-yellow-200"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
        <Image
          src={product.thumbnail || "/placeholder-product.jpg"}
          alt={product.title}
          className="object-contain mix-blend-multiply"
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />
        
        {/* No subscription badge in grid view - we'll show pricing below */}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && product.brand !== 'Unknown' && (
          <p className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-yellow-800 transition-colors line-clamp-2 min-h-[2.5rem] mb-2">
          {product.title}
        </h3>

        {/* Description - Truncated */}
        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Weight Display for Grid View */}
        {product.weight_grams && (
          <div className="mb-3">
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
              {product.weight_grams > 1000 ? `${(product.weight_grams / 1000).toFixed(1)} kg` : `${product.weight_grams} g`}
            </span>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="text-lg font-semibold text-gray-900">
              €{product.price_eur.toFixed(2)}
            </span>
            {/* Subscription Price */}
            {subscriptionPricing && (
              <div className="mt-1">
                <span className="text-sm text-blue-700 font-medium">
                  Püsitellimusega: €{subscriptionPricing.subscriptionPrice}
                </span>
                <span className="text-xs text-green-600 ml-1">{subscriptionPricing.discountLabel}</span>
              </div>
            )}
          </div>
          
          <button className="p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg transition-colors group/btn">
            <ShoppingBag className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Categories */}
        {product.category_handles && product.category_handles.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {product.category_handles.slice(0, 2).map((category, index) => (
                <span 
                  key={index}
                  className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {category}
                </span>
              ))}
              {product.category_handles.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  +{product.category_handles.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </LocalizedClientLink>
  )
} 