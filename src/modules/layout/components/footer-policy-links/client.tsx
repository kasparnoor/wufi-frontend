'use client'

import { LocalizedClientLink } from "@lib/components"
import { useFooterPolicyPages } from "@lib/hooks/use-policy-pages"
import CookiePreferencesLink from "@lib/components/cookie-consent/cookie-preferences-link"

export default function FooterPolicyLinksClient() {
  const { pages, loading, error } = useFooterPolicyPages()

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-3 text-gray-300">
        {/* Loading skeleton */}
        <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-600 rounded animate-pulse w-1/2"></div>
      </div>
    )
  }

  if (error) {
    // Fallback links when there's an error
    return (
      <ul className="grid grid-cols-1 gap-y-3 text-gray-300">
        <li>
          <LocalizedClientLink 
            href="/kasutustingimused" 
            className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block"
          >
            Kasutustingimused
          </LocalizedClientLink>
        </li>
        <li>
          <LocalizedClientLink 
            href="/privaatsuspoliitika" 
            className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block"
          >
            Privaatsuspoliitika
          </LocalizedClientLink>
        </li>
        <li>
          <CookiePreferencesLink className="text-gray-300 hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
            Küpsiste eelistused
          </CookiePreferencesLink>
        </li>
      </ul>
    )
  }

  if (!pages || pages.length === 0) {
    // Fallback links when no policy pages are found
    return (
      <ul className="grid grid-cols-1 gap-y-3 text-gray-300">
        <li>
          <LocalizedClientLink 
            href="/kasutustingimused" 
            className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block"
          >
            Kasutustingimused
          </LocalizedClientLink>
        </li>
        <li>
          <LocalizedClientLink 
            href="/privaatsuspoliitika" 
            className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block"
          >
            Privaatsuspoliitika
          </LocalizedClientLink>
        </li>
        <li>
          <CookiePreferencesLink className="text-gray-300 hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
            Küpsiste eelistused
          </CookiePreferencesLink>
        </li>
      </ul>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-y-3 text-gray-300">
      {pages.map((page) => (
        <li key={page.id}>
          <LocalizedClientLink 
            href={`/policies/${page.slug}`} 
            className="hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block"
          >
            {page.title}
          </LocalizedClientLink>
        </li>
      ))}
      <li>
        <CookiePreferencesLink className="text-gray-300 hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block">
          Küpsiste eelistused
        </CookiePreferencesLink>
      </li>
    </ul>
  )
} 