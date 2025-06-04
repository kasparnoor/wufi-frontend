'use client'

import { LocalizedClientLink } from "@lib/components"
import { useCartState } from "@lib/components"
import { ShoppingBag } from "lucide-react"

export default function CartButton({ isScrolled, isHomePage }: { isScrolled: boolean, isHomePage: boolean }) {
  // Use the shared cart state instead of local state
  const { itemCount } = useCartState()

  return (
    <LocalizedClientLink
      className={`relative flex items-center space-x-1.5 text-sm font-medium transition-colors duration-200 ${
        isScrolled || !isHomePage
          ? "text-gray-700 hover:text-yellow-800"
          : "text-gray-700 hover:text-yellow-800"
      }`}
      href="/cart"
      data-testid="nav-cart-link"
    >
      <div className="relative">
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      <span className="hidden sm:inline">Ostukorv</span>
      <span className="sm:hidden">({itemCount})</span>
    </LocalizedClientLink>
  )
}
