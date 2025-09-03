"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchResponse, SearchFilters } from "../../../types/search"
import SearchProductCard from "../../search/components/search-product-card"
import { ChevronLeft, ChevronRight, Search, Package, Filter, Grid, List, Loader2 } from "lucide-react"
import { KrapsButton } from "@lib/components"

interface CategorySearchResultsProps {
  categoryId: string
  categoryName: string
  countryCode: string
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CategorySearchResults({ 
  categoryId,
  categoryName,
  countryCode,
  searchParams 
}: CategorySearchResultsProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const query = (searchParams.q as string) || ""
  const currentPage = Number(searchParams.page) || 0
  const sort = (searchParams.sort as string) || "created_at"
  const minPrice = searchParams.min_price as string | undefined
  const maxPrice = searchParams.max_price as string | undefined
  const brand = searchParams.brand as string | undefined
  const features = searchParams.features as string | undefined
  const rating = searchParams.rating as string | undefined

  // Fetch search results with category filter
  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })

      // Add search query if provided
      if (query) {
        params.set('q', query)
      }

      // Filter by this specific category
      params.set('categories', categoryId)

      // Add price filters
      if (minPrice) {
        params.set('min_price', minPrice)
      }
      if (maxPrice) {
        params.set('max_price', maxPrice)
      }

      // Add brand filters
      if (brand) {
        params.set('brand', brand)
      }

      // Add feature filters
      if (features) {
        params.set('features', features)
      }

      // Add rating filters
      if (rating) {
        params.set('rating', rating)
      }

      // Add sort
      if (sort && sort !== 'created_at') {
        params.set('sort', sort)
      }

      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching category search results:", error)
      setResults({
        query: query,
        hits: [],
        total: 0,
        page: currentPage,
        pages: 0,
        facets: { brand: {}, categories: {} },
        processingTimeMS: 0
      })
    } finally {
      setLoading(false)
    }
  }, [categoryId, query, currentPage, sort, minPrice, maxPrice, brand, features, rating])

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
          'bestseller': 'Bestseller'
        }
        filters.push({ type: 'features', value: f, label: featureLabels[f] || f })
      })
    }
    if (rating) {
      filters.push({ type: 'rating', value: rating, label: `${rating} tärniga` })
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
      const currentBrands = (searchParams.brand as string)?.split(',') || []
      const newBrands = currentBrands.filter(b => b !== filterValue)
      if (newBrands.length > 0) {
        params.set('brand', newBrands.join(','))
      } else {
        params.delete('brand')
      }
    } else if (filterType === 'features') {
      const currentFeatures = (searchParams.features as string)?.split(',') || []
      const newFeatures = currentFeatures.filter(f => f !== filterValue)
      if (newFeatures.length > 0) {
        params.set('features', newFeatures.join(','))
      } else {
        params.delete('features')
      }
    } else {
      params.delete(filterType)
    }
    
    router.push(`?${params.toString()}`)
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Viga andmete laadimisel
        </h3>
        <p className="text-gray-600 mb-6">
          Palun proovige lehte uuesti laadida
        </p>
        <KrapsButton variant="primary" onClick={() => window.location.reload()}>
          Laadi uuesti
        </KrapsButton>
      </div>
    )
  }

  const activeFilters = getActiveFilters()
  const hasFilters = activeFilters.length > 0

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-yellow-800" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {query ? `"${query}" otsingu tulemused` : `${categoryName} tooted`}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{results.total}</span>
                  <span>toodet leitud</span>
                  {results.processingTimeMS > 0 && (
                    <span className="text-gray-400">• {results.processingTimeMS}ms</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Ruudustik</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Nimekiri</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Aktiivsed filtrid:
              </span>
              {activeFilters.map((filter, index) => (
                <button
                  key={`${filter.type}-${filter.value}-${index}`}
                  onClick={() => removeFilter(filter.type, filter.value)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  {filter.label}
                  <ChevronRight className="h-3 w-3 rotate-45" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* No Results */}
      {results.hits.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tulemusi ei leitud
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {query 
              ? `"${query}" päringule ei leitud tulemusi kategoorias ${categoryName}${hasFilters ? ' praeguste filtritega' : ''}`
              : `Kategoorias ${categoryName} ei leitud praeguste filtritega tulemusi`
            }
          </p>
          <div className="text-sm text-gray-500 mb-6">
            <p className="mb-2">Proovige:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Teistsuguseid märksõnu</li>
              <li>Vähem filtreid</li>
              <li>Kontrollige õigekirja</li>
              <li>Kasutage üldisemaid termineid</li>
            </ul>
          </div>
          
          {hasFilters && (
            <KrapsButton 
              variant="secondary" 
              onClick={() => {
                const params = new URLSearchParams()
                router.push(`?${params.toString()}`)
              }}
            >
              Eemalda kõik filtrid
            </KrapsButton>
          )}
        </div>
      )}

      {/* Products Grid/List */}
      {results.hits.length > 0 && (
        <>
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              : "space-y-4"
          }>
            {results.hits.map((product, index) => (
              <SearchProductCard
                key={product.objectID}
                product={product}
                priority={index < 8}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination */}
          {results.pages > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Lehekülg {currentPage + 1} / {results.pages} 
                  <span className="hidden sm:inline">
                    ({currentPage * 20 + 1}-{Math.min((currentPage + 1) * 20, results.total)} / {results.total} toodet)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <KrapsButton
                    variant="secondary"
                    size="small"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Eelmine</span>
                  </KrapsButton>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, results.pages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(results.pages - 5, currentPage - 2)) + i
                      if (pageNum >= results.pages) return null
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            pageNum === currentPage
                              ? "bg-yellow-400 text-yellow-900 shadow-sm"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      )
                    })}
                  </div>

                  <KrapsButton
                    variant="secondary"
                    size="small"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= results.pages - 1}
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Järgmine</span>
                    <ChevronRight className="h-4 w-4" />
                  </KrapsButton>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 