"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@medusajs/ui"
import { Sparkles } from "@medusajs/icons"

export type SortOptions = "created_at" | "price_asc" | "price_desc" | "popularity"

const RefinementList = ({ 
  sortBy = "created_at",
  categoryId,
  'data-testid': dataTestId 
}: { 
  sortBy?: SortOptions
  categoryId?: string
  'data-testid'?: string 
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams)
      
      // First, clear any existing price range parameters
      params.delete("variants.prices.amount.lt")
      params.delete("variants.prices.amount.gte")
      
      // Then set the new parameters
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (updates: Record<string, string | undefined>) => {
    const query = createQueryString(updates)
    router.push(`${pathname}?${query}`)
  }

  const setPriceRange = (min?: string, max?: string) => {
    const updates: Record<string, string | undefined> = {}
    
    // Convert prices to cents for Medusa
    if (min) {
      updates["variants.prices.amount.gte"] = (parseInt(min) * 100).toString()
    } else {
      updates["variants.prices.amount.gte"] = undefined
    }
    
    if (max) {
      updates["variants.prices.amount.lt"] = (parseInt(max) * 100).toString()
    } else {
      updates["variants.prices.amount.lt"] = undefined
    }
    
    setQueryParams(updates)
  }

  const activeSort = searchParams.get("sort") || 'created_at'
  const currentPriceLt = searchParams.get("variants.prices.amount.lt")
  const currentPriceGte = searchParams.get("variants.prices.amount.gte")

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Filter Section */}
      <div>
        <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-6 py-2.5 rounded-full border border-yellow-400/30">
          <Sparkles className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-700 font-semibold">Filtrid</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="small"
            className={`bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-1 ${
              !currentPriceGte && currentPriceLt === (20 * 100).toString() ? 'bg-yellow-400 text-black' : ''
            }`}
            onClick={() => setPriceRange(undefined, '20')}
          >
            Kuni 20€
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-1 ${
              currentPriceGte === (20 * 100).toString() && currentPriceLt === (50 * 100).toString() ? 'bg-yellow-400 text-black' : ''
            }`}
            onClick={() => setPriceRange('20', '50')}
          >
            20€ - 50€
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-1 ${
              currentPriceGte === (50 * 100).toString() && !currentPriceLt ? 'bg-yellow-400 text-black' : ''
            }`}
            onClick={() => setPriceRange('50', undefined)}
          >
            Üle 50€
          </Button>
          {(currentPriceLt || currentPriceGte) && (
            <Button
              variant="secondary"
              size="small"
              className="bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-1"
              onClick={() => setPriceRange()}
            >
              × Tühista filtrid
            </Button>
          )}
        </div>
      </div>

      {/* Sort Section */}
      <div>
        <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-6 py-2.5 rounded-full border border-yellow-400/30">
          <Sparkles className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-700 font-semibold">Sorteeri</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="small"
            className={`rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'created_at' 
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 border-transparent hover:-translate-y-1'
                : 'bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 text-gray-700 hover:-translate-y-1'
            }`}
            onClick={() => setQueryParams({ sort: 'created_at' })}
          >
            Uusimad ees
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'price_asc'
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 border-transparent hover:-translate-y-1'
                : 'bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 text-gray-700 hover:-translate-y-1'
            }`}
            onClick={() => setQueryParams({ sort: 'price_asc' })}
          >
            Hind: odavamast
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'price_desc'
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 border-transparent hover:-translate-y-1'
                : 'bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 text-gray-700 hover:-translate-y-1'
            }`}
            onClick={() => setQueryParams({ sort: 'price_desc' })}
          >
            Hind: kallimast
          </Button>
          <Button
            variant="secondary"
            size="small"
            className={`rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
              activeSort === 'popularity'
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 border-transparent hover:-translate-y-1'
                : 'bg-white hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 text-gray-700 hover:-translate-y-1'
            }`}
            onClick={() => setQueryParams({ sort: 'popularity' })}
          >
            Populaarsemad
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RefinementList
