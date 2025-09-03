"use client"

import { Suspense, useState } from "react"
import CategorySearchResultsEnhanced from "@modules/categories/components/category-search-results-enhanced"
import CategoryFiltersEnhanced from "@modules/categories/components/category-filters-enhanced"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { HttpTypes } from "@medusajs/types"

interface StoreProductsSectionProps {
  countryCode: string
  searchParams: { [key: string]: string | string[] | undefined }
  initialQuery: string
  categories: HttpTypes.StoreProductCategory[]
}

export default function StoreProductsSection({
  countryCode,
  searchParams,
  initialQuery,
  categories
}: StoreProductsSectionProps) {
  // State to manage facets from search results
  const [searchFacets, setSearchFacets] = useState<{
    brands: Record<string, number>
    categories: Record<string, number>
    price_ranges: Record<string, number>
    features: Record<string, number>
  }>({ brands: {}, categories: {}, price_ranges: {}, features: {} })
  return (
    <div className="py-8 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Meie tooted
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Leia parimad tooted oma lemmikloomale meie laiast valikust
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-6">
              <CategoryFiltersEnhanced 
                categoryId=""
                initialQuery={initialQuery}
                facets={searchFacets}
                categories={categories}
              />
            </div>
          </div>

          {/* Products Grid with Search */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={12}
                />
              }
            >
              <CategorySearchResultsEnhanced
                categoryId=""
                categoryName="Kõik tooted"
                countryCode={countryCode}
                searchParams={searchParams}
                onFacetsUpdate={setSearchFacets}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
} 