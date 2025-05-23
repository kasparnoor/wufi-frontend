'use client'

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCartState } from "@modules/common/components/cart-state"
import { ShoppingBag } from "@medusajs/icons"

export default function CartButton({ isScrolled, isHomePage }: { isScrolled: boolean, isHomePage: boolean }) {
  // Use the shared cart state instead of local state
  const { itemCount } = useCartState()

  return (
    <LocalizedClientLink
      className={`text-base font-medium transition-all duration-200 hover:scale-105 ${isScrolled || !isHomePage ? "hover:text-yellow-600" : "hover:text-yellow-400"} flex items-center gap-1.5`}
      href="/cart"
      data-testid="nav-cart-link"
    >
      <ShoppingBag className="h-5 w-5 relative -top-[1px]" aria-hidden="true" />
      <span>Ostukorv ({itemCount})</span>
    </LocalizedClientLink>
  )
}
