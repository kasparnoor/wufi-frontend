import { ShoppingBag, ArrrowRight } from "@medusajs/icons"
import Link from "next/link"
import Image from "next/image"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import { Sparkles } from "@medusajs/icons"
import ProductPreview from "@modules/products/components/product-preview"
import WufiButton from "@modules/common/components/wufi-button"
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

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pets.webp"
            alt="Happy pets"
            fill
            className="object-cover object-center scale-[1.02] motion-safe:animate-subtle-zoom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/60 via-black/40 to-transparent" />
        </div>
        
        {/* Main content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Hero content */}
          <div className="flex-1 content-container pt-32 pb-20">
            <div className="max-w-[720px] relative">
              <div className="inline-flex items-center gap-2 mb-8 bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/10">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Lemmikloomade paradiis</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 sm:mb-8">
                Teie lemmikloomade
                <span className="block mt-2 text-yellow-400">igakuine toidulaud</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-[540px] leading-relaxed">
                Personaalne toitumiskava ja kvaliteetsed tooted teie neljajalgsete sõprade heaoluks.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <WufiButton 
                    variant="primary"
                    size="large"
                  >
                    Alusta tellimist
                    <ShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </WufiButton>
                </Link>
                <Link href="/about">
                  <WufiButton 
                    variant="secondary"
                    size="large"
                  >
                    Loe meie loost
                    <ArrrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </WufiButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="content-container py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Parimad hinnad</h3>
                <p className="text-sm text-white/80">Garanteerime soodsaimad hinnad Eestis</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Tasuta kojuvedu</h3>
                <p className="text-sm text-white/80">Toome perioodiliselt otse ukse taha</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Turvaline ostlemine</h3>
                <p className="text-sm text-white/80">SSL krüpteeritud maksed ja andmete kaitse</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrrowRight className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Lihtne tagastamine</h3>
                <p className="text-sm text-white/80">30-päevane tagastusõigus</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 sm:py-24 bg-gradient-to-b from-white to-yellow-50 relative overflow-hidden">
        <div className="content-container relative">
          <div className="flex flex-col items-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-4 sm:px-6 py-2.5 rounded-full border border-yellow-500/40">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700 font-semibold">Kuidas see töötab</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-900 font-bold mb-4">Lihtne ja mugav tellimine</h2>
            <p className="text-gray-700 text-center max-w-2xl px-4">Nelja lihtsa sammuga alustage oma lemmiklooma toidu tellimist</p>
          </div>

          {/* Journey Steps with connecting track */}
          <div className="relative">
            {/* Connection track - horizontal line */}
            <div className="absolute hidden lg:block top-12 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-full z-0"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
              {/* Step 1 */}
              <div className="group relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-md shadow-yellow-300/50 border-2 border-white">
                  1
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-100 hover:border-yellow-400 group-hover:-translate-y-2 relative z-[1]">
                  <div className="w-14 h-14 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-7 w-7 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-yellow-600 transition-colors">Valige toit</h3>
                  <p className="text-gray-700">Valige sobiv toit oma lemmiklooma jaoks. Meie eksperdid aitavad teil teha õige valiku.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-md shadow-yellow-300/50 border-2 border-white">
                  2
                </div>
                {/* Mobile step connector (visible only on small screens) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-yellow-400 -mt-8 sm:hidden"></div>
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-100 hover:border-yellow-400 group-hover:-translate-y-2 relative z-[1]">
                  <div className="w-14 h-14 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ArrrowRight className="h-7 w-7 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-yellow-600 transition-colors">Määrake kogus</h3>
                  <p className="text-gray-700">Valige igakuine toidu kogus vastavalt oma lemmiklooma vajadustele.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-md shadow-yellow-300/50 border-2 border-white">
                  3
                </div>
                {/* Mobile step connector (visible only on small screens) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-yellow-400 -mt-8 sm:hidden"></div>
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-100 hover:border-yellow-400 group-hover:-translate-y-2 relative z-[1]">
                  <div className="w-14 h-14 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-yellow-600 transition-colors">Valige tarne</h3>
                  <p className="text-gray-700">Valige sobiv tarnekuupäev ja me toome toidu otse ukse taha.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="group relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-md shadow-yellow-300/50 border-2 border-white">
                  4
                </div>
                {/* Mobile step connector (visible only on small screens) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-yellow-400 -mt-8 sm:hidden"></div>
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-100 hover:border-yellow-400 group-hover:-translate-y-2 relative z-[1]">
                  <div className="w-14 h-14 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ArrrowRight className="h-7 w-7 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-yellow-600 transition-colors">Nautige</h3>
                  <p className="text-gray-700">Nautige igakuist mugavust ja näke, kuidas teie lemmikloom õitseb.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-16 text-center">
            <Link href="/products">
              <WufiButton 
                variant="primary"
                size="large"
                className="shadow-lg shadow-yellow-400/20"
              >
                Alusta tellimist
                <ShoppingBag className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
              </WufiButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 sm:py-24 bg-yellow-50/30 relative overflow-hidden">
        <div className="content-container relative">
          <div className="flex flex-col items-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-4 sm:px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700 font-semibold">Kategooriad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Milline on teie lemmikloom?</h2>
            <p className="text-gray-600 text-center max-w-2xl px-4">Valige oma lemmiklooma tüüp ja leidke talle sobivad tooted</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories?.filter(category => {
              const isTopLevel = !category.parent_category;
              return isTopLevel;
            }).slice(0, 4).map((category) => {
              const thumbnailUrl = (category.metadata as { thumbnail?: string })?.thumbnail;
              return (
                <Link 
                  key={category.id} 
                  href={`/${region.countries?.[0]?.iso_2 || 'ee'}/categories/${category.handle}`}
                  className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-yellow-300 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={category.name || 'Category image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <span className="text-3xl font-semibold text-yellow-500">
                        {category.name?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-yellow-600 transition-colors">{category.name}</h3>
                    <p className="text-sm text-gray-600 group-hover:text-yellow-600 flex items-center justify-center">
                      Vaata tooteid 
                      <ArrrowRight className="inline-block ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bento Features Section */}
      <div className="py-16 bg-white">
        <div className="content-container">
          <div className="flex flex-col items-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-4 sm:px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700 font-semibold">Meie teenused</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Meie lubadused teie lemmikule</h2>
            <p className="text-gray-600 text-center max-w-2xl px-4">Toidu tarnimine ja toitumisabi kohandatud teie lemmiklooma vajadustele</p>
          </div>
          <BentoDemo />
        </div>
      </div>

      {/* Products Section */}
      <div className="py-24 bg-white relative overflow-hidden">
        <div className="content-container relative">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-700 font-semibold">Populaarsed tooted</span>
              </div>
              <h2 className="text-3xl text-gray-800 font-bold mb-4">Meie kliendid armastavad neid tooteid</h2>
              <p className="text-gray-600">Kvaliteetsed tooted teie lemmikutele</p>
            </div>
            <Link href="/products">
              <WufiButton 
                variant="primary"
                size="medium"
              >
                Vaata kõiki tooteid
                <ArrrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </WufiButton>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <ProductPreview
                key={product.id}
                product={product}
                region={region}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-24 bg-yellow-50/30 relative overflow-hidden">
        <div className="content-container relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700 font-semibold">Uudiskiri</span>
            </div>
            <h2 className="text-3xl text-gray-800 font-bold mb-4">Liitu uudiskirjaga</h2>
            <p className="text-gray-600 mb-8">
              Saage teada esimesena uutest toodetest ja eripakkumistest. Liitujatele kingitus!
            </p>
            <div className="flex gap-3 p-2 bg-white rounded-full shadow-sm border border-yellow-200">
              <input
                type="email"
                placeholder="Sisestage oma e-posti aadress"
                className="flex-1 px-6 py-3 bg-transparent focus:outline-none text-yellow-800 placeholder-yellow-600/50"
              />
              <WufiButton 
                variant="primary"
                size="medium"
                type="submit"
              >
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
