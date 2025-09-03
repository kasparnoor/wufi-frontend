"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchResponse, SearchFilters } from "../../../../types/search"
import SearchProductCard from "../../components/search-product-card"
import SearchFiltersComponent from "../../components/search-filters"
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import { trackSearch } from "@lib/util/meta-pixel"

interface SearchResultsProps {
  initialResults: SearchResponse
  initialQuery: string
}

export default function SearchResults({ 
  initialResults, 
  initialQuery 
}: SearchResultsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<SearchResponse>(initialResults)
  const [loading, setLoading] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>({
    brands: searchParams.get('brand')?.split(',').filter(Boolean) || [],
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    priceRange: [
      Number(searchParams.get('min_price')) || 0,
      Number(searchParams.get('max_price')) || 1000
    ],
    subscriptionOnly: searchParams.get('subscription_enabled') === 'true'
  })

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 0)
  const [query, setQuery] = useState(initialQuery)

  // Fetch search results
  const fetchResults = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    page: number
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: "20"
      })

      if (searchFilters.brands.length > 0) {
        params.set('brand', searchFilters.brands.join(','))
      }
      if (searchFilters.categories.length > 0) {
        params.set('categories', searchFilters.categories.join(','))
      }
      if (searchFilters.subscriptionOnly) {
        params.set('subscription_enabled', 'true')
      }
      if (searchFilters.priceRange[0] > 0) {
        params.set('min_price', searchFilters.priceRange[0].toString())
      }
      if (searchFilters.priceRange[1] < 1000) {
        params.set('max_price', searchFilters.priceRange[1].toString())
      }

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      setResults(data)

      // Track search event for Meta Pixel
      if (searchQuery && searchQuery.trim()) {
        trackSearch({
          search_string: searchQuery,
          content_category: searchFilters.categories.length > 0 ? searchFilters.categories[0] : undefined
        })
      }

      // Update URL
      const newUrl = `/search?${params}`
      router.replace(newUrl, { scroll: false })
    } catch (error) {
      console.error("Error fetching search results:", error)
    } finally {
      setLoading(false)
    }
  }, [router])

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    setCurrentPage(0)
    fetchResults(query, newFilters, 0)
  }

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchResults(query, filters, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      brands: [],
      categories: [],
      priceRange: [0, 1000],
      subscriptionOnly: false
    }
    setFilters(defaultFilters)
    setCurrentPage(0)
    fetchResults(query, defaultFilters, 0)
  }

  // Update results when URL changes (e.g., from search bar)
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    if (urlQuery !== query) {
      setQuery(urlQuery)
      setCurrentPage(0)
      fetchResults(urlQuery, filters, 0)
    }
  }, [searchParams, query, filters, fetchResults])

  const hasActiveFilters = filters.brands.length > 0 || 
                          filters.categories.length > 0 || 
                          filters.subscriptionOnly ||
                          filters.priceRange[0] > 0 || 
                          filters.priceRange[1] < 1000

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Otsingutulemused
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span>"{query}" kohta leiti</span>
              <span className="font-semibold text-gray-900">{results.total}</span>
              <span>toodet</span>
              {results.processingTimeMS > 0 && (
                <span className="text-sm">({results.processingTimeMS}ms)</span>
              )}
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filtrid
              {hasActiveFilters && (
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full">
                  {filters.brands.length + filters.categories.length + (filters.subscriptionOnly ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <SearchFiltersComponent
                facets={results.facets}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                <span className="ml-3 text-gray-600">Otsime...</span>
              </div>
            )}

            {!loading && results.hits.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tulemusi ei leitud
                </h3>
                <p className="text-gray-600 mb-6">
                  Proovige teistsuguseid märksõnu või muutke filtreid
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                  >
                    Tühista filtrid
                  </button>
                )}
              </div>
            )}

            {!loading && results.hits.length > 0 && (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {results.hits.map((product, index) => (
                    <SearchProductCard
                      key={product.objectID}
                      product={product}
                      priority={index < 8}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {results.pages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: Math.min(results.pages, 7) }, (_, i) => {
                      let pageNum = i
                      if (results.pages > 7) {
                        if (currentPage < 3) {
                          pageNum = i
                        } else if (currentPage > results.pages - 4) {
                          pageNum = results.pages - 7 + i
                        } else {
                          pageNum = currentPage - 3 + i
                        }
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-yellow-400 text-yellow-900"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= results.pages - 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filtrid</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              <SearchFiltersComponent
                facets={results.facets}
                filters={filters}
                onFiltersChange={(newFilters) => {
                  handleFiltersChange(newFilters)
                  setShowMobileFilters(false)
                }}
                onClearFilters={() => {
                  clearFilters()
                  setShowMobileFilters(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 