"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@medusajs/ui"
import { clx } from "@medusajs/ui"
import { Search } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Get country code from pathname
  const countryCode = pathname.split('/')[1] || 'ee'

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
        "/store/products",
        {
          method: "GET",
          query: {
            q: searchQuery,
            limit: 12,
          },
        }
      )

      // Always redirect to pood with search query, even if no results
      router.push(`/${countryCode}/pood?q=${encodeURIComponent(searchQuery)}`)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full mb-12">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Otsi tooteid..."
          className="w-full px-6 py-4 rounded-2xl border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition-all duration-300"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-400 p-2 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="h-5 w-5 text-black" />
        </button>
      </div>
    </form>
  )
} 