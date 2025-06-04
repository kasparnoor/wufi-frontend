import { notFound } from "next/navigation"
import { Suspense } from "react"
import Image from "next/image"
import { Metadata } from "next"

import { InteractiveLink } from "@lib/components"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { LocalizedClientLink } from "@lib/components"
import { HttpTypes } from "@medusajs/types"
import CategorySearchResults from "../components/category-search-results"
import CategoryFilters from "../components/category-filters"
import { Sparkles, ChevronRight, ShoppingBag, Package, Star, TrendingUp } from "lucide-react"

type CategoryMetadata = {
  image?: string
  thumbnail?: string
  featured?: boolean
}

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  searchParams,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const query = (searchParams.q as string) || ""

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)
  const breadcrumbPath = [...parents.reverse(), category]

  // Category metadata
  const metadata = category.metadata as CategoryMetadata
  const categoryImage = metadata?.image
  const productCount = category.products?.length || 0
  const subcategoryCount = category.category_children?.length || 0

  return (
    <div className="flex flex-col">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-12 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <LocalizedClientLink 
              href="/store" 
              className="text-gray-500 hover:text-yellow-800 transition-colors"
            >
              Pood
            </LocalizedClientLink>
            {breadcrumbPath.map((cat, index) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {index === breadcrumbPath.length - 1 ? (
                  <span className="text-gray-900 font-medium">{cat.name}</span>
                ) : (
                  <LocalizedClientLink 
                    href={`/categories/${cat.handle}`}
                    className="text-gray-500 hover:text-yellow-800 transition-colors"
                  >
                    {cat.name}
                  </LocalizedClientLink>
                )}
              </div>
            ))}
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
                <span className="text-yellow-800 font-semibold text-sm">Kategooria</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-lg text-gray-600 mb-6 max-w-lg">
                  {category.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                {productCount > 0 && (
                  <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg border border-yellow-200">
                    <Package className="h-4 w-4 text-yellow-800" />
                    <span className="text-sm font-medium text-gray-700">
                      {productCount} toodet
                    </span>
                  </div>
                )}
                
                {subcategoryCount > 0 && (
                  <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg border border-yellow-200">
                    <TrendingUp className="h-4 w-4 text-yellow-800" />
                    <span className="text-sm font-medium text-gray-700">
                      {subcategoryCount} alamkategooriat
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg border border-yellow-200">
                  <Star className="h-4 w-4 text-yellow-800" />
                  <span className="text-sm font-medium text-gray-700">
                    Kvaliteetsed tooted
                  </span>
                </div>
              </div>
            </div>

            {/* Category Image */}
            {categoryImage && (
              <div className="relative">
                <div className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  Populaarne valik
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories Section */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Vali sobiv alamkategooria
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Leida täpselt see, mida vajate meie spetsialiseeritud alamkategooriatest
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.category_children.map((subcategory, index) => {
                const subMetadata = subcategory.metadata as CategoryMetadata
                // Use thumbnail if available, otherwise fall back to image
                const imageUrl = subMetadata?.thumbnail || subMetadata?.image
                const isFeatured = subMetadata?.featured
                
                return (
                  <LocalizedClientLink
                    key={subcategory.id}
                    href={`/categories/${subcategory.handle}`}
                    className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                      isFeatured 
                        ? "border-yellow-300 shadow-lg" 
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Featured Badge */}
                    {isFeatured && (
                      <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        POPULAARNE
                      </div>
                    )}

                    <div className="p-6">
                      {/* Image */}
                      {imageUrl ? (
                        <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={subcategory.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ) : (
                        <div className="w-full h-40 mb-4 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-yellow-800 opacity-50" />
                        </div>
                      )}

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-yellow-800 transition-colors">
                        {subcategory.name}
                      </h3>
                      
                      {subcategory.description ? (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {subcategory.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 mb-4">
                          Avasta {subcategory.name.toLowerCase()} tooteid
                        </p>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800 group-hover:text-yellow-800">
                          Vaata tooteid
                        </span>
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                          <ChevronRight className="h-3 w-3 text-yellow-800 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </LocalizedClientLink>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Products Section with Algolia Search */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {category.name} Tooted
              </h2>
              <p className="text-gray-600">
                Leida parimad {category.name.toLowerCase()} tooted teie lemmikloomale
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CategoryFilters 
                  categoryId={category.id}
                  categoryName={category.name}
                  initialQuery={query}
                />
              </div>
            </div>

            {/* Products Grid with Algolia Search */}
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <SkeletonProductGrid
                    numberOfProducts={category.products?.length ?? 12}
                  />
                }
              >
                <CategorySearchResults
                  categoryId={category.id}
                  categoryName={category.name}
                  countryCode={countryCode}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
