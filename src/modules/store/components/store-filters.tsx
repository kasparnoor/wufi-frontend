"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, Filter } from "lucide-react"
import { KrapsButton } from "@lib/components"

interface StoreFiltersProps {
  initialQuery?: string
}

export default function StoreFilters({ 
  initialQuery = ""
}: StoreFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Memoize search params values to prevent infinite re-renders
  const searchParamsValues = useMemo(() => ({
    brands: searchParams.get("brands"),
    features: searchParams.get("features"), 
    min_price: searchParams.get("min_price"),
    max_price: searchParams.get("max_price"),
    q: searchParams.get("q")
  }), [searchParams.toString()])

  // Update URL with new search params
  const setQueryParams = (updates: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams.toString())
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    // Navigate to updated URL
    const queryString = current.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname
    router.push(url)
  }

  // Real-time search as you type (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParamsValues.q || "")) {
        setQueryParams({ q: searchQuery })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchParamsValues.q])

  // Initialize search query from URL
  useEffect(() => {
    const urlQuery = searchParamsValues.q
    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery)
    }
  }, [searchParamsValues.q, searchQuery])

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Otsi tooteid..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <KrapsButton
          onClick={() => setShowMobileFilters(true)}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtrid
        </KrapsButton>
      </div>

      {/* Filters Section - Placeholder */}
      <div className="hidden lg:block bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filtrid</h3>
          <button 
            onClick={() => setQueryParams({ brands: undefined, features: undefined, min_price: undefined, max_price: undefined })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Eemalda kõik
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500 py-8 text-center">
            Filtrid saadaval peagi...
          </p>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/25" 
            onClick={() => setShowMobileFilters(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowMobileFilters(false)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close filter modal"
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filtrid</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="sr-only">Sulge</span>
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 py-8 text-center">
                Filtrid saadaval peagi...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 