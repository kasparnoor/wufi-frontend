import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import Image from "next/image"
import { Sparkles, ArrowRight, Cat, Dog, Grid3X3 } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Kategooriad | Kraps",
  description: "Avastage kõik meie tootekategooriad. Leidke oma lemmiklooma jaoks sobivad tooted kategooriate kaupa.",
}

// Disable static generation for now to avoid build issues
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  // Return empty array to skip static generation
  console.log('Skipping static generation for main categories page')
  return []
}

export default async function CategoriesPage({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const categories = await listCategories()

  // Filter to only show top-level categories (no parent)
  const topLevelCategories = categories?.filter((category) => !category.parent_category)

  // Helper function to get category icon
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('kass') || name.includes('cat')) {
      return <Cat className="h-6 w-6 text-yellow-800" />
    } else if (name.includes('koer') || name.includes('dog')) {
      return <Dog className="h-6 w-6 text-yellow-800" />
    }
    return <Grid3X3 className="h-6 w-6 text-yellow-800" />
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="py-16 bg-yellow-50/30">
        <div className="content-container text-center">
          <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
            <Sparkles className="h-5 w-5 text-yellow-800" />
            <span className="text-yellow-800 font-semibold">Kategooriad</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Milline on teie lemmikloom?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Valige oma lemmiklooma tüüp ja leidke talle sobivad tooted
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="py-16 bg-white">
        <div className="content-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {topLevelCategories?.map((category) => {
              const metadata = category.metadata as { image?: string, thumbnail?: string }
              const imageUrl = metadata?.thumbnail || metadata?.image
              
              return (
                <LocalizedClientLink
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-yellow-300 hover:-translate-y-1"
                >
                  {/* Category Image */}
                  <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={category.name || 'Category image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {getCategoryIcon(category.name)}
                      </div>
                    )}
                  </div>
                  
                  {/* Category Content */}
                  <div className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getCategoryIcon(category.name)}
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-800 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 group-hover:text-yellow-800 flex items-center justify-center font-medium">
                      Vaata tooteid <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 