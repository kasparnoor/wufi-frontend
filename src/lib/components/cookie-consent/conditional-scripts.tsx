'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useHasConsentFor } from '../../context/cookie-consent-context'
import { scriptManager } from '../../util/cookie-consent'

const ConditionalScripts: React.FC = () => {
  const hasMarketingConsent = useHasConsentFor('marketing')
  const hasAnalyticsConsent = useHasConsentFor('analytics')
  const pathname = usePathname()

  // Hide chat/support widget on product pages to avoid UI overlap
  const isProductPage = Boolean(pathname && /\/[^/]+\/products\//.test(pathname))

  useEffect(() => {
    // Load marketing scripts if consent is given and NOT on product page;
    // otherwise make sure marketing widgets are hidden/unloaded.
    if (hasMarketingConsent && !isProductPage) {
      scriptManager.loadFacebookPixel()
      scriptManager.loadChatwoot()
    } else {
      scriptManager.unloadMarketing()
    }
  }, [hasMarketingConsent, isProductPage])

  // Extra safety: when entering a product page after Chatwoot has already loaded, hide it immediately
  useEffect(() => {
    if (!isProductPage) return
    try {
      scriptManager.unloadMarketing()
    } catch {}
  }, [isProductPage])

  useEffect(() => {
    // Load analytics scripts if consent is given
    if (hasAnalyticsConsent) {
      scriptManager.loadGoogleAnalytics()
    } else {
      scriptManager.unloadAnalytics()
    }
  }, [hasAnalyticsConsent])

  return null // This component doesn't render anything
}

export default ConditionalScripts 