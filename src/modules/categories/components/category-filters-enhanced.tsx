"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  SlidersHorizontal,
  Weight
} from "lucide-react"

interface FilterItem {
  value: string
  label: string
  count: number
  active: boolean
  children?: FilterItem[]
  isParent?: boolean
  isExpanded?: boolean
  level?: number
  hasChildren?: boolean
}

interface FilterSection {
  key: string
  title: string
  icon: React.ComponentType<any>
  type: 'checkbox' | 'radio'
  isExpanded: boolean
  items: FilterItem[]
}

interface CategoryFiltersEnhancedProps {
  categoryId: string
  initialQuery?: string
  facets?: {
    brands: Record<string, number>
    categories: Record<string, number>
    price_ranges: Record<string, number>
    weight_ranges: Record<string, number>
    features: Record<string, number>
  }
  categories?: any[]
}

export default function CategoryFiltersEnhanced({ 
  categoryId,
  initialQuery = "",
  facets = { brands: {}, categories: {}, price_ranges: {}, weight_ranges: {}, features: {} },
  categories = []
}: CategoryFiltersEnhancedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Memoize search params values to prevent infinite re-renders
  const searchParamsValues = useMemo(() => ({
    brands: searchParams.get("brands"),
    features: searchParams.get("features"),
    categories: searchParams.get("categories"),
    min_price: searchParams.get("min_price"),
    max_price: searchParams.get("max_price"),
    weight_ranges: searchParams.get("weight_ranges"),
    q: searchParams.get("q")
  }), [searchParams.toString()])

  // Memoize facets to prevent infinite re-renders when facets object reference changes
  const memoizedFacets = useMemo(() => facets || { brands: {}, categories: {}, price_ranges: {}, weight_ranges: {}, features: {} }, [
    JSON.stringify(facets?.brands || {}),
    JSON.stringify(facets?.features || {}),
    JSON.stringify(facets?.price_ranges || {}),
    JSON.stringify(facets?.weight_ranges || {}),
    JSON.stringify(facets?.categories || {})
  ])
  
  // Estonian brand labels
  const BRAND_LABELS: Record<string, string> = {
    'orijen': 'Orijen',
    'royal-canin': 'Royal Canin',
    'hills': 'Hill\'s',
    'purina': 'Purina',
    'chappi': 'Chappi',
    'acana': 'Acana',
    'iams': 'Iams',
    'whiskas': 'Whiskas',
    'felix': 'Felix',
    'sheba': 'Sheba'
  }

  const FEATURE_LABELS: Record<string, string> = {
    'subscription': 'Püsitellimus',
    'new-arrival': 'Uus toode',
    'bestseller': 'Bestseller',
    'premium': 'Premium kvaliteet'
  }

  // Create category mapping from ID to name and organize hierarchy
  const CATEGORY_MAP: Record<string, string> = useMemo(() => {
    return categories.reduce((acc: Record<string, string>, category: any) => {
      acc[category.id] = category.name
      return acc
    }, {})
  }, [categories])

  // Recursive function to build category tree
  const buildCategoryTree = useCallback((parentId: string | null = null, level: number = 0): any[] => {
    return categories
      .filter(cat => (parentId === null ? !cat.parent_category : cat.parent_category?.id === parentId))
      .map(category => ({
        id: category.id,
        name: category.name,
        level,
        children: buildCategoryTree(category.id, level + 1)
      }))
  }, [categories])

  // Create hierarchical category structure
  const CATEGORY_HIERARCHY = useMemo(() => {
    return buildCategoryTree()
  }, [categories, buildCategoryTree])
  
  // Filter sections state - add categories section when in store mode (categoryId is empty)
  const [filterSections, setFilterSections] = useState<FilterSection[]>(() => {
    const baseSections = [
      {
        key: 'price',
        title: 'Hinnavahemik',
        icon: Euro,
        type: 'radio' as const,
        isExpanded: true,
        items: [
          { value: '0-20', label: 'Kuni 20€', count: 0, active: false },
          { value: '20-50', label: '20€ - 50€', count: 0, active: false },
          { value: '50-100', label: '50€ - 100€', count: 0, active: false },
          { value: '100+', label: 'Üle 100€', count: 0, active: false },
        ]
      },
      {
        key: 'weight',
        title: 'Kaal',
        icon: Weight,
        type: 'checkbox' as const,
        isExpanded: true,
        items: []
      },
      {
        key: 'brands',
        title: 'Bränd',
        icon: Tag,
        type: 'checkbox' as const,
        isExpanded: true,
        items: []
      },
      {
        key: 'features',
        title: 'Omadused',
        icon: Sparkles,
        type: 'checkbox' as const,
        isExpanded: false,
        items: []
      }
    ]

    // Add categories section
    if (!categoryId) {
      // Store mode - show all categories
      baseSections.unshift({
        key: 'categories',
        title: 'Kategooriad',
        icon: Package,
        type: 'checkbox' as const,
        isExpanded: true,
        items: []
      })
    } else {
      // Category page mode - show subcategories of current category
      baseSections.unshift({
        key: 'categories',
        title: 'Kategooria',
        icon: Package,
        type: 'checkbox' as const,
        isExpanded: true,
        items: []
      })
    }

    return baseSections
  })

  // Update filter sections based on facets
  useEffect(() => {
    console.log("🔍 Updating filters with facets:", memoizedFacets)
    
    setFilterSections(prevSections => prevSections.map(section => {
      if (section.key === 'categories') {
        const selectedCategories = searchParamsValues.categories?.split(',') || []
        
        if (!categoryId) {
          // Store mode - show all categories in hierarchical structure
          const buildFilterItems = (categoryNodes: any[], level: number = 0): FilterItem[] => {
            return categoryNodes
              .map(node => {
                const count = (memoizedFacets.categories || {})[node.id] || 0
                const hasChildren = node.children && node.children.length > 0
                
                // Recursively build children
                const childItems = hasChildren ? buildFilterItems(node.children, level + 1) : []
                
                // Calculate total count including children
                const totalCount = count + childItems.reduce((sum, child) => sum + (typeof child.count === 'number' ? child.count : 0), 0)
                
                return {
                  value: node.id,
                  label: node.name,
                  count: totalCount,
                  active: selectedCategories.includes(node.id),
                  isParent: level === 0,
                  hasChildren,
                  isExpanded: false, // Start collapsed - smart expansion on demand
                  level,
                  children: childItems.filter(child => child.count > 0) // Only show children with products
                }
              })
              .filter(item => item.count > 0) // Only show items with products
              .sort((a, b) => b.count! - a.count!) // Sort by count descending
          }
          
          const hierarchicalItems = buildFilterItems(CATEGORY_HIERARCHY)
          return { ...section, items: hierarchicalItems }
        } else {
          // Category page mode - show subcategories of current category
          const currentCategory = categories.find(cat => cat.id === categoryId)
          if (currentCategory) {
            // Find all subcategories of the current category
            const subcategories = categories.filter(cat => 
              cat.parent_category?.id === categoryId
            )
            
            const subcategoryItems = subcategories
              .map(subcat => ({
                value: subcat.id,
                label: subcat.name,
                count: (memoizedFacets.categories || {})[subcat.id] || 0,
                active: selectedCategories.includes(subcat.id),
                isParent: false,
                hasChildren: false,
                isExpanded: false,
                level: 0
              }))
              .filter(item => item.count > 0) // Only show subcategories with products
              .sort((a, b) => b.count! - a.count!) // Sort by count descending
            
            return { ...section, items: subcategoryItems }
          }
          return { ...section, items: [] }
        }
      }
      
      if (section.key === 'brands') {
        const brandItems = Object.entries(memoizedFacets.brands || {}).map(([brand, count]) => ({
          value: brand,
          label: BRAND_LABELS[brand] || brand.charAt(0).toUpperCase() + brand.slice(1),
          count: count,
          active: searchParamsValues.brands?.split(',').includes(brand) || false
        })).sort((a, b) => b.count - a.count)
        
        console.log("🏷️ Brand items:", brandItems)
        return { ...section, items: brandItems }
      }
      
      if (section.key === 'features') {
        const featureItems = Object.entries(memoizedFacets.features || {}).map(([feature, count]) => ({
          value: feature,
          label: FEATURE_LABELS[feature] || feature.charAt(0).toUpperCase() + feature.slice(1),
          count: count,
          active: searchParamsValues.features?.split(',').includes(feature) || false
        })).sort((a, b) => b.count - a.count)
        
        console.log("✨ Feature items:", featureItems)
        return { ...section, items: featureItems }
      }
      
      if (section.key === 'price') {
        // Update price range counts and active states
        const updatedItems = section.items.map(item => {
          const count = (memoizedFacets.price_ranges || {})[item.value] || 0
          const minPrice = searchParamsValues.min_price
          const maxPrice = searchParamsValues.max_price
          
          let isActive = false
          if (item.value === '0-20' && !minPrice && maxPrice === '20') isActive = true
          else if (item.value === '20-50' && minPrice === '20' && maxPrice === '50') isActive = true
          else if (item.value === '50-100' && minPrice === '50' && maxPrice === '100') isActive = true
          else if (item.value === '100+' && minPrice === '100' && !maxPrice) isActive = true
          
          return { ...item, count, active: isActive }
        })
        
        console.log("💰 Price items:", updatedItems)
        return { ...section, items: updatedItems }
      }
      
      if (section.key === 'weight') {
        // Create weight range items from backend facets
        const weightItems = Object.entries(memoizedFacets.weight_ranges || {})
          .map(([range, count]) => ({
            value: range,
            label: range === 'no-weight' ? 'Kaal määramata' : range,
            count: count,
            active: searchParamsValues.weight_ranges?.split(',').includes(range) || false
          }))
          .sort((a, b) => {
            // Custom sort order for weight ranges
            const order = ['0-500g', '500g-1kg', '1kg-2kg', '2kg-5kg', '5kg-10kg', '10kg-15kg', '15kg+', 'no-weight']
            const aIndex = order.indexOf(a.value)
            const bIndex = order.indexOf(b.value)
            if (aIndex === -1 && bIndex === -1) return a.value.localeCompare(b.value)
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            return aIndex - bIndex
          })
        
        console.log("⚖️ Weight items:", weightItems)
        return { ...section, items: weightItems }
      }
      
      return section
    }))
  }, [memoizedFacets, searchParamsValues])

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
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQueryParams({ q: searchQuery })
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

  const toggleFilterItem = (sectionKey: string, itemValue: string) => {
    const section = filterSections.find(s => s.key === sectionKey)
    if (!section) return

    if (section.type === 'radio') {
      // Radio buttons - only one can be active
      if (sectionKey === 'price') {
        // Handle price ranges properly
        if (itemValue === '100+') {
          setQueryParams({
            min_price: '100',
            max_price: undefined
          })
        } else {
          const [min, max] = itemValue.split('-')
          setQueryParams({
            min_price: min === '0' ? undefined : min,
            max_price: max || undefined
          })
        }
      }
    } else {
      // Checkbox - multiple can be active
      if (sectionKey === 'brands') {
        const currentBrands = searchParams.get("brands")?.split(',') || []
        const isActive = currentBrands.includes(itemValue)
        
        const newBrands = isActive
          ? currentBrands.filter(b => b !== itemValue)
          : [...currentBrands, itemValue]
        
        setQueryParams({
          brands: newBrands.length > 0 ? newBrands.join(',') : undefined
        })
      } else if (sectionKey === 'features') {
        const currentFeatures = searchParams.get("features")?.split(',') || []
        const isActive = currentFeatures.includes(itemValue)
        
        const newFeatures = isActive
          ? currentFeatures.filter(f => f !== itemValue)
          : [...currentFeatures, itemValue]
        
        setQueryParams({
          features: newFeatures.length > 0 ? newFeatures.join(',') : undefined
        })
      } else if (sectionKey === 'weight') {
        const currentWeightRanges = searchParams.get("weight_ranges")?.split(',') || []
        const isActive = currentWeightRanges.includes(itemValue)
        
        const newWeightRanges = isActive
          ? currentWeightRanges.filter(w => w !== itemValue)
          : [...currentWeightRanges, itemValue]
        
        setQueryParams({
          weight_ranges: newWeightRanges.length > 0 ? newWeightRanges.join(',') : undefined
        })
      } else if (sectionKey === 'categories') {
        // Check if we're on a category page (categoryId exists)
        if (categoryId) {
          // On category page - redirect to subcategory page instead of filtering
          const subcategory = categories.find(cat => cat.id === itemValue)
          if (subcategory?.handle) {
            router.push(`/ee/categories/${subcategory.handle}`, { scroll: false })
            return
          }
        }
        
        // Store page - use normal filtering behavior
        const currentCategories = searchParams.get("categories")?.split(',') || []
        const isActive = currentCategories.includes(itemValue)
        
        const newCategories = isActive
          ? currentCategories.filter(c => c !== itemValue)
          : [...currentCategories, itemValue]
        
        setQueryParams({
          categories: newCategories.length > 0 ? newCategories.join(',') : undefined
        })
      }
    }
  }

  const clearAllFilters = () => {
    setQueryParams({
      q: undefined,
      categories: undefined,
      min_price: undefined,
      max_price: undefined,
      weight_ranges: undefined,
      brands: undefined,
      features: undefined,
      page: undefined
    })
    setSearchQuery("")
  }

  const toggleSection = (sectionKey: string) => {
    setFilterSections(prev => prev.map(section => 
      section.key === sectionKey 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ))
  }

  // Smart category expansion - expands clicked category, collapses siblings at same level
  const toggleCategoryExpansion = (sectionKey: string, categoryValue: string) => {
    setFilterSections(prev => prev.map(section => {
      if (section.key !== sectionKey) return section
      
      const updateItemExpansion = (items: FilterItem[]): FilterItem[] => {
        return items.map(item => {
          if (item.value === categoryValue) {
            // Toggle the clicked category
            return { ...item, isExpanded: !item.isExpanded }
          }
          
          // For items at the same level, collapse them when another is being expanded
          if (item.level !== undefined && item.children) {
            return { ...item, children: updateItemExpansion(item.children) }
          }
          
          return item
        })
      }
      
      return { ...section, items: updateItemExpansion(section.items) }
    }))
  }

  // Recursive category item component
  const CategoryItem = ({ item, sectionKey, sectionType, level = 0 }: {
    item: FilterItem
    sectionKey: string
    sectionType: 'checkbox' | 'radio'
    level?: number
  }) => {
    const indentClass = level > 0 ? `ml-${level * 4}` : ''
    const hasChildren = item.children && item.children.length > 0
    
    return (
      <div className={`${indentClass}`}>
        <div className="flex items-center justify-between">
          {/* Category selection area */}
          <div
            onClick={() => {
              toggleFilterItem(sectionKey, item.value)
              // If this category has children and is not currently expanded, expand it
              if (hasChildren && !item.isExpanded) {
                toggleCategoryExpansion(sectionKey, item.value)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleFilterItem(sectionKey, item.value)
                // If this category has children and is not currently expanded, expand it
                if (hasChildren && !item.isExpanded) {
                  toggleCategoryExpansion(sectionKey, item.value)
                }
              }
            }}
            role="button"
            tabIndex={0}
            className={`flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1 ${
              item.isParent ? 'font-medium' : ''
            }`}
          >
            {sectionType === 'checkbox' ? (
              item.active ? (
                <CheckCircle className={`h-${level === 0 ? '5' : '4'} w-${level === 0 ? '5' : '4'} text-yellow-600`} />
              ) : (
                <Circle className={`h-${level === 0 ? '5' : '4'} w-${level === 0 ? '5' : '4'} text-gray-400`} />
              )
            ) : (
              <div className={`h-${level === 0 ? '4' : '3'} w-${level === 0 ? '4' : '3'} rounded-full border-2 ${
                item.active 
                  ? 'border-yellow-600 bg-yellow-600' 
                  : 'border-gray-300'
              }`}>
                {item.active && (
                  <div className={`h-${level === 0 ? '2' : '1.5'} w-${level === 0 ? '2' : '1.5'} bg-white rounded-full m-0.5`} />
                )}
              </div>
            )}
            <span className={`text-sm ${
              item.active ? 'font-medium text-gray-900' : level === 0 ? 'text-gray-700' : 'text-gray-600'
            }`}>
              {item.label}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {item.count}
            </span>
          </div>
          
          {/* Expand/collapse button for categories with children */}
          {hasChildren && (
            <button
              onClick={() => toggleCategoryExpansion(sectionKey, item.value)}
              className="p-1 hover:bg-gray-100 rounded transition-colors ml-2"
            >
              {item.isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
        
        {/* Recursive children */}
        {hasChildren && item.isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children!.map((child) => (
              <CategoryItem
                key={child.value}
                item={child}
                sectionKey={sectionKey}
                sectionType={sectionType}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Otsi tooteid..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </form>
      </div>

      {/* Clear All Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtrid</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
        >
          Eemalda kõik
        </button>
      </div>

      {/* Filter Sections - Only show sections with items */}
      {filterSections
        .filter((section) => section.items.length > 0)
        .map((section) => (
        <div key={section.key} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection(section.key)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <section.icon className="h-5 w-5 text-yellow-700" />
              <span className="font-medium text-gray-900">{section.title}</span>
            </div>
            {section.isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {section.isExpanded && (
            <div className="p-4 space-y-2 bg-white">
              {section.key === 'categories' ? (
                // Use recursive CategoryItem for categories
                section.items.map((item) => (
                  <CategoryItem
                    key={item.value}
                    item={item}
                    sectionKey={section.key}
                    sectionType={section.type}
                    level={0}
                  />
                ))
              ) : (
                // Use simple items for other filters
                section.items.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => toggleFilterItem(section.key, item.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleFilterItem(section.key, item.value)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {section.type === 'checkbox' ? (
                        item.active ? (
                          <CheckCircle className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )
                      ) : (
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          item.active 
                            ? 'border-yellow-600 bg-yellow-600' 
                            : 'border-gray-300'
                        }`}>
                          {item.active && (
                            <div className="h-2 w-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                      )}
                      <span className={`text-sm ${
                        item.active ? 'font-medium text-gray-900' : 'text-gray-700'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <KrapsButton
          onClick={() => setShowMobileFilters(true)}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtrid
        </KrapsButton>
      </div>

      {/* Mobile Filter Modal */}
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
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filtrid</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  )
} 