import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import Image from "next/image"
import { Sparkles } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Kategooriad | Wufi",
  description: "Valige oma lemmiklooma tüüp ja leidke talle sobivad tooted",
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  return countryCodes?.map((countryCode) => ({
    countryCode,
  }))
}

export default async function CategoriesPage({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const categories = await listCategories()

  // Filter to only show top-level categories (no parent)
  const topLevelCategories = categories?.filter((category) => !category.parent_category)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="py-24 bg-yellow-50/30 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="flex flex-col items-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700 font-semibold">Kategooriad</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Milline on teie lemmikloom?</h1>
            <p className="text-gray-600 text-center max-w-2xl">
              Valige oma lemmiklooma tüüp ja leidke talle sobivad tooted
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topLevelCategories?.map((category) => {
              const metadata = category.metadata as { image?: string }
              const imageUrl = metadata?.image
              return (
                <LocalizedClientLink
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className="group relative bg-white p-6 rounded-2xl hover:shadow-xl transition-all duration-300 border border-yellow-200 hover:border-yellow-300 hover:-translate-y-1"
                >
                  {imageUrl && (
                    <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-medium mb-1 text-yellow-800 group-hover:text-yellow-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-yellow-700 group-hover:text-yellow-600">
                    Vaata tooteid
                  </p>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 