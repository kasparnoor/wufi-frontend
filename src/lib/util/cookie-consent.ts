import { 
  CookieConsentState, 
  CookieConsentSettings, 
  DEFAULT_CONSENT_STATE,
  CONSENT_STORAGE_KEY,
  CONSENT_BANNER_STORAGE_KEY,
  COOKIE_CATEGORIES,
  CookieCategory
} from "../../types/cookie-consent"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    chatwootSDK?: any
    chatwootSettings?: any
    dataLayer?: any[]
    $chatwoot?: any
  }
}

/**
 * Storage management for cookie consent
 */
export const cookieConsentStorage = {
  /**
   * Get stored consent state
   */
  getConsent(): CookieConsentState {
    if (typeof window === 'undefined') {
      return DEFAULT_CONSENT_STATE
    }

    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (!stored) {
        return DEFAULT_CONSENT_STATE
      }

      const parsed = JSON.parse(stored)
      
      // Validate stored data structure
      if (!parsed.version || !parsed.settings) {
        return DEFAULT_CONSENT_STATE
      }

      return {
        ...DEFAULT_CONSENT_STATE,
        ...parsed,
        settings: {
          ...DEFAULT_CONSENT_STATE.settings,
          ...parsed.settings
        }
      }
    } catch (error) {
      console.error('Error reading cookie consent from storage:', error)
      return DEFAULT_CONSENT_STATE
    }
  },

  /**
   * Save consent state to storage
   */
  saveConsent(state: CookieConsentState): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Error saving cookie consent to storage:', error)
    }
  },

  /**
   * Check if consent banner was dismissed
   */
  isBannerDismissed(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      return localStorage.getItem(CONSENT_BANNER_STORAGE_KEY) === 'true'
    } catch (error) {
      console.error('Error checking banner dismissal:', error)
      return false
    }
  },

  /**
   * Mark banner as dismissed
   */
  setBannerDismissed(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(CONSENT_BANNER_STORAGE_KEY, 'true')
    } catch (error) {
      console.error('Error setting banner dismissal:', error)
    }
  },

  /**
   * Clear all consent data
   */
  clearConsent(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY)
      localStorage.removeItem(CONSENT_BANNER_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing consent data:', error)
    }
  }
}

/**
 * Cookie management utilities
 */
export const cookieManager = {
  /**
   * Set a cookie with proper attributes
   */
  setCookie(name: string, value: string, days: number = 365): void {
    if (typeof document === 'undefined') {
      return
    }

    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`
  },

  /**
   * Get a cookie value
   */
  getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null
    }

    const nameEQ = `${name}=`
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length)
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length)
      }
    }
    return null
  },

  /**
   * Delete a cookie
   */
  deleteCookie(name: string): void {
    if (typeof document === 'undefined') {
      return
    }

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure;samesite=strict`
  },

  /**
   * Delete cookies by category
   */
  deleteCookiesByCategory(category: keyof CookieConsentSettings): void {
    const categoryConfig = COOKIE_CATEGORIES.find(cat => cat.id === category)
    if (!categoryConfig) {
      return
    }

    categoryConfig.cookies.forEach(cookieName => {
      this.deleteCookie(cookieName)
    })
  }
}

/**
 * Script management for third-party services
 */
export const scriptManager = {
  /**
   * Load Google Analytics
   */
  loadGoogleAnalytics(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Check if already loaded
    if (window.gtag) {
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
    document.head.appendChild(script)

    // Initialize gtag
    window.gtag = function() {
      (window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push(arguments)
    }
    
    window.gtag('js', new Date())
    window.gtag('config', 'GA_MEASUREMENT_ID')
  },

  /**
   * Load Facebook Pixel
   */
  loadFacebookPixel(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Check if already loaded
    if ((window as any).fbq) {
      return
    }

    // Facebook Pixel initialization (from existing code)
    const fbqInit = function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
      if (f.fbq) return
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    }
    
    fbqInit(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', null, null, null)
    
    ;(window as any).fbq('init', '2340699119683225')
    ;(window as any).fbq('track', 'PageView')
  },

  /**
   * Load Chatwoot
   */
  loadChatwoot(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Check if already loaded
    if (window.chatwootSDK) {
      return
    }

    const BASE_URL = 'https://app.chatwoot.com'
    const g = document.createElement('script')
    const s = document.getElementsByTagName('script')[0]
    
    g.src = `${BASE_URL}/packs/js/sdk.js`
    g.defer = true
    g.async = true
    s.parentNode?.insertBefore(g, s)
    
    g.onload = function() {
      window.chatwootSDK?.run({
        websiteToken: 'UPwsPWHA5Hs2eb7x9ep7ETMd',
        baseUrl: BASE_URL
      })
    }

    // Set up Estonian language and settings
    ;(window as any).chatwootSettings = {
      locale: 'et',
      position: 'right',
      type: 'standard'
    }
  },

  /**
   * Unload/disable analytics scripts
   */
  unloadAnalytics(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Disable Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        send_page_view: false,
        anonymize_ip: true
      })
    }

    // Clear analytics cookies
    cookieManager.deleteCookiesByCategory('analytics')
  },

  /**
   * Unload/disable marketing scripts
   */
  unloadMarketing(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Disable Facebook Pixel
    if ((window as any).fbq) {
      ;(window as any).fbq('consent', 'revoke')
    }

    // Hide Chatwoot widget robustly
    try {
      if ((window as any).$chatwoot && typeof (window as any).$chatwoot.hide === 'function') {
        (window as any).$chatwoot.hide()
      }
      if (window.chatwootSDK && typeof window.chatwootSDK.toggle === 'function') {
        window.chatwootSDK.toggle('close')
      }
      const widget = document.getElementById('chatwoot_live_chat_widget')
      if (widget) {
        (widget as HTMLElement).style.display = 'none'
      }
      const holders = document.querySelectorAll('.woot-widget-holder, .woot-widget-bubble-holder')
      holders.forEach((n) => ((n as HTMLElement).style.display = 'none'))
    } catch (error) {
      console.error('Error hiding Chatwoot:', error)
    }

    // Clear marketing cookies
    cookieManager.deleteCookiesByCategory('marketing')
  }
}

/**
 * Apply consent settings to third-party services
 */
export const applyConsentSettings = (settings: CookieConsentSettings): void => {
  // Analytics
  if (settings.analytics) {
    scriptManager.loadGoogleAnalytics()
  } else {
    scriptManager.unloadAnalytics()
  }

  // Marketing
  if (settings.marketing) {
    scriptManager.loadFacebookPixel()
    scriptManager.loadChatwoot()
  } else {
    scriptManager.unloadMarketing()
  }

  // Note: Necessary cookies are always allowed
  // Preferences cookies are handled by the application logic
}

/**
 * Check if user has given consent for a specific category
 */
export const hasConsentFor = (category: keyof CookieConsentSettings): boolean => {
  const consent = cookieConsentStorage.getConsent()
  return consent.hasConsented && consent.settings[category]
}

/**
 * Check if consent is required (user hasn't consented yet)
 */
export const isConsentRequired = (): boolean => {
  const consent = cookieConsentStorage.getConsent()
  return !consent.hasConsented
}

/**
 * Create a new consent state with updated settings
 */
export const createConsentState = (settings: Partial<CookieConsentSettings>): CookieConsentState => {
  const currentState = cookieConsentStorage.getConsent()
  const now = new Date().toISOString()
  
  return {
    ...currentState,
    hasConsented: true,
    settings: {
      ...currentState.settings,
      ...settings
    },
    consentDate: currentState.consentDate || now,
    lastUpdated: now
  }
} 