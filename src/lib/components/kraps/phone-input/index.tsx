"use client"

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clx } from '@medusajs/ui'

interface Country {
  name: string
  prefix: string
  flag: string
  code: string
}

const countries: Country[] = [
  { name: "Eesti", prefix: "372", flag: "🇪🇪", code: "ee" },
  { name: "Läti", prefix: "371", flag: "🇱🇻", code: "lv" },
  { name: "Leedu", prefix: "370", flag: "🇱🇹", code: "lt" },
  { name: "Soome", prefix: "358", flag: "🇫🇮", code: "fi" },
  { name: "Rootsi", prefix: "46", flag: "🇸🇪", code: "se" },
  { name: "Norra", prefix: "47", flag: "🇳🇴", code: "no" },
  { name: "Taani", prefix: "45", flag: "🇩🇰", code: "dk" },
  { name: "Saksamaa", prefix: "49", flag: "🇩🇪", code: "de" },
  { name: "Poola", prefix: "48", flag: "🇵🇱", code: "pl" },
  { name: "Venemaa", prefix: "7", flag: "🇷🇺", code: "ru" },
  { name: "Ühendkuningriik", prefix: "44", flag: "🇬🇧", code: "gb" },
  { name: "Ameerika Ühendriigid", prefix: "1", flag: "🇺🇸", code: "us" },
  { name: "Kanada", prefix: "1", flag: "🇨🇦", code: "ca" },
  { name: "Prantsusmaa", prefix: "33", flag: "🇫🇷", code: "fr" },
  { name: "Hispaania", prefix: "34", flag: "🇪🇸", code: "es" },
  { name: "Itaalia", prefix: "39", flag: "🇮🇹", code: "it" },
  { name: "Austria", prefix: "43", flag: "🇦🇹", code: "at" },
  { name: "Šveits", prefix: "41", flag: "🇨🇭", code: "ch" },
  { name: "Holland", prefix: "31", flag: "🇳🇱", code: "nl" },
  { name: "Belgia", prefix: "32", flag: "🇧🇪", code: "be" }
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  hasError?: boolean
  errorMessage?: string
  placeholder?: string
  required?: boolean
  onEnterKey?: () => void
  tabIndex?: number
}

export default function PhoneInput({
  value,
  onChange,
  onBlur,
  hasError = false,
  errorMessage,
  placeholder = "1234567",
  required = false,
  onEnterKey,
  tabIndex
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0]) // Default to Estonia
  const [searchTerm, setSearchTerm] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  
  // Validation timing states
  const [isTyping, setIsTyping] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.prefix.includes(searchTerm)
  )

  // Update parent when phone number or country changes
  useEffect(() => {
    const fullNumber = phoneNumber ? `+${selectedCountry.prefix}${phoneNumber}` : ''
    onChange(fullNumber)
  }, [selectedCountry, phoneNumber]) // Removed onChange from dependencies to prevent infinite loop

  // Parse initial value if provided
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const numberWithoutPlus = value.slice(1)
      const country = countries.find(c => numberWithoutPlus.startsWith(c.prefix))
      if (country) {
        setSelectedCountry(country)
        setPhoneNumber(numberWithoutPlus.slice(country.prefix.length))
      }
    }
  }, [value])

  // Debounced validation logic
  useEffect(() => {
    if (isTyping) {
      // Set new timeout for validation
      const timeout = setTimeout(() => {
        setIsTyping(false)
        setShowValidation(true)
      }, 800) // Wait 800ms after user stops typing
      
      setTypingTimeout(timeout)
      
      // Cleanup function
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [isTyping]) // Removed typingTimeout from dependencies

  // Calculate dropdown position for fixed positioning
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      
      // For fixed positioning, use viewport coordinates directly
      setDropdownPosition({
        top: rect.bottom + 4, // 4px gap below the input
        left: rect.left,
        width: rect.width
      })
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      // Update position immediately and after a small delay to ensure proper rendering
      updateDropdownPosition()
      setTimeout(updateDropdownPosition, 10)
      
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('resize', updateDropdownPosition)
      window.addEventListener('scroll', updateDropdownPosition, true) // Use capture for better scroll handling
      
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition)
    }
  }, [isOpen])

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchTerm('')
    // Focus phone input after selection
    setTimeout(() => phoneInputRef.current?.focus(), 100)
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const digits = e.target.value.replace(/\D/g, '')
    setPhoneNumber(digits)
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }
    
    // Mark as typing to delay validation
    setIsTyping(true)
    setShowValidation(false)
  }

  const handlePhoneNumberBlur = () => {
    // Show validation immediately on blur
    setIsTyping(false)
    setShowValidation(true)
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEnterKey?.()
    }
  }

  // Move to next field when Enter is pressed in search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCountries.length > 0) {
        handleCountrySelect(filteredCountries[0])
      }
    }
  }

  const hasValue = phoneNumber.length > 0
  const shouldShowError = showValidation && hasError && !isTyping
  const shouldShowSuccess = showValidation && !hasError && hasValue && !isTyping

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Telefon {required && '*'}
      </label>
      
      <div 
        ref={containerRef}
        className={clx(
          "relative border rounded-xl transition-all duration-200 bg-white",
          {
            "border-red-300 bg-red-50": shouldShowError,
            "border-green-300 bg-green-50": shouldShowSuccess,
            "border-gray-300": !shouldShowError && !shouldShowSuccess,
            "border-yellow-500 ring-2 ring-yellow-500 ring-opacity-20": isOpen,
          }
        )}
      >
        {/* Main Input Container */}
        <div className="flex">
          {/* Country Selector Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen)
              // Force position update when opening
              if (!isOpen) {
                setTimeout(updateDropdownPosition, 0)
              }
            }}
            className={clx(
              "flex items-center justify-center px-3 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-r border-gray-200 rounded-l-xl",
              {
                "bg-yellow-50 hover:bg-yellow-100 border-yellow-200": isOpen,
              }
            )}
            tabIndex={-1} // Don't include in tab order
          >
            <span className="text-lg mr-1">{selectedCountry.flag}</span>
            <svg 
              className={clx(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Phone Input Container */}
          <div className="flex-1 flex">
            {/* Country Code Display */}
            <div className="flex items-center px-3 py-3 text-gray-600 bg-gray-50 border-r border-gray-200">
              <span className="text-sm font-medium">+{selectedCountry.prefix}</span>
            </div>
            
            {/* Phone Number Input */}
            <input
              ref={phoneInputRef}
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              onBlur={handlePhoneNumberBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 px-3 py-3 border-0 rounded-r-xl bg-transparent focus:outline-none text-gray-900"
              required={required}
              tabIndex={tabIndex}
            />
          </div>
        </div>

      </div>

      {/* Portal Dropdown */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden"
          style={{ 
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 99999,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Otsi riike..."
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={clx(
                    "w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-200",
                    selectedCountry.code === country.code && "bg-yellow-50 text-yellow-900"
                  )}
                >
                  <span className="text-lg mr-3">{country.flag}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                  <span className="text-xs text-gray-500">+{country.prefix}</span>
                  {selectedCountry.code === country.code && (
                    <svg className="w-4 h-4 ml-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                Tulemusi ei leitud
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Error Message - only show when validation should be visible */}
      {shouldShowError && errorMessage && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Success Message - only show when validation should be visible */}
      {shouldShowSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="text-green-500">✓</span>
          Õige
        </p>
      )}
    </div>
  )
} 