import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveProductByHandle } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"

type Props = {
  params: { countryCode: string; handle: string }
}

// Disable static generation for now to avoid build issues
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  // Return empty array to skip static generation
  console.log('Skipping static generation for products')
  return []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { params } = props
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await retrieveProductByHandle({
    handle,
    regionId: region.id,
  })

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Kraps`,
    description: product.description || `${product.title} - kvaliteetne lemmikloomade toode Kraps e-poest. Kiire kohaletoimetamine üle Eesti.`,
    openGraph: {
      title: `${product.title} | Kraps`,
      description: product.description || `${product.title} - kvaliteetne lemmikloomade toode Kraps e-poest`,
      images: product.thumbnail ? [product.thumbnail] : [],
      type: 'website',
      siteName: 'Kraps',
    },
  }
}

export default async function ProductPage(props: Props) {
  const { params } = props
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await retrieveProductByHandle({
    handle: params.handle,
    regionId: region.id,
  })

  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  )
}
