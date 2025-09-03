import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: {
    category: string[]
    countryCode: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Disable static generation for now to avoid build issues
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  // Return empty array to skip static generation
  console.log('Skipping static generation for categories')
  return []
}

export const metadata: Metadata = {
  title: "Categories | Kraps",
  description: "Explore our product categories.",
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  // Fetch all categories for filtering
  let categories: any[] = []
  try {
    categories = await listCategories({
      fields: "*category_children, *parent_category",
      limit: 100
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    categories = []
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy as any}
      page={page as string}
      countryCode={params.countryCode}
      searchParams={searchParams}
      categories={categories}
    />
  )
}
