import React, { Suspense } from "react"

import { ImageGallery } from "@lib/components"
import { ProductActions } from "@lib/components"
import { ProductOnboardingCta } from "@lib/components"
import { ProductTabs } from "@lib/components"
import { RelatedProducts } from "@lib/components"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { Sparkles } from "lucide-react"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }
  if (!region) {
    return notFound()
  }

  const queryParams: any = {
    region_id: region.id,
  }

  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }

  if (product.tags && product.tags.length > 0) {
    queryParams.tags = product.tags.map((t) => t.id).filter(Boolean)
  }
  
  queryParams.is_giftcard = false

  const relatedProductsList = await listProducts({
    queryParams: queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          {/* Mobile Image Gallery */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <ImageGallery images={product?.images || []} />
          </div>
          
          {/* Mobile Product Info Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30 mb-3">
              <Sparkles className="h-4 w-4 text-yellow-800" />
              <span className="text-sm text-yellow-800 font-semibold">Toote info</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
            {product.collection && (
              <p className="text-sm text-gray-600 mb-3">{product.collection.title}</p>
            )}
          </div>

          {/* Mobile Buying Options - Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>

          {/* Mobile Product Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <ProductInfo product={product} />
            <div className="mt-6 pt-6 border-t border-gray-100">
              <ProductOnboardingCta />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Smart Vertical Responsiveness */}
      <div className="hidden lg:block">
        {/* Add header clearance padding */}
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="grid grid-cols-2 gap-12 relative">
            {/* Left Column: Images + Actions - Smart Sticky Behavior */}
            <div className="xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
              {/* Combined Images + Actions Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                {/* Images Section */}
                <div className="2xl:max-h-[70vh] mb-6">
                  <ImageGallery images={product?.images || []} />
                </div>
                
                {/* Divider between sections */}
                <div className="border-t border-gray-100 pt-6">
                  {/* Compact Actions */}
                  <Suspense
                    fallback={
                      <ProductActions
                        disabled={true}
                        product={product}
                        region={region}
                      />
                    }
                  >
                    <ProductActionsWrapper id={product.id} region={region} />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* Right Column: Scrollable Product Info */}
            <div className="min-h-screen">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
                    <Sparkles className="h-5 w-5 text-yellow-800" />
                    <span className="text-base text-yellow-800 font-semibold">Toote info</span>
                  </div>
                </div>
                
                <ProductInfo product={product} />
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <ProductOnboardingCta />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProductsList && relatedProductsList.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-16">
            <div className="mb-6 lg:mb-8">
              <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-800" />
                <span className="text-sm lg:text-base text-yellow-800 font-semibold">Sarnased tooted</span>
              </div>
            </div>
            <Suspense fallback={<SkeletonRelatedProducts />}>
              <RelatedProducts product={product} countryCode={countryCode} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductTemplate
