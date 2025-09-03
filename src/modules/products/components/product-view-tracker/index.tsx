'use client'

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackViewContent, convertProductToMetaPixel } from "@lib/util/meta-pixel"

type ProductViewTrackerProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

const ProductViewTracker: React.FC<ProductViewTrackerProps> = ({ product, region }) => {
  useEffect(() => {
    // Track ViewContent event when product page loads
    if (product && product.id) {
      const metaPixelProduct = convertProductToMetaPixel(product)
      
      trackViewContent({
        content_ids: [product.id],
        contents: [metaPixelProduct],
        content_type: 'product',
        currency: 'EUR',
        value: metaPixelProduct.value || 0
      })
    }
  }, [product])

  // This component doesn't render anything - it just tracks the event
  return null
}

export default ProductViewTracker 