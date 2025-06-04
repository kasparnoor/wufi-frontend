"use client"

import { useState } from "react"
import { SearchFacets, SearchFilters } from "../../../../types/search"
import { ChevronDown, ChevronUp, X } from "lucide-react"

interface SearchFiltersProps {
  facets: SearchFacets
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
}

export default function SearchFiltersComponent({
  facets,
  filters,
  onFiltersChange,
  onClearFilters
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    categories: true,
    price: true,
    subscription: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand)
    
    onFiltersChange({
      ...filters,
      brands: newBrands
    })
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category)
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    })
  }

  const handlePriceChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: [min, max]
    })
  }

  const handleSubscriptionChange = (subscriptionOnly: boolean) => {
    onFiltersChange({
      ...filters,
      subscriptionOnly
    })
  }

  const hasActiveFilters = filters.brands.length > 0 || 
                          filters.categories.length > 0 || 
                          filters.subscriptionOnly ||
                          filters.priceRange[0] > 0 || 
                          filters.priceRange[1] < 1000

  // Format category names for display
  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtrid</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-yellow-800 hover:text-yellow-800 font-medium flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Tühista kõik
          </button>
        )}
      </div>

      {/* Subscription Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('subscription')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="font-medium text-gray-900">Püsitellimus</h4>
          {expandedSections.subscription ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.subscription && (
          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.subscriptionOnly}
                onChange={(e) => handleSubscriptionChange(e.target.checked)}
                className="rounded border-gray-300 text-yellow-800 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">Ainult püsitellimuse tooted</span>
            </label>
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="font-medium text-gray-900">Hind</h4>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0] || ''}
                onChange={(e) => handlePriceChange(Number(e.target.value) || 0, filters.priceRange[1])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-yellow-500 focus:border-yellow-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1] === 1000 ? '' : filters.priceRange[1]}
                onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value) || 1000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div className="text-xs text-gray-500">
              €{filters.priceRange[0]} - €{filters.priceRange[1] === 1000 ? '∞' : filters.priceRange[1]}
            </div>
          </div>
        )}
      </div>

      {/* Brand Filter */}
      {Object.keys(facets.brand).length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Bränd</h4>
            {expandedSections.brands ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.brands && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(facets.brand)
                .sort(([,a], [,b]) => b - a)
                .map(([brand, count]) => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => handleBrandChange(brand, e.target.checked)}
                    className="rounded border-gray-300 text-yellow-800 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{brand}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      {Object.keys(facets.categories).length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Kategooria</h4>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.categories && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(facets.categories)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="rounded border-gray-300 text-yellow-800 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {formatCategoryName(category)}
                  </span>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 