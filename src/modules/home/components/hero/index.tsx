import Image from "next/image"
import { 
  WufiButton, 
  LocalizedClientLink,
  BentoGrid,
  Container, 
  Text
} from "@lib/components"
import { HttpTypes } from "@medusajs/types"
import { 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Heart, 
  Package,
  Cat,
  Dog
} from "lucide-react"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { ProductPreview } from "@lib/components"
import { SearchBar } from "@lib/components"
import { BentoDemo } from "@modules/common/components/bento-grid/demo"

const Hero = async ({ region }: { region: HttpTypes.StoreRegion }) => {
  // Fetch collections, categories and featured products
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  const categories = await listCategories()

  const { response: { products } } = await listProducts({
    queryParams: {
      limit: 4,
      order: "created_at",
      fields: "*variants.calculated_price",
    },
    countryCode: region.countries?.[0]?.iso_2 || "ee",
  })

  // Use a predefined set of hero images instead of dynamic fs reading
  const heroImages = [
    '/images/hero/pets.webp',
    '/images/hero/dogs.webp', 
    '/images/hero/cats.webp'
  ]

  return (
    <div className="relative w-full">
      {/* Hero Section - Apple-like subtle animations */}
      <div className="relative w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImages[0]} // Use first image for now, can be made dynamic later
            alt="Happy pets"
            fill
            className="object-cover object-center animate-fade-in-slow"
            priority
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/60 animate-fade-in-delay" />
        </div>
        
        {/* Main content */}
        <div className="relative z-10 min-h-[70vh] flex items-center">
          <div className="content-container py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left column - Hero content */}
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/40 animate-slide-up-1">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium text-sm">Lemmikloomade paradiis</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight animate-slide-up-2">
                  Teie lemmikloomade
                  <span className="block text-yellow-400">igakuine toidulaud</span>
                </h1>
                
                <p className="text-lg text-white/90 leading-relaxed animate-slide-up-3">
                  Personaalne toitumiskava ja kvaliteetsed tooted teie neljajalgsete sõprade heaoluks.
                </p>

                {/* Interactive CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up-4">
                  <LocalizedClientLink href="/store">
                    <WufiButton 
                      variant="primary"
                      size="large"
                      className="group shadow-xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transform hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingBag className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Alusta tellimist
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </WufiButton>
                  </LocalizedClientLink>
                </div>

                {/* Trust indicators */}
                <div className="hidden sm:flex items-center gap-6 text-sm text-white/80 animate-slide-up-5">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-yellow-400" />
                    <span>Kvaliteetsed tooted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-yellow-400" />
                    <span>Tasuta tarne tellimustel üle 50€</span>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="hidden lg:block animate-slide-in-right">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-4">Kiire tellimus</h3>
                  <div className="space-y-3">
                    {categories?.filter(cat => !cat.parent_category).slice(0, 2).map((category, index) => {
                      // Determine icon based on category name
                      const getIcon = (categoryName: string) => {
                        const name = categoryName.toLowerCase()
                        if (name.includes('kass') || name.includes('cat')) {
                          return <Cat className="h-6 w-6 text-yellow-800" />
                        } else if (name.includes('koer') || name.includes('dog')) {
                          return <Dog className="h-6 w-6 text-yellow-800" />
                        }
                        return null
                      }

                      return (
                        <LocalizedClientLink 
                          key={category.id}
                          href={`/categories/${category.handle}`}
                          className={`flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group animate-slide-in-right-${index + 1}`}
                        >
                          <div className="flex items-center gap-2">
                            {getIcon(category.name || '')}
                            <span className="text-white font-medium">{category.name}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                        </LocalizedClientLink>
                      )
                    })}
                    
                    {/* Search Bar */}
                    <div className="p-3 bg-white/10 rounded-xl relative z-[100]">
                      <SearchBar 
                        isScrolled={false}
                        isHomePage={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 animate-fade-in-late">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 bg-yellow-50/30">
        <div className="content-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-800" />
              <span className="text-yellow-800 font-semibold">Kategooriad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Milline on teie lemmikloom?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {categories?.filter(category => !category.parent_category).slice(0, 2).map((category) => {
              const thumbnailUrl = (category.metadata as { thumbnail?: string })?.thumbnail;
              
              // Determine icon based on category name
              const getIcon = (categoryName: string) => {
                const name = categoryName.toLowerCase()
                if (name.includes('kass') || name.includes('cat')) {
                  return <Cat className="h-6 w-6 text-yellow-800" />
                } else if (name.includes('koer') || name.includes('dog')) {
                  return <Dog className="h-6 w-6 text-yellow-800" />
                }
                return null
              }

              return (
                <LocalizedClientLink 
                  key={category.id} 
                  href={`/categories/${category.handle}`}
                  className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-yellow-300 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={category.name || 'Category image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <span className="text-4xl font-semibold text-yellow-500">{category.name?.[0]}</span>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getIcon(category.name || '')}
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-800 transition-colors">{category.name}</h3>
                    </div>
                    <p className="text-gray-600 group-hover:text-yellow-800 flex items-center justify-center font-medium">
                      Vaata tooteid <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </div>

      {/* How it Works Section - Placeholder for now */}
      <div className="py-16 bg-gray-50">
        <div className="content-container">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-800" />
              <span className="text-yellow-800 font-semibold">Kuidas see töötab</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Lihtne ja mugav</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Valige sobivad tooted, seadke tellimuse sagedus ja laske meil teie lemmikloomade eest hoolitseda.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Favorites Section - MOVED UP and IMPROVED */}
      <div className="py-16 bg-white">
        <div className="content-container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
                <Sparkles className="h-5 w-5 text-yellow-800" />
                <span className="text-yellow-800 font-semibold">Populaarsed tooted</span>
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Meie kliendid armastavad neid tooteid</h2>
              <p className="text-gray-600 max-w-xl">
                Vaadake, millised tooted on saavutanud kõrgeima kliendireitingu ja tehti kõige rohkem korduvtellimusi.
              </p>
            </div>
            <LocalizedClientLink href="/store">
              <WufiButton variant="primary" size="medium">
                Vaata kõiki tooteid
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </WufiButton>
            </LocalizedClientLink>
          </div>
          
          {/* Clean Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <ProductPreview key={product.id} product={product} region={region} />
            ))}
          </div>
        </div>
      </div>

      {/* Bento Features Section - MOVED DOWN */}
      <div className="py-16 bg-white">
        <div className="content-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-800" />
              <span className="text-yellow-800 font-semibold">Meie teenused</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Meie lubadused teie lemmikule</h2>
          </div>
          <BentoDemo />
        </div>
      </div>

      {/* Newsletter Section - Simple version */}
      <div className="py-16 bg-yellow-50/30">
        <div className="content-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-800" />
              <span className="text-yellow-800 font-semibold">Uudiskiri</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Liitu uudiskirjaga</h2>
            <p className="text-gray-600 mb-8">
              Saage teada esimesena uutest toodetest ja eripakkumistest. Liitujatele kingitus!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Teie e-posti aadress"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <WufiButton variant="primary" size="medium">
                Liitu
              </WufiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
