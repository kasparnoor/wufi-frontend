import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Pood",
  description: "Avasta meie laia tootevalikut - kõik vajalik sinu lemmikuloomale.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
    sort?: string
    min_price?: string
    max_price?: string
    brand?: string
    features?: string
    rating?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function PoodPage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, q } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      searchQuery={q}
      searchParams={searchParams}
    />
  )
}
