"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import SearchProductCard from "../../search/components/search-product-card"
import { ChevronLeft, ChevronRight, Search, Package, Filter, Grid, List, Loader2, X, SortAsc } from "lucide-react"
import { KrapsButton } from "@lib/components"

interface SearchResponse {
  query: string
  hits: ProductHit[]
  total: number
  page: number
  pages: number
  facets: {
    brands: Record<string, number>
    categories: Record<string, number>
    price_ranges: Record<string, number>
    weight_ranges: Record<string, number>
    features: Record<string, number>
  }
  processingTimeMS: number
}

interface ProductHit {
  objectID: string
  title: string
  description: string
  brand: string
  categories: string[]
  category_handles: string[]
  price_eur: number
  rating?: number
  subscription_enabled: boolean
  features: string[]
  handle: string
  thumbnail: string
  sku: string
}

interface CategorySearchResultsEnhancedProps {
  categoryId: string
  categoryName: string
  countryCode: string
  searchParams: { [key: string]: string | string[] | undefined }
  onFacetsUpdate?: (facets: SearchResponse['facets']) => void
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Uusimad' },
  { value: 'price_asc', label: 'Hind: odavamad enne' },
  { value: 'price_desc', label: 'Hind: kallimad enne' },
  { value: 'name', label: 'Nimetus A-Z' },
  { value: 'popularity', label: 'Populaarsus' }
]

export default function CategorySearchResultsEnhanced({ 
  categoryId,
  categoryName,
  countryCode,
  searchParams,
  onFacetsUpdate
}: CategorySearchResultsEnhancedProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showSortMenu, setShowSortMenu] = useState(false)
  
  const query = (searchParams.q as string) || ""
  const currentPage = Number(searchParams.page) || 0
  const sort = (searchParams.sort as string) || "newest"
  const minPrice = searchParams.min_price as string | undefined
  const maxPrice = searchParams.max_price as string | undefined
  const brand = searchParams.brands as string | undefined
  const features = searchParams.features as string | undefined
  const weightRanges = searchParams.weight_ranges as string | undefined

  // Fetch search results using enhanced API
  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const searchRequest = {
        q: query || undefined,
        filters: {
          categories: categoryId ? [categoryId] : undefined, // Allow all categories if categoryId is empty
          brands: brand?.split(',') || undefined,
          features: features?.split(',') || undefined,
          weight_ranges: weightRanges?.split(',') || undefined,
          price_range: {
            min: minPrice ? Number(minPrice) : undefined,
            max: maxPrice ? Number(maxPrice) : undefined,
          }
        },
        sort: sort,
        pagination: {
          page: currentPage,
          limit: 20
        }
      }

      const response = await fetch('/api/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest)
      })

      if (!response.ok) {
        throw new Error('Enhanced search failed')
      }
      
      const data = await response.json()
      setResults(data)
      
      // Notify parent component about facets update
      if (onFacetsUpdate) {
        onFacetsUpdate(data.facets)
      }
    } catch (error) {
      console.error("Error fetching enhanced category search results:", error)
      setResults({
        query: query,
        hits: [],
        total: 0,
        page: currentPage,
        pages: 0,
        facets: { brands: {}, categories: {}, price_ranges: {}, weight_ranges: {}, features: {} },
        processingTimeMS: 0
      })
    } finally {
      setLoading(false)
    }
  }, [categoryId, query, currentPage, sort, minPrice, maxPrice, brand, features, weightRanges, onFacetsUpdate])

  // Fetch results when parameters change
  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  // Handle page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams)
    params.set('page', page.toString())
    router.push(`?${params.toString()}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle sort changes
  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(urlSearchParams)
    params.set('sort', sortValue)
    params.delete('page') // Reset to first page when sorting
    router.push(`?${params.toString()}`)
    setShowSortMenu(false)
  }

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []
    if (query) filters.push({ type: 'search', value: query, label: `"${query}"` })
    if (minPrice || maxPrice) {
      const priceLabel = minPrice && maxPrice 
        ? `${minPrice}€ - ${maxPrice}€`
        : minPrice 
        ? `Alates ${minPrice}€`
        : `Kuni ${maxPrice}€`
      filters.push({ type: 'price', value: 'price', label: priceLabel })
    }
    if (brand) {
      brand.split(',').forEach(b => {
        const brandLabel = b.replace('-', ' ').split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
        filters.push({ type: 'brand', value: b, label: brandLabel })
      })
    }
    if (features) {
      features.split(',').forEach(f => {
        const featureLabels: Record<string, string> = {
          'subscription': 'Kraps tellimus',
      
          'new-arrival': 'Uus toode',
          'bestseller': 'Bestseller',
          'premium': 'Premium'
        }
        filters.push({ type: 'features', value: f, label: featureLabels[f] || f })
      })
    }
    if (weightRanges) {
      weightRanges.split(',').forEach(w => {
        const weightLabel = w === 'no-weight' ? 'Kaal määramata' : w
        filters.push({ type: 'weight_ranges', value: w, label: weightLabel })
      })
    }
    return filters
  }

  const removeFilter = (filterType: string, filterValue: string) => {
    const params = new URLSearchParams(urlSearchParams)
    
    if (filterType === 'search') {
      params.delete('q')
    } else if (filterType === 'price') {
      params.delete('min_price')
      params.delete('max_price')
    } else if (filterType === 'brand') {
      const currentBrands = (searchParams.brands as string)?.split(',') || []
      const newBrands = currentBrands.filter(b => b !== filterValue)
      if (newBrands.length > 0) {
        params.set('brands', newBrands.join(','))
      } else {
        params.delete('brands')
      }
    } else if (filterType === 'features') {
      const currentFeatures = (searchParams.features as string)?.split(',') || []
      const newFeatures = currentFeatures.filter(f => f !== filterValue)
      if (newFeatures.length > 0) {
        params.set('features', newFeatures.join(','))
      } else {
        params.delete('features')
      }
    } else if (filterType === 'weight_ranges') {
      const currentWeightRanges = (searchParams.weight_ranges as string)?.split(',') || []
      const newWeightRanges = currentWeightRanges.filter(w => w !== filterValue)
      if (newWeightRanges.length > 0) {
        params.set('weight_ranges', newWeightRanges.join(','))
      } else {
        params.delete('weight_ranges')
      }
    } else {
      params.delete(filterType)
    }
    
    router.push(`?${params.toString()}`)
  }

  const activeFilters = getActiveFilters()
  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sort)?.label || 'Sorteeri'

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-yellow-800 animate-spin" />
            <div>
              <div className="w-40 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/4 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-yellow-800" />
          <div>
            <h2 className="font-semibold text-gray-900">
              {results?.total || 0} toodet {categoryId ? `kategoorias "${categoryName}"` : 'leitud'}
            </h2>
            <p className="text-sm text-gray-500">
              Otsing võttis {results?.processingTimeMS || 0}ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <SortAsc className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{currentSortLabel}</span>
            </button>
            
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                      sort === option.value ? 'text-yellow-700 font-medium bg-yellow-50' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-yellow-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-yellow-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <span className="text-sm font-medium text-yellow-800 mr-2">Aktiivsed filtrid:</span>
          {activeFilters.map((filter, index) => (
            <button
              key={`${filter.type}-${filter.value}-${index}`}
              onClick={() => removeFilter(filter.type, filter.value)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-200 text-yellow-800 text-sm rounded-full hover:bg-yellow-300 transition-colors"
            >
              {filter.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {/* Results Grid/List */}
      {results && results.hits.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }>
          {results.hits.map((product) => (
            <SearchProductCard
              key={product.objectID}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tooteid ei leitud
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Proovige muuta otsingusõnu või filtreid, et leida sobivaid tooteid.
          </p>
        </div>
      )}

      {/* Pagination */}
      {results && results.pages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          <button
            onClick={() => handlePageChange(results.page - 1)}
            disabled={results.page === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Eelmine
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, results.pages) }, (_, i) => {
              const pageNum = results.page <= 2 ? i : results.page - 2 + i
              if (pageNum >= results.pages) return null
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    pageNum === results.page
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(results.page + 1)}
            disabled={results.page >= results.pages - 1}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Järgmine
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
} 