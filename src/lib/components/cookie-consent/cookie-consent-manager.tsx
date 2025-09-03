'use client'

import React from 'react'
import { useCookieConsent } from '../../context/cookie-consent-context'
import CookieBanner from './cookie-banner'
import CookiePreferencesModal from './cookie-preferences-modal'

const CookieConsentManager: React.FC = () => {
  const {
    state,
    showBanner,
    showModal,
    acceptAllCookies,
    rejectAllCookies,
    updateSettings,
    openModal,
    closeModal
  } = useCookieConsent()

  const handleBannerAcceptAll = () => {
    acceptAllCookies()
    // Don't call additional close logic - acceptAllCookies handles banner hiding
  }

  const handleBannerRejectAll = () => {
    rejectAllCookies()
    // Don't call additional close logic - rejectAllCookies handles banner hiding
  }

  const handleBannerCustomize = () => {
    openModal()
    // Don't close banner - let modal handle the flow
  }

  const handleBannerClose = () => {
    // If user closes without making a choice, set minimal consent
    if (!state.hasConsented) {
      rejectAllCookies()
    }
    // If already consented, just close banner without changing settings
  }

  const handleModalSave = (settings: any) => {
    updateSettings(settings)
  }

  return (
    <>
      <CookieBanner
        isVisible={showBanner}
        onAcceptAll={handleBannerAcceptAll}
        onRejectAll={handleBannerRejectAll}
        onCustomize={handleBannerCustomize}
        onClose={handleBannerClose}
      />
      
      <CookiePreferencesModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleModalSave}
        currentSettings={state.settings}
      />
    </>
  )
}

export default CookieConsentManager 