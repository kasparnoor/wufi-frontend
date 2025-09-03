'use client'

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { LocalizedClientLink } from "@lib/components"
import { KrapsButton } from "@lib/components"
import { ShoppingBag, Star } from "lucide-react"
import Image from "next/image"

type ProductPreviewProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  priority?: boolean
}

export default function ProductPreview({
  product,
  region,
  priority = false
}: ProductPreviewProps) {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <LocalizedClientLink 
      href={`/products/${product.handle}`}
      className="group relative bg-white rounded-3xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-yellow-300 hover:-translate-y-2 overflow-hidden"
    >
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-yellow-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 to-gray-100/50">
        <Image
          src={product.thumbnail || ""}
          alt={product.title}
          className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Quick Action Button - Top Right */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50">
            <Star className="h-4 w-4 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Product Info Container */}
      <div className="relative p-6 space-y-4">
        {/* Product Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-800 transition-colors duration-300 line-clamp-2 min-h-[3.5rem] leading-tight">
            {product.title}
          </h3>
          
          {/* Product Collection/Category and Weight */}
          <div className="flex items-center justify-between">
            {product.collection && (
              <p className="text-sm text-gray-500 font-medium">
                {product.collection.title}
              </p>
            )}
            {product.weight && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                {product.weight > 1000 ? `${(product.weight / 1000).toFixed(1)} kg` : `${product.weight} g`}
              </span>
            )}
          </div>
        </div>

        {/* Price and Action Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            {cheapestPrice && (
              <div className="space-y-1">
                <span className="text-xl font-bold text-gray-900 group-hover:text-yellow-800 transition-colors">
                  {/* Apply psychological pricing - make round numbers slightly irregular */}
                  {(() => {
                    const price = cheapestPrice.calculated_price
                    // Check if it's a round number and adjust slightly
                    if (price.includes('.00') && !price.includes('0.00')) {
                      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''))
                      let adjustedPrice = numericPrice
                      if (numericPrice >= 50) adjustedPrice = numericPrice - 0.03
                      else if (numericPrice >= 20) adjustedPrice = numericPrice - 0.01
                      else if (numericPrice >= 10) adjustedPrice = numericPrice - 0.02
                      
                      if (adjustedPrice !== numericPrice) {
                        return price.replace(numericPrice.toString(), adjustedPrice.toFixed(2))
                      }
                    }
                    return price
                  })()}
                </span>
                {/* Add per-serving hint for food products */}
                {product.weight && product.title?.toLowerCase().includes('toit') && (
                  <span className="text-xs text-gray-500">
                    ~€{((parseFloat(cheapestPrice.calculated_price.replace(/[^0-9.]/g, '')) || 0) / Math.max(1, (product.weight / 1000) * 25)).toFixed(2)}/portsjon
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Enhanced Add to Cart Button with 400ms optimal animation */}
          <div className="relative">
            <KrapsButton 
              variant="primary"
              size="small"
              className="!p-3 !min-w-0 aspect-square shadow-lg hover:shadow-xl transition-all duration-[400ms] group-hover:scale-110 button-ripple focus-ring"
            >
              <ShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform duration-[400ms]" />
            </KrapsButton>
            
            {/* Enhanced Ripple Effect with optimal timing */}
            <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-[400ms]" />
          </div>
        </div>
        
        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </LocalizedClientLink>
  )
}
