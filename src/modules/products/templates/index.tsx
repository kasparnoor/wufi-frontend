import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { Sparkles } from "@medusajs/icons"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-0 sm:px-6 lg:px-12">
        <div className="py-6 sm:py-16 lg:py-32">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-8 lg:gap-16">
            {/* Left Column - Product Images */}
            <div className="lg:sticky lg:top-32 h-fit">
              <div className="rounded-none sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <ImageGallery images={product?.images || []} />
              </div>
            </div>

            {/* Right Column - Product Info & Actions */}
            <div className="flex flex-col gap-3 sm:gap-8 lg:gap-16">
              {/* Product Info Section */}
              <div>
                <div className="mb-2 sm:mb-8">
                  <div className="inline-flex items-center gap-1 sm:gap-2 bg-yellow-400/20 px-2 sm:px-6 py-1 sm:py-2 rounded-full border border-yellow-400/30">
                    <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                    <span className="text-xs sm:text-base text-yellow-700 font-semibold">Toote info</span>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-8">
                  <ProductInfo product={product} />
                  <ProductOnboardingCta />
                </div>
              </div>

              {/* Sticky Actions */}
              <div className="lg:sticky lg:top-32 bg-white rounded-none sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-2 sm:p-6 lg:p-8">
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

          {/* Product Details Section */}
          <div className="mt-6 sm:mt-24 lg:mt-32 border-t border-gray-100 pt-3 sm:pt-12 lg:pt-16">
            <div className="mb-2 sm:mb-10">
              <div className="inline-flex items-center gap-1 sm:gap-2 bg-yellow-400/20 px-2 sm:px-6 py-1 sm:py-2 rounded-full border border-yellow-400/30">
                <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                <span className="text-xs sm:text-base text-yellow-700 font-semibold">Toote detailid</span>
              </div>
            </div>
            <ProductTabs product={product} />
          </div>

          {/* Related Products Section */}
          <div className="mt-6 sm:mt-24 lg:mt-32">
            <div className="mb-2 sm:mb-10">
              <div className="inline-flex items-center gap-1 sm:gap-2 bg-yellow-400/20 px-2 sm:px-6 py-1 sm:py-2 rounded-full border border-yellow-400/30">
                <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                <span className="text-xs sm:text-base text-yellow-700 font-semibold">Sarnased tooted</span>
              </div>
            </div>
            <Suspense fallback={<SkeletonRelatedProducts />}>
              <RelatedProducts product={product} countryCode={countryCode} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTemplate
