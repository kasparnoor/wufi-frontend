import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { Sparkles } from "@medusajs/icons"
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
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-10 lg:py-12 mt-6 sm:mt-8 lg:mt-12">
        {/* Main Product Section: Images + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Images + Actions */}
          <div className="lg:col-span-7 lg:sticky lg:top-24" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            <div className="space-y-2 max-h-full">
              {/* Gallery */}
              <div className="rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 bg-white p-2">
                <ImageGallery images={product?.images || []} />
              </div>
              
              {/* Product Actions */}
              <div className="rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 bg-white p-3">
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

          {/* Right Column: Product Info */}
          <div className="lg:col-span-5">
            {/* Product Title & Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="mb-4 sm:mb-8">
                <div className="inline-flex items-center gap-1 sm:gap-2 bg-yellow-400/20 px-2 sm:px-6 py-1 sm:py-2 rounded-full border border-yellow-400/30">
                  <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                  <span className="text-xs sm:text-base text-yellow-700 font-semibold">Toote info</span>
                </div>
              </div>
              <ProductInfo product={product} />
              
              {/* Product Onboarding */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ProductOnboardingCta />
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section - REMOVED */}
        {/* <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="mb-4 sm:mb-8">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-yellow-400/20 px-2 sm:px-6 py-1 sm:py-2 rounded-full border border-yellow-400/30">
              <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
              <span className="text-xs sm:text-base text-yellow-700 font-semibold">Toote detailid</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <ProductTabs product={product} />
          </div>
        </div> */}

        {/* Related Products Section - Conditionally Rendered */}
        {relatedProductsList && relatedProductsList.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="mb-4 sm:mb-8">
              <div className="inline-flex items-center gap-1 sm:gap-2 bg-yellow-400/20 px-2 sm:px-6 py-1 sm:py-2 rounded-full border border-yellow-400/30">
                <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                <span className="text-xs sm:text-base text-yellow-700 font-semibold">Sarnased tooted</span>
              </div>
            </div>
            <Suspense fallback={<SkeletonRelatedProducts />}>
              <RelatedProducts product={product} countryCode={countryCode} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTemplate
