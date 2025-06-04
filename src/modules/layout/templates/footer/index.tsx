import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import { Sparkles } from "lucide-react"

import { LocalizedClientLink } from "@lib/components"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })
  const productCategories = await listCategories()

  return (
    <footer className="bg-black text-white w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col lg:flex-row items-start justify-between py-16 lg:py-20 gap-y-10 lg:gap-x-16">
          <div className="flex flex-col items-start max-w-sm">
            <LocalizedClientLink
              href="/"
              className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 uppercase transition-colors mb-4"
            >
              WUFI Pood
            </LocalizedClientLink>
            <Text className="text-sm text-gray-300 leading-relaxed">
              Personaalne toitumiskava ja kvaliteetsed tooted teie neljajalgsete sõprade heaoluks.
            </Text>
          </div>

          <div className="text-sm grid grid-cols-2 sm:grid-cols-3 gap-x-10 md:gap-x-16 gap-y-8 w-full lg:w-auto">
            {(productCategories || collections) && (
              <div className="flex flex-col gap-y-3">
                <span className="font-semibold text-yellow-400 uppercase tracking-wide">
                  Pood
                </span>
                <ul className="grid grid-cols-1 gap-2" data-testid="footer-shop-links">
                  {productCategories?.filter(c => !c.parent_category).slice(0, 5).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-gray-300 hover:text-white transition-colors"
                        href={`/categories/${c.handle}`}
                        data-testid={`category-link-${c.handle}`}
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                  {collections?.slice(0, 3).map((c) => (
                     <li key={c.id}>
                      <LocalizedClientLink
                        className="text-gray-300 hover:text-white transition-colors"
                        href={`/collections/${c.handle}`}
                        data-testid={`collection-link-${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                   <li>
                      <LocalizedClientLink
                        className="text-gray-300 hover:text-white transition-colors font-medium"
                        href="/store"
                      >
                        Kõik tooted →
                      </LocalizedClientLink>
                    </li>
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-3">
              <span className="font-semibold text-yellow-400 uppercase tracking-wide">
                Info
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-gray-300">
                <li>
                  <LocalizedClientLink href="/about" className="hover:text-white transition-colors">
                    Meist
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/contact" className="hover:text-white transition-colors">
                    Kontakt
                  </LocalizedClientLink>
                </li>
                <li>
                   <LocalizedClientLink href="/terms" className="hover:text-white transition-colors">
                    Tingimused
                  </LocalizedClientLink>
                </li>
                 <li>
                   <LocalizedClientLink href="/privacy" className="hover:text-white transition-colors">
                    Privaatsuspoliitika
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex w-full pt-8 pb-10 mt-10 border-t border-white/10 justify-between text-gray-400 items-center">
          <Text className="text-xs">
            © {new Date().getFullYear()} WUFI Pood. Kõik õigused kaitstud.
          </Text>
          <div className="flex items-center gap-x-4">
              <Sparkles className="h-4 w-4 text-yellow-400" /> 
              <span className="text-xs">Powered by Love & Code</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
