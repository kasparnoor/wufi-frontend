"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { 
  KrapsButton, 
  LocalizedClientLink,
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
import { SearchBar } from "@lib/components"
import { BentoDemo } from "@modules/common/components/bento-grid/demo"
import HowItWorksExplainer from "../how-it-works-explainer"
import NewsletterSection from "../newsletter-section"

interface HeroProps {
  region: HttpTypes.StoreRegion
  categories: HttpTypes.StoreProductCategory[]
}

const HERO_IMAGES = [
  '/optimized/images/hero/pets.webp',
  '/optimized/images/hero/pets-3715733_1920.webp',
  '/optimized/images/hero/kitten-1285341_1920.webp',
  '/optimized/images/hero/dog-8593014_1920.webp',
  '/optimized/images/hero/dog-7991199_1920.webp',
  '/optimized/images/hero/dog-5883275_1920.webp',
  '/optimized/images/hero/dog-3600325_1920.webp',
  '/optimized/images/hero/dog-2059668_1920.webp',
  '/optimized/images/hero/pexels-petra-vajdova-3123209-7341095.webp',
  '/optimized/images/hero/pexels-karolina-grabowska-7693493.webp',
  '/optimized/images/hero/pexels-helen1-16395147.webp',
  '/optimized/images/hero/pexels-anntarazevich-14751278.webp',
  '/optimized/images/hero/pexels-annetnavi-792775.webp',
  '/optimized/images/hero/pexels-aleksandar-cvetanovic-605352-1560424.webp'
]

const getCategoryIcon = (categoryName: string) => {
  const name = (categoryName || '').toLowerCase()
  if (name.includes('kass') || name.includes('cat')) return <Cat className="h-6 w-6 text-white" aria-hidden="true" />
  if (name.includes('koer') || name.includes('dog')) return <Dog className="h-6 w-6 text-white" aria-hidden="true" />
  return null
}

const Hero = ({ region, categories }: HeroProps) => {
  const [selectedHeroImage, setSelectedHeroImage] = useState(HERO_IMAGES[0])
  const [imageReady, setImageReady] = useState(false)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * HERO_IMAGES.length)
    setSelectedHeroImage(HERO_IMAGES[randomIndex])
    setTimeout(() => setImageReady(true), 50)
  }, [])

  return (
    <div className="relative w-full">
      {/* Hero Section - Apple-like subtle animations */}
      <div className="relative w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={selectedHeroImage}
            alt="Happy pets"
            fill
            className={`object-cover object-center transition-opacity duration-500 motion-safe:duration-500 motion-reduce:transition-none ${
              imageReady ? 'opacity-100 motion-safe:animate-fade-in-slow' : 'opacity-0'
            }`}
            priority
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/60 motion-safe:animate-fade-in-delay" aria-hidden="true" />
        </div>
        
        {/* Main content */}
        <div className="relative z-10 min-h-[70vh] flex items-center">
          <div className="content-container py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left column - Hero content */}
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/40 motion-safe:animate-slide-up-1">
                  <Sparkles className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                  <span className="text-white font-medium text-sm">Lemmikloomade paradiis</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight motion-safe:animate-slide-up-2">
                  Lemmikloomade
                  <span className="block text-yellow-400">igakuine toidulaud</span>
                </h1>
                
                <p className="text-lg text-white/90 leading-relaxed motion-safe:animate-slide-up-3">
                  Personaalne toitumiskava ja kvaliteetsed tooted teie neljajalgsete sõprade heaoluks.
                </p>

                {/* Interactive CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 motion-safe:animate-slide-up-4">
                  <LocalizedClientLink href="/pood">
                    <KrapsButton 
                      variant="primary"
                      size="large"
                      className="group shadow-xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transform hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingBag className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                      Alusta tellimist
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </KrapsButton>
                  </LocalizedClientLink>
                </div>

                {/* Trust indicators */}
                <div className="hidden sm:flex items-center gap-6 text-sm text-white/80 motion-safe:animate-slide-up-5">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                    <span>Kvaliteetsed tooted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                    <span>Tasuta tarne tellimustel üle 50€</span>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="hidden lg:block motion-safe:animate-slide-in-right">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-500 ease-out">
                  <h3 className="text-xl font-semibold text-white mb-4">Alusta ostlemist</h3>
                  <div className="space-y-3">
                    {categories?.filter(cat => !cat.parent_category).slice(0, 2).map((category, index) => {
                      return (
                        <LocalizedClientLink 
                          key={category.id}
                          href={`/categories/${category.handle}`}
                          className={`flex items-center justify-between p-3 bg-white/5 hover:bg-white/15 rounded-xl transition-all duration-300 group motion-safe:animate-slide-in-right-${index + 1}`}
                        >
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category.name || '')}
                            <span className="text-white font-medium">{category.name}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-yellow-400 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </LocalizedClientLink>
                      )
                    })}
                    
                    {/* Search Bar */}
                    <div className="rounded-xl relative z-[100]">
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
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 motion-safe:animate-fade-in-late" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center motion-safe:animate-bounce">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 motion-safe:animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 bg-yellow-50/30">
        <div className="content-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-800" aria-hidden="true" />
              <span className="text-yellow-800 font-semibold">Kategooriad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Milline on teie lemmikloom?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {categories?.filter(category => !category.parent_category).slice(0, 2).map((category) => {
              const thumbnailUrl = (category.metadata as { thumbnail?: string })?.thumbnail;
              
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
                      {/* same icon set but yellow variant for cards */}
                      {(() => {
                        const name = (category.name || '').toLowerCase()
                        if (name.includes('kass') || name.includes('cat')) return <Cat className="h-6 w-6 text-yellow-800" aria-hidden="true" />
                        if (name.includes('koer') || name.includes('dog')) return <Dog className="h-6 w-6 text-yellow-800" aria-hidden="true" />
                        return null
                      })()}
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-800 transition-colors">{category.name}</h3>
                    </div>
                    <p className="text-gray-600 group-hover:text-yellow-800 flex items-center justify-center font-medium">
                      Vaata tooteid <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </p>
                  </div>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </div>

      {/* How it Works Section - 4-Step Explainer */}
      <HowItWorksExplainer />

      {/* Bento Features Section - MOVED DOWN */}
      <div className="py-16 bg-white">
        <div className="content-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-800" aria-hidden="true" />
              <span className="text-yellow-800 font-semibold">Meie teenused</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Meie lubadused teie lemmikule</h2>
          </div>
          <BentoDemo />
        </div>
      </div>

      {/* Newsletter Section - Reused shared component */}
      <NewsletterSection />
    </div>
  )
}

export default Hero
