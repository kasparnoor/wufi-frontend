'use client'

import { retrieveCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"

export default function CartButton({ isScrolled, isHomePage }: { isScrolled: boolean, isHomePage: boolean }) {
  const [cartItemsCount, setCartItemsCount] = useState(0)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cart = await retrieveCart()
        setCartItemsCount(cart?.items?.length || 0)
      } catch (error) {
        console.error("Error fetching cart:", error)
        setCartItemsCount(0)
      }
    }

    fetchCart()
  }, [])

  return (
    <LocalizedClientLink
      className={`text-base font-medium transition-all duration-200 hover:scale-105 ${isScrolled || !isHomePage ? "hover:text-yellow-600" : "hover:text-yellow-400"}`}
      href="/cart"
      data-testid="nav-cart-link"
    >
      Ostukorv ({cartItemsCount})
    </LocalizedClientLink>
  )
}
