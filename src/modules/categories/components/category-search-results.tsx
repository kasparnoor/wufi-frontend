"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchResponse, SearchFilters } from "../../../types/search"
import SearchProductCard from "../../search/components/search-product-card"
import { ChevronLeft, ChevronRight, Search, Package } from "lucide-react"

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
  
  const query = (searchParams.q as string) || ""
  const currentPage = Number(searchParams.page) || 0
  const sort = (searchParams.sort as string) || "created_at"
  const minPrice = searchParams.min_price as string | undefined
  const maxPrice = searchParams.max_price as string | undefined

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
  }, [categoryId, query, currentPage, sort, minPrice, maxPrice])

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

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Viga andmete laadimisel
        </h3>
        <p className="text-gray-600">
          Palun proovige lehte uuesti laadida
        </p>
      </div>
    )
  }

  const hasFilters = query || minPrice || maxPrice || sort !== 'created_at'

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-yellow-800" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {query ? `"${query}" otsingu tulemused` : `${categoryName} tooted`}
            </h3>
            {hasFilters && (
              <p className="text-sm text-gray-600">
                Filtritega
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{results.total}</span>
          <span>toodet leitud</span>
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
              ? `"${query}" päringule ei leitud tulemusi kategoorias ${categoryName}`
              : `Kategoorias ${categoryName} ei leitud praeguste filtritega tulemusi`
            }
          </p>
          <div className="text-sm text-gray-500">
            Proovige:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Teistsuguseid märksõnu</li>
              <li>Vähem filtreid</li>
              <li>Kontrollige õigekirja</li>
            </ul>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {results.hits.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Eelmine</span>
              </button>

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
                          ? "bg-yellow-400 text-yellow-900"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= results.pages - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Järgmine</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 