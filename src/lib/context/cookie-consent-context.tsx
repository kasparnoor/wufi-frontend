'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  CookieConsentContextType, 
  CookieConsentState, 
  CookieConsentSettings, 
  DEFAULT_CONSENT_STATE 
} from '../../types/cookie-consent'
import { 
  cookieConsentStorage, 
  applyConsentSettings, 
  createConsentState 
} from '../util/cookie-consent'

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

interface CookieConsentProviderProps {
  children: ReactNode
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ children }) => {
  const [state, setState] = useState<CookieConsentState>(DEFAULT_CONSENT_STATE)
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize consent state from storage
  useEffect(() => {
    const storedConsent = cookieConsentStorage.getConsent()
    setState(storedConsent)
    
    // Show banner if user hasn't consented yet
    if (!storedConsent.hasConsented) {
      setShowBanner(true)
    } else {
      // Apply stored consent settings
      applyConsentSettings(storedConsent.settings)
    }
    
    setIsInitialized(true)
  }, [])

  // Save state to storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      cookieConsentStorage.saveConsent(state)
    }
  }, [state, isInitialized])

  const updateSettings = (newSettings: Partial<CookieConsentSettings>) => {
    const now = new Date().toISOString()
    const updatedState: CookieConsentState = {
      ...state,
      hasConsented: true,
      settings: {
        ...state.settings,
        ...newSettings
      },
      consentDate: state.consentDate || now,
      lastUpdated: now
    }
    setState(updatedState)
    applyConsentSettings(updatedState.settings)
    setShowBanner(false)
  }

  const acceptAllCookies = () => {
    const allEnabled: CookieConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    updateSettings(allEnabled)
  }

  const rejectAllCookies = () => {
    const onlyNecessary: CookieConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
    updateSettings(onlyNecessary)
  }

  const resetConsent = () => {
    cookieConsentStorage.clearConsent()
    setState(DEFAULT_CONSENT_STATE)
    setShowBanner(true)
    setShowModal(false)
  }

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const closeBanner = () => {
    setShowBanner(false)
    cookieConsentStorage.setBannerDismissed()
  }

  const contextValue: CookieConsentContextType = {
    state,
    updateSettings,
    acceptAllCookies,
    rejectAllCookies,
    resetConsent,
    showBanner,
    showModal,
    openModal,
    closeModal
  }

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export const useCookieConsent = (): CookieConsentContextType => {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return context
}

// Helper hook to check if user has consented to a specific category
export const useHasConsentFor = (category: keyof CookieConsentSettings): boolean => {
  const { state } = useCookieConsent()
  return state.hasConsented && state.settings[category]
}

// Helper hook to check if consent is required
export const useIsConsentRequired = (): boolean => {
  const { state } = useCookieConsent()
  return !state.hasConsented
} 