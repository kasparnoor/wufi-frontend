import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import { Sparkles, Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react"
import { NewsletterForm } from "@lib/components/newsletter/newsletter-form"

import { LocalizedClientLink } from "@lib/components"
import FooterPolicyLinks from "@modules/layout/components/footer-policy-links"
import CookiePreferencesLink from "@lib/components/cookie-consent/cookie-preferences-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })
  const productCategories = await listCategories()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white w-full">
      <div className="content-container flex flex-col w-full">
        
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-start justify-between py-16 lg:py-20 gap-y-12 lg:gap-x-16">
          
          {/* Brand Section with Logo */}
          <div className="flex flex-col items-start max-w-md">
            <LocalizedClientLink
              href="/"
              className="flex items-center mb-6 group transition-transform hover:scale-105"
            >
              <img 
                src="/images/brand/kraps_logo_yellow logo.png" 
                alt="Kraps" 
                className="h-12 w-auto"
              />
            </LocalizedClientLink>
            
            <Text className="text-base text-gray-300 leading-relaxed mb-6 work-sans-regular">
              Personaalne toitumiskava ja kvaliteetsed tooted teie neljajalgsete sõprade heaoluks. 
              Tervislik toit, õnnelik lemmikloom.
            </Text>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-yellow-400" />
                <a href="mailto:tere@kraps.ee" className="hover:text-white transition-colors">
                  tere@kraps.ee
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-yellow-400" />
                <a href="tel:+37257840516" className="hover:text-white transition-colors">
                  +372 5784 0516
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span>Eesti, Tallinn</span>
              </div>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="text-sm grid grid-cols-2 sm:grid-cols-4 gap-x-8 md:gap-x-12 gap-y-10 w-full lg:w-auto flex-1">
            
            {/* Shop Categories */}
            <div className="flex flex-col gap-y-4">
              <span className="font-semibold text-yellow-400 uppercase tracking-wide text-xs manrope-semibold">
                Pood
              </span>
              <ul className="grid grid-cols-1 gap-3" data-testid="footer-shop-links">
                <li>
                  <LocalizedClientLink
                    className="text-gray-300 hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block"
                    href="/categories/kassid"
                  >
                    Kassid
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="text-gray-300 hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block"
                    href="/categories/koerad"
                  >
                    Koerad
                  </LocalizedClientLink>
                </li>
                <li className="mt-2">
                  <LocalizedClientLink
                    className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium work-sans-medium flex items-center gap-1 group"
                    href="/pood"
                  >
                    Kõik tooted 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Account & Services */}
            <div className="flex flex-col gap-y-4">
              <span className="font-semibold text-yellow-400 uppercase tracking-wide text-xs manrope-semibold">
                Teenused
              </span>
              <ul className="grid grid-cols-1 gap-y-3 text-gray-300">
                <li>
                  <LocalizedClientLink href="/meist" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Meist
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/konto" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Minu konto
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/klienditugi" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Kliendituge
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/pood" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Kõik tooted
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-y-4">
              <span className="font-semibold text-yellow-400 uppercase tracking-wide text-xs manrope-semibold">
                Tugi
              </span>
              <ul className="grid grid-cols-1 gap-y-3 text-gray-300">
                <li>
                  <LocalizedClientLink href="/klienditugi" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Kontakt
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/korduma-kippuvad-kusimused" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Korduma kippuvad küsimused
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/tarne-info" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Tarne info
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/tagastamine" className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
                    Tagastamine
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Legal Pages */}
            <FooterPolicyLinks />
            
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 work-sans-regular mr-2">Jälgi meid:</span>
              <div className="flex items-center gap-3">
                <a 
                  href="https://facebook.com/krapseesti" 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-yellow-400 flex items-center justify-center transition-all duration-300 group"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-4 w-4 text-gray-300 group-hover:text-black" />
                </a>
                <a 
                  href="https://instagram.com/kraps_eesti" 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-yellow-400 flex items-center justify-center transition-all duration-300 group"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4 text-gray-300 group-hover:text-black" />
                </a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-sm text-gray-400 work-sans-regular whitespace-nowrap">
                Uudiskirjaga liitumine:
              </span>
              <NewsletterForm
                variant="footer"
                source="footer"
                tags={["footer-subscriber"]}
                placeholder="sinu@email.ee"
                buttonText="Liitu"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                See leht on kaitstud reCAPTCHA-ga ja kehtivad Google&apos;i <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">privaatsuspoliitika</a> ja <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">teenusetingimused</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row w-full py-6 border-t border-white/10 justify-between text-gray-400 items-center gap-4">
          <Text className="text-xs work-sans-regular">
            © {new Date().getFullYear()} Kraps Pood. Kõik õigused kaitstud.
          </Text>
          <div className="flex items-center gap-x-3">
            <Sparkles className="h-4 w-4 text-yellow-400" /> 
            <span className="text-xs work-sans-regular">Valmistatud ❤️-ga lemmikloomadele Eestis</span>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
