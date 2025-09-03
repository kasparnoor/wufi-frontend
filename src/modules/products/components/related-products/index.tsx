import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { Suspense } from "react"
import { Sparkles, Heart } from "lucide-react"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Edit this function to define your related products logic
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

  const products = await listProducts({
    queryParams,
    regionId: region.id,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Estonian Header with Modern Styling */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 px-8 py-4 rounded-full border border-yellow-400/30 shadow-lg backdrop-blur-sm">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-yellow-800" aria-hidden="true" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full motion-safe:animate-pulse" aria-hidden="true" />
            </div>
            <span className="text-yellow-800 font-bold text-lg tracking-wide">Sarnased tooted</span>
            <Heart className="h-5 w-5 text-yellow-700" />
          </div>
        </div>
        
        <div className="space-y-4 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Need võivad samuti{" "}
            <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              meeldida
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Avasta teisi kvaliteetseid tooteid, mis sobivad sinu lemmikloomale ja võivad täiendada sinu ostukorvil olevaid valikuid
          </p>
        </div>
        
        {/* Decorative Element */}
        <div className="flex justify-center">
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full" aria-hidden="true" />
        </div>
      </div>

      {/* Enhanced Products Grid */}
      <div className="relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 via-transparent to-amber-50/50 rounded-3xl -z-10" />
        
        {/* Products Grid with Better Spacing */}
        <Suspense fallback={<SkeletonRelatedProducts />}>        
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 p-4">
            {products.slice(0, 8).map((product, i) => {
              const priority = i < 4
              return (
                <div 
                  key={product.id}
                  className="transform transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <Product 
                    region={region} 
                    product={product} 
                    priority={priority}
                  />
                </div>
              )
            })}
          </div>
        </Suspense>
      </div>
      
      
    </div>
  )
}
