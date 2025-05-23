"use client"

import { Suspense, useEffect, useState } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { usePathname } from "next/navigation"

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [regions, setRegions] = useState<StoreRegion[]>([])
  const pathname = usePathname()
  const isHomePage = pathname === "/" || 
    pathname === "/ee" || 
    pathname?.endsWith("/ee") || 
    Boolean(pathname?.match(/^\/[a-z]{2}$/)) || 
    Boolean(pathname?.match(/^\/[a-z]{2}\/$/))

  useEffect(() => {
    // Fetch regions
    listRegions().then((regions: StoreRegion[]) => setRegions(regions))

    // Add scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 inset-x-0 z-50 group">
      <header 
        className={`relative h-16 transition-all duration-300
          ${isScrolled || !isHomePage
            ? "bg-white/80 backdrop-blur-md shadow-sm border-gray-200" 
            : "bg-transparent border-white/10"} 
          border-b`}
      >
        <div className="container mx-auto px-2 sm:px-6 lg:px-12 h-full">
          <nav className={`h-full flex items-center justify-between max-w-[1280px] mx-auto
            ${isScrolled || !isHomePage ? "text-gray-900" : "text-white"}`}
          >
            <div className="flex items-center h-full">
              <SideMenu regions={regions} isScrolled={isScrolled} isHomePage={isHomePage} />
            </div>

            <div className="flex items-center h-full">
              <LocalizedClientLink
                href="/"
                className={`text-xl font-bold tracking-tight transition-all duration-200
                  ${isScrolled || !isHomePage
                    ? "hover:text-yellow-600 hover:scale-105" 
                    : "hover:text-yellow-400 hover:scale-105"}`}
                data-testid="nav-store-link"
              >
                Wufi Pood
              </LocalizedClientLink>
            </div>

            <div className="flex items-center h-full">
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className={`text-base font-medium transition-all duration-200 hover:scale-105
                      ${isScrolled || !isHomePage
                        ? "hover:text-yellow-600" 
                        : "hover:text-yellow-400"}`}
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    Ostukorv (0)
                  </LocalizedClientLink>
                }
              >
                <CartButton isScrolled={isScrolled} isHomePage={isHomePage} />
              </Suspense>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Gradient overlay that appears when hovering and not scrolled */}
      <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none
        ${isScrolled || !isHomePage
          ? "opacity-0" 
          : "bg-gradient-to-b from-black/30 to-transparent opacity-0 group-hover:opacity-100"}`} 
      />
    </div>
  )
}
