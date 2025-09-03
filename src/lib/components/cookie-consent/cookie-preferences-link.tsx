'use client'

import React from 'react'
import { useCookieConsent } from '../../context/cookie-consent-context'
import { Cookie } from 'lucide-react'

interface CookiePreferencesLinkProps {
  className?: string
  children?: React.ReactNode
}

const CookiePreferencesLink: React.FC<CookiePreferencesLinkProps> = ({ 
  className = "hover:text-yellow-400 transition-colors work-sans-regular hover:translate-x-1 transform duration-200 inline-block",
  children 
}) => {
  const { openModal } = useCookieConsent()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    openModal()
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      aria-label="Muuda küpsiste eelistusi"
    >
      {children || (
        <span className="flex items-center gap-2">
          <Cookie className="h-4 w-4" />
          Küpsiste eelistused
        </span>
      )}
    </button>
  )
}

export default CookiePreferencesLink 