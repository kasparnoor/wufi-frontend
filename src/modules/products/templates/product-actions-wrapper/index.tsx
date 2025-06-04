import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const { response } = await listProducts({
    regionId: region.id,
  })
  
  const product = response.products.find(p => p.id === id)

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} />
}
