"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { SearchResponse } from "../../../../types/search"
import { LocalizedClientLink } from "@lib/components"
import { useDebounce } from "../../../../lib/hooks/use-debounce"
import { createPortal } from "react-dom"

interface SearchBarProps {
  isScrolled?: boolean
  isHomePage?: boolean
  className?: string
  compact?: boolean
}

// Client-side search function
async function fetchSearchSuggestions(query: string, limit: number = 5): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      page: "0"
    })

    const response = await fetch(`/api/search?${params}`)
    if (!response.ok) {
      throw new Error('Search failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return {
      query: "",
      hits: [],
      total: 0,
      page: 0,
      pages: 0,
      facets: { brand: {}, categories: {} },
      processingTimeMS: 0
    }
  }
}

export default function SearchBar({ 
  isScrolled = false, 
  isHomePage = false,
  className = "",
  compact = false
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Generate unique ID for this search instance
  const searchId = useMemo(() => `search-${Math.random().toString(36).substr(2, 9)}`, [])

  // Determine if this search bar is in a sticky context (header) vs hero
  const isInStickyHeader = !isHomePage || isScrolled
  const shouldUsePortal = !isInStickyHeader // Use portal for hero search to avoid overflow

  // Set mounted state for portal rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update dropdown position for portal rendering
  const updateDropdownPosition = useCallback(() => {
    if (shouldUsePortal && searchRef.current && isOpen) {
      const rect = searchRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [shouldUsePortal, isOpen])

  // Update position on scroll/resize when using portal
  useEffect(() => {
    if (shouldUsePortal && isOpen) {
      updateDropdownPosition()
      
      const handleScroll = () => updateDropdownPosition()
      const handleResize = () => updateDropdownPosition()
      
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize, { passive: true })
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [shouldUsePortal, isOpen, updateDropdownPosition])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Check both the search container and dropdown (whether portal or not)
      const isClickOutside = searchRef.current && !searchRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
        
      if (isClickOutside) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length >= 2) {
        setLoading(true)
        try {
          const results = await fetchSearchSuggestions(debouncedQuery, 5)
          setSuggestions(results)
          setIsOpen(true)
          if (shouldUsePortal) {
            updateDropdownPosition()
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setSuggestions(null)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions(null)
        setIsOpen(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, shouldUsePortal, updateDropdownPosition])

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      setIsOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchButtonClick = () => {
    handleSearch()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.title)
    setIsOpen(false)
    router.push(`/products/${suggestion.handle}`)
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions(null)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Dropdown content
  const dropdownContent = isOpen && (
    <div 
      ref={dropdownRef}
      data-search-dropdown={searchId}
      className={`bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden ${
        isInStickyHeader ? 'z-50' : 'z-[9999]'
      }`}
      style={shouldUsePortal ? {
        position: 'absolute',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        maxHeight: '400px'
      } : {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '8px'
      }}
    >
      {loading && (
        <div className="p-6 text-center text-gray-500">
          <div className="animate-spin h-6 w-6 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-3 text-sm">Otsime...</p>
        </div>
      )}

      {!loading && suggestions && suggestions.hits.length > 0 && (
        <>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Tooted</h3>
          </div>
          
          <div className="py-2 max-h-64 overflow-y-auto">
            {suggestions.hits.map((hit) => (
              <button
                key={hit.objectID}
                onClick={() => handleSuggestionClick(hit)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {hit.thumbnail && (
                    <img 
                      src={hit.thumbnail} 
                      alt={hit.title}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-yellow-800 transition-colors">
                      {hit.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {hit.brand && `${hit.brand} • `}€{hit.price_eur?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => handleSearch()}
              className="w-full text-left text-sm font-medium text-yellow-800 hover:text-yellow-900 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Kuva kõik tulemused "{query}" kohta
            </button>
          </div>
        </>
      )}

      {!loading && suggestions && suggestions.hits.length === 0 && query.length >= 2 && (
        <div className="p-6 text-center text-gray-500">
          <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium">Tulemusi ei leitud</p>
          <p className="text-xs mt-1">Proovige teistsuguseid märksõnu</p>
        </div>
      )}
    </div>
  )

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input with Button */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-4 w-4 transition-colors ${
            isScrolled || !isHomePage ? "text-gray-400 group-focus-within:text-yellow-500" : "text-gray-400 group-focus-within:text-yellow-500"
          }`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          aria-label="Otsi tooteid"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => {
            if (suggestions && suggestions.hits.length > 0) {
              setIsOpen(true)
              if (shouldUsePortal) {
                updateDropdownPosition()
              }
            }
          }}
          placeholder="Otsi tooteid..."
          className={`w-full pl-10 pr-20 ${compact ? 'py-2' : 'py-2.5'} rounded-xl text-sm transition-all duration-200 border ${
            isScrolled || !isHomePage
              ? "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:shadow-sm"
              : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:shadow-sm"
          }`}
        />

        {/* Right side buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={clearSearch}
              className={`p-1 mr-1 rounded-lg transition-colors ${
                isScrolled || !isHomePage ? "text-gray-400 hover:text-gray-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleSearchButtonClick}
            className="mr-2 p-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors"
          >
            <Search className="h-4 w-4 text-black" />
          </button>
        </div>
      </div>

      {/* Render dropdown - use portal for hero, direct child for header */}
      {shouldUsePortal && mounted ? (
        typeof document !== 'undefined' && createPortal(dropdownContent, document.body)
      ) : (
        <div className="relative">
          {dropdownContent}
        </div>
      )}
    </div>
  )
} 