"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRight, X, Search } from "lucide-react"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

import { LocalizedClientLink } from "@lib/components"
import CountrySelect from "../country-select"

const SideMenuItems = {
  Avaleht: "/",
  Pood: "/store",
  Konto: "/account",
  Ostukorv: "/cart",
}

const SideMenu = ({ 
  regions,
  isScrolled,
  isHomePage
}: { 
  regions: HttpTypes.StoreRegion[] | null
  isScrolled: boolean
  isHomePage: boolean
}) => {
  const toggleState = useToggleState()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Get country code from pathname
  const countryCode = pathname.split('/')[1] || 'ee'

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
        "/store/products",
        {
          method: "GET",
          query: {
            q: searchQuery,
            limit: 12,
          },
        }
      )

      // Close the menu and redirect to store with search query
      router.push(`/${countryCode}/store?q=${encodeURIComponent(searchQuery)}`)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className={`relative h-full flex items-center transition-all ease-out duration-200 text-base font-medium
                    ${isScrolled ? "hover:text-yellow-800" : "hover:text-yellow-400"}`}
                >
                  Menüü
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className={`flex flex-col h-full justify-between p-6 border rounded-2xl backdrop-blur-md
                      ${isScrolled 
                        ? "bg-white/90 border-gray-200" 
                        : "bg-black/50 border-white/10"}`}
                  >
                    <div>
                      <div className="flex justify-end mb-6" id="xmark">
                        <button 
                          data-testid="close-menu-button" 
                          onClick={close}
                          className={`transition-colors
                            ${isScrolled 
                              ? "text-gray-900 hover:text-yellow-800" 
                              : "text-white hover:text-yellow-400"}`}
                        >
                          <X />
                        </button>
                      </div>

                      {/* Search Bar */}
                      <form onSubmit={handleSearch} className="mb-8">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Otsi tooteid..."
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 bg-transparent
                              ${isScrolled 
                                ? "border-gray-200 focus:border-yellow-400 text-gray-900 placeholder:text-gray-500" 
                                : "border-white/20 focus:border-yellow-400 text-white placeholder:text-white/60"}`}
                          />
                          <button
                            type="submit"
                            disabled={isSearching}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                              ${isScrolled
                                ? "bg-yellow-400 hover:bg-yellow-500"
                                : "bg-yellow-400/80 hover:bg-yellow-400"}`}
                          >
                            <Search className="h-4 w-4 text-black" />
                          </button>
                        </div>
                      </form>

                      <ul className="flex flex-col gap-6 items-start justify-start">
                        {Object.entries(SideMenuItems).map(([name, href]) => {
                          return (
                            <li key={name}>
                              <LocalizedClientLink
                                href={href}
                                className={`text-3xl transition-colors
                                  ${isScrolled 
                                    ? "text-gray-900 hover:text-yellow-800" 
                                    : "text-white hover:text-yellow-400"}`}
                                onClick={close}
                                data-testid={`${name.toLowerCase()}-link`}
                              >
                                {name}
                              </LocalizedClientLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-y-6">
                      <div
                        className={`flex justify-between ${isScrolled ? "text-gray-900" : "text-white"}`}
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRight
                          className={clx(
                            "transition-transform duration-150",
                            isScrolled ? "text-gray-900" : "text-white",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className={`flex justify-between text-sm
                        ${isScrolled ? "text-gray-600" : "text-white/80"}`}
                      >
                        © {new Date().getFullYear()} WUFI Pood. Kõik õigused kaitstud.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
