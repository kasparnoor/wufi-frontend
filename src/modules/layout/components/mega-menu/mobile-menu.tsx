"use client"

import { useState } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { LocalizedClientLink } from "@lib/components"
import Image from "next/image"

interface MobileCategoriesMenuProps {
  categories: HttpTypes.StoreProductCategory[]
  onClose: () => void
  className?: string
}

const MobileCategoriesMenu = ({ categories, onClose, className }: MobileCategoriesMenuProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Filter to top-level categories
  const topLevelCategories = categories.filter(cat => !cat.parent_category)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Sparkles className="h-4 w-4 text-yellow-800" />
        <span className="text-sm font-semibold text-yellow-800">Kategooriad</span>
      </div>

      {/* Categories List */}
      {topLevelCategories.map((category) => {
        const metadata = category.metadata as { image?: string, thumbnail?: string }
        // Use thumbnail if available, otherwise fall back to image
        const imageUrl = metadata?.thumbnail || metadata?.image
        const hasChildren = category.category_children && category.category_children.length > 0
        const isExpanded = expandedCategory === category.id

        return (
          <div key={category.id} className="space-y-1">
            {/* Main Category */}
            <div className="flex items-center">
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="flex-1 flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-yellow-50 transition-colors"
                onClick={onClose}
              >
                {imageUrl && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {category.name}
                  </p>
                  {category.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {category.description}
                    </p>
                  )}
                </div>
              </LocalizedClientLink>

              {hasChildren && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-expanded={isExpanded}
                  aria-label={`Toggle ${category.name} subcategories`}
                >
                  <ChevronRight 
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`} 
                  />
                </button>
              )}
            </div>

            {/* Subcategories */}
            {hasChildren && isExpanded && (
              <div className="pl-6 space-y-1">
                {category.category_children?.map((subcategory) => {
                  const subMetadata = subcategory.metadata as { image?: string, thumbnail?: string }
                  // Use thumbnail if available, otherwise fall back to image
                  const subImageUrl = subMetadata?.thumbnail || subMetadata?.image
                  return (
                    <LocalizedClientLink
                      key={subcategory.id}
                      href={`/categories/${subcategory.handle}`}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-yellow-50 transition-colors"
                      onClick={onClose}
                    >
                      {subImageUrl && (
                        <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={subImageUrl}
                            alt={subcategory.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">
                          {subcategory.name}
                        </p>
                      </div>
                    </LocalizedClientLink>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* View All Products Link */}
      <div className="pt-4 border-t border-gray-200">
        <LocalizedClientLink
                          href="/pood"
          className="flex items-center justify-center px-3 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          onClick={onClose}
        >
          <span className="text-sm font-medium text-yellow-800">
            Vaata kõiki tooteid
          </span>
          <ChevronRight className="ml-1 h-4 w-4 text-yellow-800" />
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default MobileCategoriesMenu 