'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { CookieConsentModalProps, COOKIE_CATEGORIES, CookieConsentSettings } from '../../../types/cookie-consent'
import { X, Cookie, Shield, BarChart3, Megaphone, Settings as SettingsIcon, Check, ChevronDown, ChevronUp } from 'lucide-react'

const CookiePreferencesModal: React.FC<CookieConsentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<CookieConsentSettings>(currentSettings)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Update settings when currentSettings change
  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const handleToggle = (category: keyof CookieConsentSettings) => {
    if (category === 'necessary') return // Necessary cookies cannot be disabled
    
    setSettings(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  const handleAcceptAll = () => {
    const allEnabled: CookieConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    setSettings(allEnabled)
    onSave(allEnabled)
    onClose()
  }

  const handleRejectAll = () => {
    const onlyNecessary: CookieConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
    setSettings(onlyNecessary)
    onSave(onlyNecessary)
    onClose()
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'necessary':
        return <Shield className="h-5 w-5 text-green-500" />
      case 'analytics':
        return <BarChart3 className="h-5 w-5 text-blue-500" />
      case 'marketing':
        return <Megaphone className="h-5 w-5 text-purple-500" />
      case 'preferences':
        return <SettingsIcon className="h-5 w-5 text-orange-500" />
      default:
        return <Cookie className="h-5 w-5 text-gray-500" />
    }
  }

  const getToggleColor = (categoryId: string) => {
    switch (categoryId) {
      case 'necessary':
        return 'bg-green-500'
      case 'analytics':
        return 'bg-blue-500'
      case 'marketing':
        return 'bg-purple-500'
      case 'preferences':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-900 work-sans-semibold">
                  Küpsiste eelistused
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700 work-sans-regular mt-2">
              Valige, milliseid küpsiseid soovite lubada. Vajalikud küpsised on alati lubatud, kuna need on veebisaidi toimimiseks hädavajalikud.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto bg-white">
            <div className="space-y-6">
              {COOKIE_CATEGORIES.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getCategoryIcon(category.id)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 work-sans-medium">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 work-sans-regular mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={`${expandedCategories[category.id] ? 'Peida' : 'Näita'} detaile`}
                      >
                        {expandedCategories[category.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {/* Toggle Switch */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleToggle(category.id)}
                          disabled={category.essential}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${settings[category.id] 
                              ? getToggleColor(category.id) 
                              : 'bg-gray-200'
                            }
                            ${category.essential 
                              ? 'cursor-not-allowed opacity-75' 
                              : 'cursor-pointer hover:shadow-md'
                            }
                          `}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform
                              ${settings[category.id] ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedCategories[category.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm mb-2 work-sans-medium">
                                Kasutamise eesmärgid:
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-600 work-sans-regular">
                                {category.purposes.map((purpose, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    {purpose}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 text-sm mb-2 work-sans-medium">
                                Küpsiste näited:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {category.cookies.map((cookie, index) => (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded font-mono"
                                  >
                                    {cookie}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-600 work-sans-regular">
                  Saate oma eelistusi alati muuta{' '}
                  <a 
                    href="/privaatsuspoliitika" 
                    className="text-yellow-600 hover:text-yellow-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    privaatsuspoliitika
                  </a>
                  {' '}kaudu või lehe jalusest.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                  variant="outline"
                  size="sm"
                  className="border-yellow-300 hover:border-yellow-400 text-yellow-700 hover:text-yellow-800 work-sans-regular"
                >
                  Luba kõik
                </Button>
                
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium work-sans-medium flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Salvesta eelistused
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CookiePreferencesModal 