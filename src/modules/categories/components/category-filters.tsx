"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { KrapsButton } from "@lib/components"
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Package, 
  TrendingUp, 
  Star,
  Truck,
  Euro,
  Tag,
  Sparkles,
  CheckCircle,
  Circle,
  SlidersHorizontal
} from "lucide-react"

interface CategoryFiltersProps {
  categoryId: string
  categoryName: string
  initialQuery?: string
}

interface FilterSection {
  key: string
  title: string
  icon: any
  items: FilterItem[]
  isExpanded: boolean
  type: 'checkbox' | 'radio' | 'range'
}

interface FilterItem {
  value: string
  label: string
  count?: number
  active: boolean
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  
  // Filter sections state
  const [filterSections, setFilterSections] = useState<FilterSection[]>([
    {
      key: 'price',
      title: 'Hinnavahemik',
      icon: Euro,
      type: 'radio',
      isExpanded: true,
      items: [
        { value: '0-20', label: 'Kuni 20€', active: false },
        { value: '20-50', label: '20€ - 50€', active: false },
        { value: '50-100', label: '50€ - 100€', active: false },
        { value: '100-200', label: '100€ - 200€', active: false },
        { value: '200+', label: 'Üle 200€', active: false },
      ]
    },
    {
      key: 'brand',
      title: 'Bränd',
      icon: Tag,
      type: 'checkbox',
      isExpanded: true,
      items: [
        { value: 'royal-canin', label: 'Royal Canin', count: 24, active: false },
        { value: 'hills', label: 'Hill\'s', count: 18, active: false },
        { value: 'purina', label: 'Purina', count: 15, active: false },
        { value: 'acana', label: 'Acana', count: 12, active: false },
        { value: 'orijen', label: 'Orijen', count: 8, active: false },
      ]
    },
    {
      key: 'features',
      title: 'Omadused',
      icon: Sparkles,
      type: 'checkbox',
      isExpanded: false,
      items: [
        { value: 'subscription', label: 'Kraps tellimuse saadaval', active: false },

        { value: 'new-arrival', label: 'Uus toode', active: false },
        { value: 'bestseller', label: 'Bestseller', active: false },
      ]
    },
    {
      key: 'rating',
      title: 'Hinnang',
      icon: Star,
      type: 'radio',
      isExpanded: false,
      items: [
        { value: '4+', label: '4+ tärni', active: false },
        { value: '3+', label: '3+ tärni', active: false },
        { value: '2+', label: '2+ tärni', active: false },
      ]
    }
  ])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQueryParams({ q: searchQuery })
  }

  // Real-time search as you type (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParams.get("q") || "")) {
        setQueryParams({ q: searchQuery })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchParams, setQueryParams])

  const handleFilterChange = (sectionKey: string, itemValue: string, checked: boolean) => {
    setFilterSections(prev => prev.map(section => {
      if (section.key !== sectionKey) return section
      
      if (section.type === 'radio') {
        // For radio buttons, only one can be selected
        return {
          ...section,
          items: section.items.map(item => ({
            ...item,
            active: item.value === itemValue ? checked : false
          }))
        }
      } else {
        // For checkboxes, multiple can be selected
        return {
          ...section,
          items: section.items.map(item => 
            item.value === itemValue ? { ...item, active: checked } : item
          )
        }
      }
    }))

    // Update URL params based on filter type
    if (sectionKey === 'price') {
      const [min, max] = itemValue.includes('+') 
        ? [itemValue.replace('+', ''), undefined]
        : itemValue.split('-')
      setQueryParams({ 
        min_price: checked ? min : undefined, 
        max_price: checked ? max : undefined 
      })
    } else {
      // For other filters, create comma-separated lists
      const currentValues = searchParams.get(sectionKey)?.split(',') || []
      const newValues = checked 
        ? [...currentValues, itemValue]
        : currentValues.filter(v => v !== itemValue)
      
      setQueryParams({ 
        [sectionKey]: newValues.length > 0 ? newValues.join(',') : undefined 
      })
    }
  }

  const toggleSection = (sectionKey: string) => {
    setFilterSections(prev => prev.map(section => 
      section.key === sectionKey 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ))
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setPriceMin("")
    setPriceMax("")
    setFilterSections(prev => prev.map(section => ({
      ...section,
      items: section.items.map(item => ({ ...item, active: false }))
    })))
    setQueryParams({ 
      q: undefined, 
      min_price: undefined, 
      max_price: undefined,
      brand: undefined,
      features: undefined,
      rating: undefined,
      sort: undefined 
    })
  }

  const handleCustomPriceRange = () => {
    setQueryParams({ 
      min_price: priceMin || undefined, 
      max_price: priceMax || undefined 
    })
  }

  // Initialize filters from URL params
  useEffect(() => {
    const currentQuery = searchParams.get("q") || ""
    const currentMinPrice = searchParams.get("min_price")
    const currentMaxPrice = searchParams.get("max_price")
    
    setSearchQuery(currentQuery)
    setPriceMin(currentMinPrice || "")
    setPriceMax(currentMaxPrice || "")

    // Update filter sections based on URL params
    setFilterSections(prev => prev.map(section => {
      if (section.key === 'price') {
        const priceRange = currentMinPrice && currentMaxPrice 
          ? `${currentMinPrice}-${currentMaxPrice}`
          : currentMinPrice && !currentMaxPrice
          ? `${currentMinPrice}+`
          : undefined

        return {
          ...section,
          items: section.items.map(item => ({
            ...item,
            active: item.value === priceRange
          }))
        }
      } else {
        const activeValues = searchParams.get(section.key)?.split(',') || []
        return {
          ...section,
          items: section.items.map(item => ({
            ...item,
            active: activeValues.includes(item.value)
          }))
        }
      }
    }))
  }, [searchParams])

  const hasActiveFilters = searchQuery || 
    filterSections.some(section => section.items.some(item => item.active)) ||
    searchParams.get("sort") !== 'created_at'

  const activeFiltersCount = filterSections.reduce((count, section) => 
    count + section.items.filter(item => item.active).length, 0
  ) + (searchQuery ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Otsi ${categoryName.toLowerCase()} tooteid...`}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-yellow-800" />
              <span className="font-medium text-gray-900 text-sm">Kiirfiltrid</span>
              {activeFiltersCount > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-sm text-yellow-800 hover:text-yellow-900 transition-colors"
            >
              Täpsemalt
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Quick price filters */}
          <div className="flex flex-wrap gap-2">
            {filterSections.find(s => s.key === 'price')?.items.slice(0, 3).map(item => (
              <button
                key={item.value}
                onClick={() => handleFilterChange('price', item.value, !item.active)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  item.active
                    ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Popular brand filters */}
            {filterSections.find(s => s.key === 'brand')?.items.slice(0, 2).map(item => (
              <button
                key={item.value}
                onClick={() => handleFilterChange('brand', item.value, !item.active)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  item.active
                    ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
                {item.count && <span className="ml-1 opacity-70">({item.count})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-3">
          {filterSections.map(section => (
            <div key={section.key} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <section.icon className="h-5 w-5 text-yellow-800" />
                  <span className="font-medium text-gray-900">{section.title}</span>
                  {section.items.some(item => item.active) && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      {section.items.filter(item => item.active).length}
                    </span>
                  )}
                </div>
                {section.isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {section.isExpanded && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  {/* Custom price range for price section */}
                  {section.key === 'price' && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Kohandatud vahemik</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 outline-none"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 outline-none"
                        />
                        <KrapsButton
                          variant="secondary"
                          size="small"
                          onClick={handleCustomPriceRange}
                          className="px-3 py-2 text-sm"
                        >
                          OK
                        </KrapsButton>
                      </div>
                    </div>
                  )}

                  {section.items.map(item => (
                    <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type={section.type === 'radio' ? 'radio' : 'checkbox'}
                          name={section.type === 'radio' ? section.key : undefined}
                          checked={item.active}
                          onChange={(e) => handleFilterChange(section.key, item.value, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.active 
                            ? 'border-yellow-400 bg-yellow-400' 
                            : 'border-gray-300 group-hover:border-yellow-400'
                        }`}>
                          {item.active && (
                            section.type === 'radio' 
                              ? <div className="w-2 h-2 bg-white rounded-full" />
                              : <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex-1">
                        {item.label}
                      </span>
                      {item.count && (
                        <span className="text-xs text-gray-500">({item.count})</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sort Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-yellow-800" />
            <span className="font-medium text-gray-900 text-sm">Sorteeri</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'created_at', label: 'Uusimad' },
              { value: 'price_asc', label: 'Hind ↑' },
              { value: 'price_desc', label: 'Hind ↓' },
              { value: 'popularity', label: 'Populaarsus' },
            ].map(option => {
              const isActive = (searchParams.get("sort") || 'created_at') === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setQueryParams({ sort: option.value })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4">
            <KrapsButton
              variant="secondary"
              size="small"
              onClick={clearAllFilters}
              className="w-full justify-center text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <X className="h-4 w-4 mr-2" />
              Tühista kõik filtrid ({activeFiltersCount})
            </KrapsButton>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <KrapsButton
          variant="secondary"
          onClick={() => setShowMobileFilters(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtrid
          {activeFiltersCount > 0 && (
            <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
              {activeFiltersCount}
            </span>
          )}
        </KrapsButton>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <button 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
            aria-label="Sulge filtrid"
          />
          
          {/* Drawer */}
          <div className="relative w-full bg-white rounded-t-2xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-900">Filtrid</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              <FilterContent />
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
              <KrapsButton
                variant="primary"
                onClick={() => setShowMobileFilters(false)}
                className="w-full"
              >
                Rakenda filtrid
              </KrapsButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 