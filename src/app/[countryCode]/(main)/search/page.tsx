import { Metadata } from "next"
import { searchProducts } from "@lib/data/search"
import SearchResults from "@modules/search/templates/search-results"
import { SearchParams } from "../../../../types/search"

interface SearchPageProps {
  searchParams: {
    q?: string
    brand?: string
    categories?: string
    subscription_enabled?: string
    min_price?: string
    max_price?: string
    page?: string
    limit?: string
  }
}

export async function generateMetadata({ 
  searchParams 
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || ""
  
  return {
    title: query ? `"${query}" otsingutulemused | Wufi Pood` : "Otsi tooteid | Wufi Pood",
    description: query 
      ? `Leia parimad lemmikloomade tooted "${query}" kohta. Kvaliteetsed toidud ja aksessuaarid koertele ja kassidele.`
      : "Otsi lemmikloomade tooteid meie laiast valikust. Kvaliteetsed toidud, maiused ja aksessuaarid koertele ja kassidele.",
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  
  // Build search parameters
  const params: SearchParams = {
    q: query,
    brand: searchParams.brand,
    categories: searchParams.categories,
    subscription_enabled: searchParams.subscription_enabled === "true" ? true : 
                         searchParams.subscription_enabled === "false" ? false : undefined,
    min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
    max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
    page: searchParams.page ? Number(searchParams.page) : 0,
    limit: searchParams.limit ? Number(searchParams.limit) : 20,
  }

  // Fetch initial search results server-side
  const initialResults = await searchProducts(params)

  return (
    <SearchResults 
      initialResults={initialResults}
      initialQuery={query}
    />
  )
} 