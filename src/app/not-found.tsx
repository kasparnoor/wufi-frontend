import { Metadata } from "next"
import { 
  Cat, 
  Dog, 
  Home, 
  Search, 
  ShoppingBag, 
  ArrowRight,
  Sparkles
} from "lucide-react"
import { KrapsButton, LocalizedClientLink, SearchBar } from "@lib/components"

export const metadata: Metadata = {
  title: "404 - Lehte ei leitud",
  description: "Oops! See leht eksis ära nagu koer pargis. Aitame teid õigele rajale tagasi!",
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-b from-yellow-50/30 to-white flex items-center">
      <div className="content-container py-12 w-full">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Animated pet icons */}
          <div className="relative mb-6">
            <div className="flex justify-center items-center gap-6 mb-4">
              <div className="animate-bounce delay-0">
                <Cat className="h-12 w-12 text-yellow-600" />
              </div>
              <div className="text-6xl font-bold text-yellow-700">
                404
              </div>
              <div className="animate-bounce delay-300">
                <Dog className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Clear headline */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 mb-3 bg-red-50 px-4 py-2 rounded-full border border-red-200">
              <Sparkles className="h-4 w-4 text-red-600" />
              <span className="text-red-700 font-medium text-sm">Lehte ei leitud</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              See lehekülg ei eksisteeri
            </h1>
            
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              URL, mida sisestasit, on vale või lehekülg on eemaldatud. Proovige otsida või minge avalehele.
            </p>
          </div>

          {/* Search section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 max-w-xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-gray-600" />
              <h3 className="text-base font-medium text-gray-800">Proovige otsida</h3>
            </div>
            <SearchBar 
              isScrolled={false}
              isHomePage={false}
              className="w-full"
            />
          </div>

          {/* Quick navigation cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Home */}
            <LocalizedClientLink href="/">
              <div className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mb-3 mx-auto group-hover:bg-yellow-200 transition-colors">
                  <Home className="h-5 w-5 text-yellow-700" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Avaleht</h3>
                <p className="text-xs text-gray-600 group-hover:text-yellow-700 flex items-center justify-center">
                  Tagasi koju
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </LocalizedClientLink>

            {/* Shop */}
            <LocalizedClientLink href="/pood">
              <div className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mb-3 mx-auto group-hover:bg-yellow-200 transition-colors">
                  <ShoppingBag className="h-5 w-5 text-yellow-700" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Pood</h3>
                <p className="text-xs text-gray-600 group-hover:text-yellow-700 flex items-center justify-center">
                  Vaata tooteid
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </LocalizedClientLink>

            {/* Categories */}
            <LocalizedClientLink href="/categories">
              <div className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mb-3 mx-auto group-hover:bg-yellow-200 transition-colors">
                  <div className="flex gap-1">
                    <Cat className="h-2.5 w-2.5 text-yellow-700" />
                    <Dog className="h-2.5 w-2.5 text-yellow-700" />
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Kategooriad</h3>
                <p className="text-xs text-gray-600 group-hover:text-yellow-700 flex items-center justify-center">
                  Sirvi kategooriate kaupa
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </LocalizedClientLink>

          </div>

        </div>
      </div>
    </div>
  )
}
