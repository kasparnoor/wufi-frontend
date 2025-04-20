import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Products | Wufi",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function ProductsPage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams
  const region = await getRegion(params.countryCode)

  if (!region) {
    return null
  }

  const { response: { products } } = await listProducts({
    countryCode: params.countryCode,
    queryParams: {
      limit: 12,
      offset: page ? (parseInt(page) - 1) * 12 : 0,
    },
  })

  return (
    <div className="content-container py-6">
      <div className="flex flex-col small:flex-row small:items-start py-6 gap-x-8">
        <div className="flex flex-col flex-1">
          <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-x-4 gap-y-8">
            {products?.map((product) => (
              <ProductPreview
                key={product.id}
                product={product}
                region={region}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 