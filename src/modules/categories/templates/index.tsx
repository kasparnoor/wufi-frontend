import { notFound } from "next/navigation"
import { Suspense } from "react"
import Image from "next/image"
import { Sparkles } from "@medusajs/icons"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import SearchBar from "@modules/store/components/search"

type CategoryMetadata = {
  image?: string
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
  const viewMode = (searchParams.view as 'grid' | 'list') || 'grid'
  const priceRange = searchParams.price as string | undefined
  const selectedCategories = searchParams.categories ? (searchParams.categories as string).split(',') : undefined

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="py-24 bg-yellow-50/30 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="flex flex-col items-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700 font-semibold">Kategooria</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 text-center max-w-2xl">{category.description}</p>
            )}
          </div>

          {/* Search Bar */}
          <SearchBar />

          {/* Subcategories Grid */}
          {category.category_children && category.category_children.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.category_children.map((subcategory) => {
                const metadata = subcategory.metadata as CategoryMetadata
                const imageUrl = metadata?.image
                return (
                  <LocalizedClientLink
                    key={subcategory.id}
                    href={`/categories/${subcategory.handle}`}
                    className="group relative bg-white p-6 rounded-2xl hover:shadow-xl transition-all duration-300 border border-yellow-200 hover:border-yellow-300 hover:-translate-y-1"
                  >
                    {imageUrl && (
                      <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={subcategory.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium mb-1 text-yellow-800 group-hover:text-yellow-600 transition-colors">
                      {subcategory.name}
                    </h3>
                    <p className="text-sm text-yellow-700 group-hover:text-yellow-600">
                      Vaata tooteid
                    </p>
                  </LocalizedClientLink>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <RefinementList sortBy={sort} />
            </div>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              <Suspense
                fallback={
                  <SkeletonProductGrid
                    numberOfProducts={category.products?.length ?? 8}
                  />
                }
              >
                <PaginatedProducts
                  sortBy={sort}
                  page={pageNumber}
                  categoryId={category.id}
                  countryCode={countryCode}
                  viewMode={viewMode}
                  priceRange={priceRange}
                  selectedCategories={selectedCategories}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
