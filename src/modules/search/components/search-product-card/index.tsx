"use client"

import { SearchHit } from "../../../../types/search"
import { LocalizedClientLink } from "@lib/components"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"

interface SearchProductCardProps {
  product: SearchHit
  priority?: boolean
}

export default function SearchProductCard({ 
  product, 
  priority = false 
}: SearchProductCardProps) {
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
        
        {/* Subscription Badge */}
        {product.subscription_enabled && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            Püsitellimus
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1">
          {product.brand}
        </p>

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

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-gray-900">
              €{product.price_eur.toFixed(2)}
            </span>
          </div>
          
          <button className="p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg transition-colors group/btn">
            <ShoppingBag className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category, index) => (
                <span 
                  key={index}
                  className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {category}
                </span>
              ))}
              {product.categories.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  +{product.categories.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </LocalizedClientLink>
  )
} 