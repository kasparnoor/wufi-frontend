import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list"
import { Sparkles } from "@medusajs/icons"

const PRODUCT_LIMIT = 24

export type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
  "variants.prices.amount.lt"?: number
  "variants.prices.amount.gte"?: number
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  searchQuery,
  priceRange,
  selectedCategories,
  searchParams,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  searchQuery?: string
  priceRange?: string
  selectedCategories?: string[]
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  // Handle sorting
  const sort = searchParams?.["sort"] as string | undefined
  if (sort) {
    switch (sort) {
      case 'price_asc':
        queryParams["order"] = 'variants.prices.amount'
        break
      case 'price_desc':
        queryParams["order"] = '-variants.prices.amount'
        break
      case 'popularity':
        queryParams["order"] = '-sales_count'
        break
      default:
        queryParams["order"] = '-created_at'
    }
  }

  if (searchQuery) {
    queryParams["q"] = searchQuery
  }

  // Handle price range filters
  const priceLt = searchParams?.["variants.prices.amount.lt"]
  const priceGte = searchParams?.["variants.prices.amount.gte"]

  if (priceLt && typeof priceLt === 'string') {
    queryParams["variants.prices.amount.lt"] = parseInt(priceLt)
  }

  if (priceGte && typeof priceGte === 'string') {
    queryParams["variants.prices.amount.gte"] = parseInt(priceGte)
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProducts({
    pageParam: page,
    queryParams,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-6 py-2.5 rounded-full border border-yellow-400/30">
          <Sparkles className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-700 font-semibold">Otsing</span>
        </div>
        <h3 className="text-xl font-medium text-yellow-800 mb-2">
          Tooteid ei leitud
        </h3>
        <p className="text-yellow-600">
          Proovi muuta filtreid või otsi midagi muud
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Product Count */}
      <div>
        <p className="text-sm text-gray-500">
          Näitan <span className="font-medium text-gray-700">{products.length}</span> toodet{' '}
          <span className="font-medium text-gray-700">{count}</span> tootest
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, i) => {
          const priority = i < 4
          return (
            <ProductPreview 
              key={product.id}
              product={product} 
              region={region} 
              priority={priority}
            />
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            page={page}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}
