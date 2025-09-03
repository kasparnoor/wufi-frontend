export interface CookieConsentSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export interface CookieCategory {
  id: keyof CookieConsentSettings
  name: string
  description: string
  essential: boolean
  cookies: string[]
  purposes: string[]
}

export interface CookieConsentState {
  hasConsented: boolean
  settings: CookieConsentSettings
  consentDate: string | null
  lastUpdated: string | null
  version: string
}

export interface CookieConsentBannerProps {
  isVisible: boolean
  onAcceptAll: () => void
  onRejectAll: () => void
  onCustomize: () => void
  onClose: () => void
}

export interface CookieConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: CookieConsentSettings) => void
  currentSettings: CookieConsentSettings
}

export interface CookieConsentContextType {
  state: CookieConsentState
  updateSettings: (settings: Partial<CookieConsentSettings>) => void
  acceptAllCookies: () => void
  rejectAllCookies: () => void
  resetConsent: () => void
  showBanner: boolean
  showModal: boolean
  openModal: () => void
  closeModal: () => void
}

// Cookie categories configuration
export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Vajalikud küpsised',
    description: 'Need küpsised on veebisaidi toimiseks hädavajalikud ja neid ei saa keelata.',
    essential: true,
    cookies: ['_medusa_jwt', '_medusa_cart_id', 'session_id'],
    purposes: ['Autentimine', 'Ostukorvi säilitamine', 'Seansi haldamine']
  },
  {
    id: 'analytics',
    name: 'Analüütikaküpsised',
    description: 'Need küpsised aitavad meil mõista, kuidas külastajad veebisaidiga suhtlevad.',
    essential: false,
    cookies: ['_ga', '_gid', '_gat', 'fbp'],
    purposes: ['Liikluse analüüs', 'Kasutajakogemuse parandamine', 'Veebisaidi optimiseerimine']
  },
  {
    id: 'marketing',
    name: 'Turundusküpsised',
    description: 'Need küpsised jälgivad külastajaid veebisaitide külastamisel ja koguvad teavet isikupärastatud reklaamide kuvamiseks.',
    essential: false,
    cookies: ['_fbp', '_fbc', 'fr', 'chatwoot_session'],
    purposes: ['Isikupärastatud reklaam', 'Ristseadmete jälgimine', 'Turunduse efektiivsuse mõõtmine']
  },
  {
    id: 'preferences',
    name: 'Eelistuste küpsised',
    description: 'Need küpsised võimaldavad veebisaidil meelde jätta teie tehtud valikuid.',
    essential: false,
    cookies: ['lang', 'theme', 'region'],
    purposes: ['Keele eelistused', 'Piirkonna seaded', 'Kasutajaliidese eelistused']
  }
]

// Default consent settings
export const DEFAULT_CONSENT_STATE: CookieConsentState = {
  hasConsented: false,
  settings: {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  },
  consentDate: null,
  lastUpdated: null,
  version: '1.0'
}

export const CONSENT_STORAGE_KEY = 'wufi_cookie_consent'
export const CONSENT_BANNER_STORAGE_KEY = 'wufi_cookie_banner_dismissed' 