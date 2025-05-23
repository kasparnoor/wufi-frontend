'use client'

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WufiButton from "@modules/common/components/wufi-button"
import { Star, ShoppingBag } from "@medusajs/icons"
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

  // Calculate rating (this should come from your backend)
  const rating = 4.5
  const reviewCount = 12

  return (
    <LocalizedClientLink 
      href={`/products/${product.handle}`}
      className="group relative bg-white rounded-2xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-yellow-200"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-50">
        <Image
          src={product.thumbnail || ""}
          alt={product.title}
          className="object-contain mix-blend-multiply"
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-base font-medium text-gray-900 group-hover:text-yellow-700 transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h3>

        <div className="mt-2 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{rating}</span>
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            {cheapestPrice && (
              <>
                <span className="text-lg font-semibold text-gray-900">
                  {cheapestPrice.calculated_price}
                </span>
                <span className="text-sm text-gray-500">/kuu</span>
              </>
            )}
          </div>
          <WufiButton 
            variant="primary"
            size="small"
            className="!p-2 !min-w-0 aspect-square"
          >
            <ShoppingBag className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          </WufiButton>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
