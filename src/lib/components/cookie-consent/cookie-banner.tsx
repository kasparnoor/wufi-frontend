'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { CookieConsentBannerProps } from '../../../types/cookie-consent'
import { X, Cookie, Settings, Check } from 'lucide-react'

const CookieBanner: React.FC<CookieConsentBannerProps> = ({
  isVisible,
  onAcceptAll,
  onRejectAll,
  onCustomize,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAcceptAll = () => {
    onAcceptAll()
    // onClose() is handled by the accept action
  }

  const handleRejectAll = () => {
    onRejectAll()
    // onClose() is handled by the reject action
  }

  const handleCustomize = () => {
    onCustomize()
    // Don't close banner here, let modal handle it
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Icon and Content */}
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  <Cookie className="h-6 w-6 text-yellow-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 work-sans-medium">
                      Küpsiste kasutamine
                    </h3>
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-sm text-gray-500 hover:text-gray-700 underline work-sans-regular"
                    >
                      {isExpanded ? 'Näita vähem' : 'Loe rohkem'}
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 work-sans-regular">
                    <p className="mb-2">
                      Kasutame küpsiseid, et pakkuda teile paremat kasutajakogemust ja analüüsida liiklust.
                    </p>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 border-t border-gray-100 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="font-medium text-gray-900">Vajalikud</span>
                                <p className="text-gray-500 mt-1">Veebisaidi põhifunktsioonid</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Analüütika</span>
                                <p className="text-gray-500 mt-1">Liikluse analüüs ja optimiseerimine</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Turundus</span>
                                <p className="text-gray-500 mt-1">Isikupärastatud reklaam</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Eelistused</span>
                                <p className="text-gray-500 mt-1">Teie seadete meeldejätmine</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 work-sans-regular"
                >
                  <Settings className="h-4 w-4" />
                  Kohanda
                </Button>
                
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 work-sans-regular"
                >
                  Keela kõik
                </Button>
                
                <Button
                  onClick={handleAcceptAll}
                  size="sm"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium work-sans-medium flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Nõustu kõigiga
                </Button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Sulge küpsiste teatis"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Privacy Policy Link */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 work-sans-regular">
                Lugege rohkem meie{' '}
                <a 
                  href="/privaatsuspoliitika" 
                  className="text-yellow-600 hover:text-yellow-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  privaatsuspoliitikast
                </a>
                {' '}ja{' '}
                <a 
                  href="/kasutustingimused" 
                  className="text-yellow-600 hover:text-yellow-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  kasutustingimustest
                </a>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CookieBanner 