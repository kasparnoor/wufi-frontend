export interface SearchHit {
  objectID: string
  title: string
  description: string
  brand: string
  categories: string[]
  price_eur: number
  subscription_enabled: boolean
  handle: string
  thumbnail: string
  sku: string
}

export interface SearchFacets {
  brand: Record<string, number>
  categories: Record<string, number>
}

export interface SearchResponse {
  query: string
  hits: SearchHit[]
  total: number
  page: number
  pages: number
  facets: SearchFacets
  processingTimeMS: number
}

export interface SearchParams {
  q?: string
  brand?: string
  categories?: string
  subscription_enabled?: boolean
  min_price?: number
  max_price?: number
  page?: number
  limit?: number
  sort?: string
}

export interface SearchFilters {
  brands: string[]
  categories: string[]
  priceRange: [number, number]
  subscriptionOnly: boolean
}

export interface SearchState {
  query: string
  filters: SearchFilters
  page: number
  loading: boolean
  results: SearchResponse | null
  error: string | null
} 