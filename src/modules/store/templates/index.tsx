import { Suspense } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreProductsSection from "../components/store-products-section"
import { Sparkles, ChevronRight, ShoppingBag, Package, Star, TrendingUp, Grid } from "lucide-react"
import { LocalizedClientLink } from "@lib/components"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  searchQuery,
  searchParams,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  searchQuery?: string
  searchParams?: { [key: string]: string | string[] | undefined }
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const query = searchQuery || ""

  if (!countryCode) notFound()

  // Ensure searchParams is defined
  const params = searchParams || {}

  // Fetch categories for the category section and filtering
  let categories: HttpTypes.StoreProductCategory[] = []
  let allCategories: HttpTypes.StoreProductCategory[] = []
  try {
    // Get all categories for the filter mapping
    allCategories = await listCategories({
      fields: "*category_children, *parent_category",
      limit: 100
    })
    
    // Filter to only show parent categories for the category section display
    categories = allCategories.filter(cat => !cat.parent_category)
  } catch (error) {
    console.error("Error fetching categories:", error)
    categories = []
    allCategories = []
  }

  return (
    <div className="flex flex-col">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-12 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <LocalizedClientLink 
              href="/" 
              className="text-gray-500 hover:text-yellow-800 transition-colors"
            >
              Avaleht
            </LocalizedClientLink>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Pood</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 bg-yellow-100 px-4 py-2 rounded-full border border-yellow-200">
                <Sparkles className="h-4 w-4 text-yellow-800" />
                <span className="text-yellow-800 font-semibold text-sm">Pood</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {query ? `Otsing: "${query}"` : "Kõik tooted"}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6 max-w-lg">
                {query 
                  ? `Otsingutulemused "${query}" kohta meie toodete seast`
                  : "Avasta meie laia tootevalikut - alates koeratoidust kuni aksessuaarideni"
                }
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg border border-yellow-200">
                  <Package className="h-4 w-4 text-yellow-800" />
                  <span className="text-sm font-medium text-gray-700">
                    Lai tootevalik
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg border border-yellow-200">
                  <TrendingUp className="h-4 w-4 text-yellow-800" />
                  <span className="text-sm font-medium text-gray-700">
                    Populaarsed brändid
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg border border-yellow-200">
                  <Star className="h-4 w-4 text-yellow-800" />
                  <span className="text-sm font-medium text-gray-700">
                    Kvaliteetsed tooted
                  </span>
                </div>
              </div>
            </div>

            {/* Store Image */}
            <div className="relative">
              <div className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero/dog-3600325_1920.jpg"
                  alt="Kõik tooted"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                Kõik tooted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 lg:px-12 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Grid className="h-5 w-5 text-yellow-800" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Sirvi kategooriate järgi
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => {
                const metadata = category.metadata as any
                const imageUrl = metadata?.thumbnail || metadata?.image
                
                return (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className="group relative bg-gray-50 hover:bg-yellow-50 rounded-xl border border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-md hover:-translate-y-1 p-4"
                  >
                    {imageUrl ? (
                      <div className="relative w-full h-20 mb-3 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-20 mb-3 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                        <Package className="h-8 w-8 text-yellow-800" />
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-yellow-800 transition-colors line-clamp-2">
                      {category.name}
                    </h3>
                  </LocalizedClientLink>
                )
              })}
            </div>
            
            {categories.length > 12 && (
              <div className="text-center mt-8">
                <LocalizedClientLink
                  href="/categories"
                  className="inline-flex items-center gap-2 text-yellow-800 hover:text-yellow-900 font-medium transition-colors"
                >
                  <span>Vaata kõiki kategooriaid</span>
                  <ChevronRight className="h-4 w-4" />
                </LocalizedClientLink>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Section - Client Component */}
      <StoreProductsSection 
        countryCode={countryCode}
        searchParams={params}
        initialQuery={query}
        categories={allCategories}
      />
    </div>
  )
}

export default StoreTemplate
