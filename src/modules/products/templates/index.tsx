import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import SocialShare from "@modules/products/components/social-share"
import TrustBadges from "@modules/products/components/trust-badges"
import HideSupportWidget from "@modules/products/components/hide-support-widget"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { Star, Shield, Truck, RotateCcw, ChevronDown, Heart, Package, Globe } from "lucide-react"
import { listProducts } from "@lib/data/products"
import { addToCart } from "@lib/data/cart"
import { ProductSchema, TextShimmer } from "@lib/components"
import { BreadcrumbSchema } from "@lib/components/seo/json-ld"
import { getBaseURL } from "@lib/util/env"
import ProductViewTracker from "@modules/products/components/product-view-tracker"

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
    regionId: region.id,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  return (
    <>
      <HideSupportWidget />
      <ProductSchema 
        product={{
          title: product.title,
          description: product.description || undefined,
          thumbnail: product.thumbnail || undefined,
          handle: product.handle
        }}
        url={`${getBaseURL()}/${countryCode}/products/${product.handle}`}
      />

      <BreadcrumbSchema
        items={[
          { name: "Avaleht", url: `${getBaseURL()}/${countryCode}` },
          { name: "Pood", url: `${getBaseURL()}/${countryCode}/pood` },
          ...(product.collection?.handle
            ? [{ name: product.collection.title, url: `${getBaseURL()}/${countryCode}/collections/${product.collection.handle}` }]
            : []),
          { name: product.title, url: `${getBaseURL()}/${countryCode}/products/${product.handle}` }
        ]}
      />
      
      {/* Track product view for Meta Pixel */}
      <ProductViewTracker product={product} region={region} />
      
      <div className="bg-white">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-10 lg:py-16">
            
            {/* Left Column - Product Images */}
            <div className="order-1 lg:order-1">
              <div className="sticky top-20">
                <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  {/* Above-the-fold: prioritize first image via ImageGallery's internal priority */}
                  <ImageGallery images={product?.images || []} />
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="order-2 lg:order-2 flex flex-col space-y-6">
              
              {/* Breadcrumb */}
              {product.collection && (
                <nav className="text-sm text-gray-500">
                  <a className="hover:text-gray-700 underline-offset-4 hover:underline" href={`/collections/${product.collection.handle}`}>
                    {product.collection.title}
                  </a>
                </nav>
              )}

              {/* Product Title */}
              <div className="space-y-3">
                <TextShimmer
                  as="h1"
                  className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-yellow-800 dark:text-yellow-400 [--base-color:theme(colors.yellow.800)] dark:[--base-color:theme(colors.yellow.400)]"
                >
                  {product.title}
                </TextShimmer>
                
                {/* Product Categories */}
                {Array.isArray(product.categories) && product.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Kategooria:</span>
                    {product.categories.map((cat: any) => (
                      <a
                        key={cat.id || cat.handle}
                        href={`/categories/${cat.handle}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-700 text-xs hover:border-yellow-300 hover:text-yellow-800 transition-colors"
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                )}

                {/* Short Summary */}
                {product.subtitle && (
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {product.subtitle}
                  </p>
                )}
              </div>

              {/* Key Features */}
              {(() => {
                const hasWeight = Boolean(product.weight)
                const hasOrigin = Boolean(product.origin_country && product.origin_country !== 'Unknown')
                if (!hasWeight && !hasOrigin) return null
                return (
                  <div className={`grid grid-cols-2 gap-4 ${hasWeight ? 'mt-2' : 'mt-1'}`}>
                    {hasWeight && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <Package className="h-5 w-5 text-gray-700" aria-hidden="true" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">Kaal</div>
                          <div className="text-sm text-gray-600">
                            {product.weight! > 1000 ? `${(product.weight! / 1000).toFixed(1)} kg` : `${product.weight} g`}
                          </div>
                        </div>
                      </div>
                    )}
                    {hasOrigin && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <Globe className="h-5 w-5 text-gray-700" aria-hidden="true" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">Päritolu</div>
                          <div className="text-sm text-gray-600">{product.origin_country}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 border-y border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Shield className="h-4 w-4 text-gray-700" aria-hidden="true" />
                  <span>Turvalised maksed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Truck className="h-4 w-4 text-gray-700" aria-hidden="true" />
                  <span>Kiire tarne</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <RotateCcw className="h-4 w-4 text-gray-700" aria-hidden="true" />
                  <span>14 päeva tagastus</span>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="bg-gray-50/80 rounded-2xl p-6 space-y-5 shadow-inner-soft">
                <h3 className="text-lg font-semibold text-gray-900">
                  Vali tellimuse tüüp ja lisa ostukorvi
                </h3>
                <ProductActions
                  product={product}
                  region={region}
                  onAddToCart={addToCart}
                />
              </div>

              {/* Social Share */}
              <div className="pt-4">
                <SocialShare 
                  product={{
                    title: product.title,
                    handle: product.handle,
                    thumbnail: product.thumbnail
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            
            {/* About This Product */}
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  Toote kirjeldus
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Kõik oluline info toote kohta, et saaksid teha parima otsuse.
                </p>
              </div>

              {/* Clean Description */}
              <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
                <ProductInfo product={product} />
              </div>

              {/* Technical Specs */}
              <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Tehnilised andmed
                </h3>
                <ProductTabs product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <TrustBadges />
          </div>
        </div>

        {/* Onboarding CTA (renders content internally when onboarding cookie is present) */}
        <ProductOnboardingCta />

        {/* Related Products */}
        {relatedProductsList && relatedProductsList.length > 0 && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <Suspense fallback={<SkeletonRelatedProducts />}>
                <RelatedProducts product={product} countryCode={countryCode} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProductTemplate
