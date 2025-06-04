'use client'

import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { InteractiveLink } from "@lib/components"
import { ProductPreview } from "@lib/components"
import { PaginatedProductsParams } from "@modules/store/templates/paginated-products"

export default function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { response } = await listProducts({
          regionId: region.id,
          queryParams: {
            collection_id: [collection.id],
            fields: "*variants.calculated_price",
          } as PaginatedProductsParams,
        })
        setProducts(response.products)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [collection.id, region.id])

  if (!products.length) {
    return null
  }

  return (
    <div className="content-container py-8 sm:py-12 lg:py-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <Text className="txt-xlarge">{collection.title}</Text>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          Vaata kõiki
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12 lg:gap-y-24">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
