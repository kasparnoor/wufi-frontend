"use client"

import { notFound } from "next/navigation"
import { Suspense, useState } from "react"
import Image from "next/image"
import { Metadata } from "next"

import { InteractiveLink, BreadcrumbSchema } from "@lib/components"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { LocalizedClientLink } from "@lib/components"
import { HttpTypes } from "@medusajs/types"
import CategorySearchResultsEnhanced from "../components/category-search-results-enhanced"
import CategoryFiltersEnhanced from "../components/category-filters-enhanced"
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
  categories = [],
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  searchParams: { [key: string]: string | string[] | undefined }
  categories?: any[]
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const query = (searchParams.q as string) || ""

  // State for facets from search results
  const [searchFacets, setSearchFacets] = useState<{
    brands: Record<string, number>
    categories: Record<string, number>
    price_ranges: Record<string, number>
    weight_ranges: Record<string, number>
    features: Record<string, number>
  }>({ brands: {}, categories: {}, price_ranges: {}, weight_ranges: {}, features: {} })

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

  // Generate breadcrumb items for schema
  const breadcrumbItems = [
    { name: "Pood", url: `/pood` },
    ...breadcrumbPath.map(cat => ({
      name: cat.name,
      url: `/categories/${cat.handle}`
    }))
  ]

  // Category metadata
  const metadata = category.metadata as CategoryMetadata
  const categoryImage = metadata?.image
  const productCount = category.products?.length || 0
  const subcategoryCount = category.category_children?.length || 0
  const hasSubcategories = category.category_children && category.category_children.length > 0

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="flex flex-col">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <LocalizedClientLink 
              href="/pood" 
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

      {/* Hero Section with Subcategories */}
      <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 relative">
          <div className={`grid grid-cols-1 ${categoryImage || hasSubcategories ? 'lg:grid-cols-2' : ''} gap-8 lg:gap-12 items-start`}>
            {/* Left Column - Main Content */}
            <div className="order-1">
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 bg-yellow-100 px-3 sm:px-4 py-2 rounded-full border border-yellow-200">
                <Sparkles className="h-4 w-4 text-yellow-800" />
                <span className="text-yellow-800 font-semibold text-sm">Kategooria</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-lg">
                  {category.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-3 sm:gap-6 mb-6 sm:mb-8">
                {productCount > 0 && (
                  <div className="flex items-center gap-2 bg-white/70 px-3 sm:px-4 py-2 rounded-lg border border-yellow-200">
                    <Package className="h-4 w-4 text-yellow-800" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {productCount} toodet
                    </span>
                  </div>
                )}
                
                {subcategoryCount > 0 && (
                  <div className="flex items-center gap-2 bg-white/70 px-3 sm:px-4 py-2 rounded-lg border border-yellow-200">
                    <TrendingUp className="h-4 w-4 text-yellow-800" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {subcategoryCount} alamkategooriat
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 bg-white/70 px-3 sm:px-4 py-2 rounded-lg border border-yellow-200">
                  <Star className="h-4 w-4 text-yellow-800" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Kvaliteetsed tooted
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Subcategories or Image */}
            <div className="order-2">
              {hasSubcategories ? (
                /* Subcategories in Header */
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-yellow-200 p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-yellow-800" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Alamkategooriad
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                    Leida täpselt see, mida vajate
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                    {category.category_children.slice(0, 6).map((subcategory, index) => {
                      const subMetadata = subcategory.metadata as CategoryMetadata
                      const imageUrl = subMetadata?.thumbnail || subMetadata?.image
                      const isFeatured = subMetadata?.featured
                      
                      return (
                        <LocalizedClientLink
                          key={subcategory.id}
                          href={`/categories/${subcategory.handle}`}
                          className={`group relative bg-white rounded-xl border transition-all duration-300 hover:shadow-md hover:-translate-y-1 p-3 ${
                            isFeatured 
                              ? "border-yellow-300 shadow-sm" 
                              : "border-gray-200 hover:border-yellow-300"
                          }`}
                        >
                          {isFeatured && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                              TOP
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {imageUrl ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={imageUrl}
                                  alt={subcategory.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="h-6 w-6 text-yellow-800 opacity-60" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-yellow-800 transition-colors truncate">
                                {subcategory.name}
                              </h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">
                                  Vaata tooteid
                                </span>
                                <ChevronRight className="h-3 w-3 text-yellow-800 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                              </div>
                            </div>
                          </div>
                        </LocalizedClientLink>
                      )
                    })}
                  </div>
                  
                  {category.category_children.length > 6 && (
                    <div className="mt-4 text-center">
                      <span className="text-sm text-gray-500">
                        +{category.category_children.length - 6} rohkem alamkategooriat
                      </span>
                    </div>
                  )}
                </div>
              ) : categoryImage ? (
                /* Category Image if no subcategories */
                <div className="relative">
                  <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
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
                  <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-yellow-900 px-3 sm:px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                    Populaarne valik
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Full Subcategories Section (Only if more than 6 subcategories) */}
      {hasSubcategories && category.category_children.length > 6 && (
        <div className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Kõik alamkategooriad
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Avasta kõik meie spetsialiseeritud alamkategooriad
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {category.category_children.map((subcategory, index) => {
                const subMetadata = subcategory.metadata as CategoryMetadata
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
                    {isFeatured && (
                      <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        POPULAARNE
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {imageUrl ? (
                        <div className="relative w-full h-32 sm:h-40 mb-4 rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={subcategory.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ) : (
                        <div className="w-full h-32 sm:h-40 mb-4 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                          <ShoppingBag className="h-8 sm:h-12 w-8 sm:w-12 text-yellow-800 opacity-50" />
                        </div>
                      )}

                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-yellow-800 transition-colors">
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

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800">
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
      <div className="py-8 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {category.name} Tooted
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Leida parimad {category.name.toLowerCase()} tooted teie lemmikloomale
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Enhanced Filters Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-6">
                <CategoryFiltersEnhanced 
                  categoryId={category.id}
                  initialQuery={query}
                  facets={searchFacets}
                  categories={categories}
                />
              </div>
            </div>

            {/* Products Grid with Algolia Search */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <Suspense
                fallback={
                  <SkeletonProductGrid
                    numberOfProducts={category.products?.length ?? 12}
                  />
                }
              >
                <CategorySearchResultsEnhanced
                  categoryId={category.id}
                  categoryName={category.name}
                  countryCode={countryCode}
                  searchParams={searchParams}
                  onFacetsUpdate={setSearchFacets}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
