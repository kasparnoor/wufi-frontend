"use client"

import { useState } from "react"
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { LocalizedClientLink } from "@lib/components"
import Image from "next/image"

interface MegaMenuProps {
  categories: HttpTypes.StoreProductCategory[]
  className?: string
}

const MegaMenu = ({ categories, className }: MegaMenuProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  
  // Filter to only show top-level categories (no parent)
  const topLevelCategories = categories?.filter((category) => !category.parent_category) || []

  return (
    <Popover className={`relative ${className}`}>
      {({ open, close }) => (
        <>
          <PopoverButton className="group flex items-center space-x-1.5 text-sm font-medium text-gray-700 hover:text-yellow-800 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Kategooriad</span>
            <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          </PopoverButton>

          <Transition
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel className="absolute z-50 top-full left-0 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-[600px] min-h-[400px]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-800" />
                      Toote Kategooriad
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Leidke täpselt see, mida otsissse
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 rounded-full text-xs font-medium text-yellow-800">
                    {topLevelCategories.length} kategooriat
                  </div>
                </div>
              </div>

              {/* Content - No gap between columns */}
              <div 
                className="flex"
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Main Categories Column */}
                <div className="w-1/2 p-4 space-y-1">
                  {topLevelCategories.map((category) => {
                    const metadata = category.metadata as { image?: string, thumbnail?: string }
                    // Use thumbnail if available, otherwise fall back to image
                    const imageUrl = metadata?.thumbnail || metadata?.image
                    const hasChildren = category.category_children && category.category_children.length > 0
                    const isHovered = hoveredCategory === category.id
                    
                    return (
                      <div
                        key={category.id}
                        className="relative"
                        onMouseEnter={() => setHoveredCategory(category.id)}
                      >
                        <LocalizedClientLink
                          href={`/categories/${category.handle}`}
                          className={`group flex items-center p-3 rounded-xl transition-all duration-200 ${
                            isHovered 
                              ? "bg-yellow-50 shadow-sm border border-yellow-200" 
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => close()}
                        >
                          {imageUrl && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden mr-3 flex-shrink-0 ring-2 ring-gray-100">
                              <Image
                                src={imageUrl}
                                alt={category.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-800 transition-colors">
                              {category.name}
                            </p>
                            {hasChildren && (
                              <p className="text-xs text-gray-500 mt-1">
                                {category.category_children?.length} alamkategooriat
                              </p>
                            )}
                          </div>
                          <div className={`transition-all duration-200 ${
                            isHovered ? "text-yellow-800" : "text-gray-300 group-hover:text-yellow-800"
                          }`}>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </LocalizedClientLink>
                      </div>
                    )
                  })}
                </div>

                {/* Subcategories Column - Remove border gap */}
                <div className="w-1/2 bg-gray-50/50 relative">
                  {/* Vertical divider line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"></div>
                  
                  <div className="p-4">
                    {hoveredCategory ? (
                      <div>
                        {(() => {
                          const category = topLevelCategories.find(cat => cat.id === hoveredCategory)
                          const subcategories = category?.category_children || []
                          
                          return (
                            <div>
                              <div className="mb-3">
                                <h3 className="text-sm font-medium text-gray-900 mb-1">
                                  {category?.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {subcategories.length > 0 
                                    ? `${subcategories.length} alamkategooriat` 
                                    : "Alamkategooriaid pole"
                                  }
                                </p>
                              </div>

                              {subcategories.length > 0 ? (
                                <div className="space-y-1 mb-4">
                                  {subcategories.slice(0, 6).map((subcategory) => {
                                    const subMetadata = subcategory.metadata as { image?: string, thumbnail?: string }
                                    // Use thumbnail if available, otherwise fall back to image
                                    const subImageUrl = subMetadata?.thumbnail || subMetadata?.image
                                    return (
                                      <LocalizedClientLink
                                        key={subcategory.id}
                                        href={`/categories/${subcategory.handle}`}
                                        className="group flex items-center p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200"
                                        onClick={() => close()}
                                      >
                                        {subImageUrl && (
                                          <div className="relative w-7 h-7 rounded overflow-hidden mr-3 flex-shrink-0 ring-1 ring-gray-200">
                                            <Image
                                              src={subImageUrl}
                                              alt={subcategory.name}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-700 group-hover:text-yellow-800 transition-colors">
                                            {subcategory.name}
                                          </p>
                                        </div>
                                        <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-yellow-800 transition-colors" />
                                      </LocalizedClientLink>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="py-6 text-center">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <p className="text-xs text-gray-500 mb-3">
                                    Kõik tooted selles kategoorias
                                  </p>
                                </div>
                              )}

                              {/* Category-specific CTA */}
                              <LocalizedClientLink
                                href={`/categories/${category?.handle}`}
                                className="block w-full p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 text-center group"
                                onClick={() => close()}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <ShoppingBag className="h-4 w-4 text-yellow-800" />
                                  <span className="text-sm font-medium text-yellow-800 group-hover:text-yellow-800">
                                    Vaata {category?.name} tooteid
                                  </span>
                                  <ArrowRight className="h-4 w-4 text-yellow-800 group-hover:text-yellow-800 transition-colors" />
                                </div>
                              </LocalizedClientLink>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Avasta meie tooteid
                          </p>
                          <p className="text-xs text-gray-500">
                            Vali kategooria vasakult
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Elegant Footer */}
              <div className="border-t border-gray-100 bg-gray-50/30 p-4">
                <LocalizedClientLink
                  href="/store"
                  className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-sm transition-all duration-200"
                  onClick={() => close()}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                      <ShoppingBag className="h-4 w-4 text-yellow-800" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-800 transition-colors">
                        Vaata Kõiki Tooteid
                      </p>
                      <p className="text-xs text-gray-500">
                        Sirvi meie täielikku valikut
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-800 group-hover:translate-x-1 transition-all duration-200" />
                </LocalizedClientLink>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default MegaMenu 