"use client"

import { Heading, Text } from "@medusajs/ui"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { LocalizedClientLink } from "@lib/components"
import { KrapsButton } from "@lib/components"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

const EmptyCartMessage = () => {
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const categoriesData = await response.json()
          // Filter to only show top-level categories (no parent) and limit to 3
          const topLevelCategories = categoriesData
            ?.filter((cat: HttpTypes.StoreProductCategory) => !cat.parent_category)
            ?.slice(0, 3) || []
          setCategories(topLevelCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to empty array if fetch fails
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4" data-testid="empty-cart-message">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        
        <Heading
          level="h1"
          className="heading-hero mb-4"
        >
          Teie ostukorv on tühi
        </Heading>
        
        <Text className="text-gray-600 text-lg mb-8 leading-relaxed">
          Sirvige meie kvaliteetseid lemmikloomade tooteid ja lisage midagi oma korvi.
        </Text>
        
        <div className="space-y-4">
          <LocalizedClientLink href="/pood" className="block">
            <KrapsButton 
              variant="primary" 
              size="large"
              className="w-full sm:w-auto justify-center group"
            >
              Sirvi tooteid
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </KrapsButton>
          </LocalizedClientLink>
          
          {!isLoading && categories.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm text-gray-500">
              {categories.map((category, index) => (
                <div key={category.id} className="flex items-center gap-2">
                  <LocalizedClientLink 
                    href={`/categories/${category.handle}`} 
                    className="hover:text-gray-700 transition-colors"
                  >
                    {category.name}
                  </LocalizedClientLink>
                  {index < categories.length - 1 && (
                    <span className="hidden sm:inline">•</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmptyCartMessage
