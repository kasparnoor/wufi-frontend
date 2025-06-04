"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@medusajs/ui"
import { Sparkles, Filter, X, Search, Package, TrendingUp } from "lucide-react"

interface CategoryFiltersProps {
  categoryId: string
  categoryName: string
  initialQuery?: string
}

export default function CategoryFilters({ 
  categoryId, 
  categoryName, 
  initialQuery = "" 
}: CategoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const createQueryString = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    return params.toString()
  }

  const setQueryParams = (updates: Record<string, string | undefined>) => {
    const query = createQueryString(updates)
    router.push(`${pathname}?${query}`)
  }

  const setPriceRange = (min?: string, max?: string) => {
    const updates: Record<string, string | undefined> = {}
    
    if (min) {
      updates["min_price"] = min
    } else {
      updates["min_price"] = undefined
    }
    
    if (max) {
      updates["max_price"] = max
    } else {
      updates["max_price"] = undefined
    }
    
    setQueryParams(updates)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQueryParams({ q: searchQuery })
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setQueryParams({ 
      q: undefined, 
      min_price: undefined, 
      max_price: undefined, 
      sort: undefined 
    })
  }

  const activeSort = searchParams.get("sort") || 'created_at'
  const currentMinPrice = searchParams.get("min_price")
  const currentMaxPrice = searchParams.get("max_price")
  const currentQuery = searchParams.get("q") || ""

  useEffect(() => {
    setSearchQuery(currentQuery)
  }, [currentQuery])

  const hasActiveFilters = currentQuery || currentMinPrice || currentMaxPrice || activeSort !== 'created_at'

  return (
    <div className="space-y-6">
      {/* Search within Category */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-yellow-800" />
            Otsi {categoryName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Täpsema otsingu jaoks
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Otsi ${categoryName.toLowerCase()} tooteid...`}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium py-3 rounded-xl transition-colors"
            >
              Otsi
            </Button>
          </form>
        </div>
      </div>

      {/* Price Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-700" />
            Hind
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Filtreeri hinna järgi
          </p>
        </div>
        <div className="p-6 space-y-3">
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              !currentMinPrice && currentMaxPrice === '20' 
                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                : 'bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-700'
            }`}
            onClick={() => setPriceRange(undefined, '20')}
          >
            Kuni 20€
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              currentMinPrice === '20' && currentMaxPrice === '50'
                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                : 'bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-700'
            }`}
            onClick={() => setPriceRange('20', '50')}
          >
            20€ - 50€
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              currentMinPrice === '50' && !currentMaxPrice
                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                : 'bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-700'
            }`}
            onClick={() => setPriceRange('50', undefined)}
          >
            Üle 50€
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              currentMinPrice === '100' && !currentMaxPrice
                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                : 'bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-700'
            }`}
            onClick={() => setPriceRange('100', undefined)}
          >
            Üle 100€
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-700" />
            Sorteeri
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Vali sobiv järjestus
          </p>
        </div>
        <div className="p-6 space-y-3">
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'created_at' 
                ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                : 'bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
            onClick={() => setQueryParams({ sort: 'created_at' })}
          >
            Uusimad ees
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'price_asc'
                ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                : 'bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
            onClick={() => setQueryParams({ sort: 'price_asc' })}
          >
            Hind: odavamast
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'price_desc'
                ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                : 'bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
            onClick={() => setQueryParams({ sort: 'price_desc' })}
          >
            Hind: kallimast
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'popularity'
                ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                : 'bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
            onClick={() => setQueryParams({ sort: 'popularity' })}
          >
            Populaarsemad
          </Button>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <Button
              variant="secondary"
              size="small"
              className="w-full justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-700"
              onClick={clearAllFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Tühista kõik filtrid
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 