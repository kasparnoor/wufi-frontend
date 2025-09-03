"use client"

import { Suspense, useEffect, useState } from "react"
import { StoreRegion } from "@medusajs/types"
import { LocalizedClientLink } from "@lib/components"
import { CartButton } from "@lib/components"
import { SearchBar } from "@lib/components"
import { CountrySelect } from "@lib/components"
import { MegaMenu } from "@lib/components"
import MobileCategoriesMenu from "@modules/layout/components/mega-menu/mobile-menu"
import { usePathname } from "next/navigation"
import { useToggleState } from "@medusajs/ui"
import { Search, User, Menu, X, Store, Users, MessageCircle, Info } from "lucide-react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [regions, setRegions] = useState<StoreRegion[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const toggleState = useToggleState()
  
  const isHomePage = pathname === "/" || 
    pathname === "/ee" || 
    pathname?.endsWith("/ee") || 
    Boolean(pathname?.match(/^\/[a-z]{2}$/)) || 
    Boolean(pathname?.match(/^\/[a-z]{2}\/$/))

  useEffect(() => {
    // Fetch regions and categories from API routes
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [regionsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/regions'),
          fetch('/api/categories')
        ])

        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json()
          setRegions(regionsData)
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData || [])
        }
      } catch (error) {
        console.error('Error fetching navigation data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Add scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu and search when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [pathname])

  const navigation = [
    { name: 'Meist', href: '/meist', icon: Info },
    { name: 'Klienditugi', href: '/klienditugi', icon: MessageCircle },
  ]

  return (
    <>
      <nav className={`sticky top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" 
          : "bg-white shadow-md border-b border-gray-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo - Clickable to home */}
            <div className="flex-shrink-0">
              <LocalizedClientLink
                href="/"
                className={`flex items-center transition-all duration-200 hover:scale-105 ${
                  isScrolled || !isHomePage
                    ? "hover:opacity-80" 
                    : "hover:opacity-80"
                }`}
                data-testid="nav-store-link"
              >
                <img 
                  src="/images/brand/kraps_logo_yellow logo.png" 
                  alt="Kraps" 
                  className="h-10 w-auto"
                />
              </LocalizedClientLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* MegaMenu for "Pood" */}
              <MegaMenu categories={categories} />
              
              {/* Other navigation items */}
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <LocalizedClientLink
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1.5 text-sm font-medium transition-colors duration-200 ${
                      isScrolled || !isHomePage
                        ? "text-gray-700 hover:text-yellow-800" 
                        : "text-gray-700 hover:text-yellow-800"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </LocalizedClientLink>
                )
              })}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-sm mx-6">
              <SearchBar 
                isScrolled={isScrolled} 
                isHomePage={isHomePage}
                className="w-full"
                compact={true}
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              
              {/* Search Icon - Mobile & Tablet */}
              <button 
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isScrolled || !isHomePage
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Account Link - Desktop only */}
              <LocalizedClientLink
                href="/konto"
                className={`hidden md:flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isScrolled || !isHomePage
                    ? "text-gray-700 hover:text-yellow-800" 
                    : "text-gray-700 hover:text-yellow-800"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Konto</span>
              </LocalizedClientLink>

              {/* Cart Button */}
              <Suspense fallback={
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  isScrolled || !isHomePage ? "text-gray-700" : "text-white drop-shadow"
                }`}>
                  <span>Ostukorv (0)</span>
                </div>
              }>
                <CartButton isScrolled={isScrolled} isHomePage={isHomePage} />
              </Suspense>

              {/* Mobile menu button */}
              <button
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isScrolled || !isHomePage
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                  setIsMobileSearchOpen(false) // Close search if menu is opened/closed
                }}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? "max-h-screen opacity-100" 
            : "max-h-0 opacity-0 overflow-hidden"
        }`}>
          <div className={`px-4 py-4 space-y-4 max-h-screen overflow-y-auto ${
            isScrolled || !isHomePage
              ? "bg-white/95 backdrop-blur-md border-t border-gray-200" 
              : "bg-white border-t border-gray-200"
          }`}>
            
            {/* Mobile Search - now controlled by its own modal */}
            {/* <div className="mb-4">
              <SearchBar 
                isScrolled={isScrolled} 
                isHomePage={isHomePage}
                className="w-full"
              />
            </div> */}

            {/* Mobile Categories Menu */}
            {categories.length > 0 && (
              <div className="mb-6">
                <MobileCategoriesMenu 
                  categories={categories} 
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <LocalizedClientLink
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      isScrolled || !isHomePage
                        ? "text-gray-700 hover:text-yellow-800 hover:bg-gray-50" 
                        : "text-gray-700 hover:text-yellow-800 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </LocalizedClientLink>
                )
              })}
              
              {/* Mobile Account Link */}
              <LocalizedClientLink
                href="/konto"
                className={`md:hidden flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isScrolled || !isHomePage
                    ? "text-gray-700 hover:text-yellow-800 hover:bg-gray-50" 
                    : "text-gray-700 hover:text-yellow-800 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Konto</span>
              </LocalizedClientLink>
            </div>

            {/* Country/Region selector */}
            {regions && regions.length > 0 && (
              <div className={`pt-4 border-t ${
                isScrolled || !isHomePage ? "border-gray-200" : "border-gray-200"
              }`}>
                <CountrySelect
                  toggleState={toggleState}
                  regions={regions}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      <Transition.Root show={isMobileSearchOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={setIsMobileSearchOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                      onClick={() => setIsMobileSearchOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 mb-4">
                        Otsi tooteid
                      </Dialog.Title>
                      <SearchBar 
                        isScrolled={isScrolled} 
                        isHomePage={isHomePage}
                        className="w-full"
                        compact={false} // Full size search bar in modal
                      />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
