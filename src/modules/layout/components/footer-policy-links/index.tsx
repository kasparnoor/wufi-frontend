import { LocalizedClientLink } from "@lib/components"
import { retrieveFooterPolicyPages } from "@lib/data/policy-pages"
import FooterPolicyLinksClient from "./client"
import CookiePreferencesLink from "@lib/components/cookie-consent/cookie-preferences-link"

export default async function FooterPolicyLinks() {
  // Try to get server-side data first for SEO
  const serverPolicyPages = await retrieveFooterPolicyPages()

  return (
    <div className="flex flex-col gap-y-4">
      <span className="font-semibold text-yellow-400 uppercase tracking-wide text-xs manrope-semibold">
        Õiguslik info
      </span>
      
      {/* If server data is available, render it. Otherwise, render client component */}
      {serverPolicyPages && serverPolicyPages.length > 0 ? (
        <ul className="grid grid-cols-1 gap-y-3 text-gray-300">
          {serverPolicyPages.map((page) => (
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
      ) : (
        <FooterPolicyLinksClient />
      )}
    </div>
  )
} 