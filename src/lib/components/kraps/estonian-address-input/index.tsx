"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clx } from '@medusajs/ui'

// Estonian counties
const estonianCounties = [
  "Harjumaa",
  "Hiiumaa",
  "Ida-Virumaa",
  "Jõgevamaa",
  "Järvamaa",
  "Läänemaa",
  "Lääne-Virumaa",
  "Põlvamaa",
  "Pärnumaa",
  "Raplamaa",
  "Saaremaa",
  "Tartumaa",
  "Valgamaa",
  "Viljandimaa",
  "Võrumaa"
]

interface AddressData {
  street: string
  houseNumber: string
  apartment: string
  postalCode: string
  city: string
  county: string
  country: string
  note: string
}

interface AddressSuggestion {
  pikkaadress: string
  aadresstekst: string
  maakond: string
  omavalitsus: string
  sihtnumber: string
  asustusyksus: string
}

interface EstonianAddressInputProps {
  value: AddressData
  onChange: (value: AddressData) => void
  onBlur?: () => void
  hasError?: boolean
  errorMessage?: string
  required?: boolean
  showNote?: boolean
}

// Custom input component with validation
const ValidatedInput = ({ 
  fieldName, 
  label, 
  placeholder, 
  type = "text",
  required = false,
  addressData,
  fieldTouched,
  validationErrors,
  handleInputChange,
  handleInputBlur
}: {
  fieldName: keyof AddressData
  label: string
  placeholder: string
  type?: string
  required?: boolean
  addressData: AddressData
  fieldTouched: Record<string, boolean>
  validationErrors: Record<string, string>
  handleInputChange: (fieldName: keyof AddressData, value: string) => void
  handleInputBlur: (fieldName: keyof AddressData) => void
}) => {
  const hasError = fieldTouched[fieldName] && validationErrors[fieldName]
  const hasValue = (addressData[fieldName]?.length || 0) > 0
  const inputId = `address-${fieldName}`
  
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={addressData[fieldName] || ''}
        onChange={(e) => handleInputChange(fieldName, e.target.value)}
        onBlur={() => handleInputBlur(fieldName)}
        placeholder={placeholder}
        className={clx(
          "w-full px-3 py-3 border rounded-xl transition-all duration-200",
          {
            "border-red-300 bg-red-50": hasError,
            "border-green-300 bg-green-50": !hasError && hasValue,
            "border-gray-300": !hasError && !hasValue,
          }
        )}
        required={required}
      />
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {validationErrors[fieldName]}
        </p>
      )}
      {!hasError && hasValue && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="text-green-500">✓</span>
          Õige
        </p>
      )}
    </div>
  )
}

export default function EstonianAddressInput({
  value,
  onChange,
  onBlur,
  hasError = false,
  errorMessage,
  required = false,
  showNote = true
}: EstonianAddressInputProps) {
  const [addressData, setAddressData] = useState<AddressData>(value)
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // Address autocomplete states
  const [addressQuery, setAddressQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0, width: 0 })
  
  // County dropdown states
  const [showCountyDropdown, setShowCountyDropdown] = useState(false)
  const [countyPosition, setCountyPosition] = useState({ top: 0, left: 0, width: 0 })
  
  const addressInputRef = useRef<HTMLInputElement>(null)
  const suggestionDropdownRef = useRef<HTMLDivElement>(null)
  const countyInputRef = useRef<HTMLButtonElement>(null)
  const countyDropdownRef = useRef<HTMLDivElement>(null)

  // Validation functions
  const validateField = (fieldName: keyof AddressData, fieldValue: string): string => {
    switch (fieldName) {
      case 'street':
        if (!fieldValue.trim()) return 'Tänav on kohustuslik'
        if (fieldValue.length < 2) return 'Tänav peab olema vähemalt 2 tähemärki'
        return ''
      case 'houseNumber':
        if (!fieldValue.trim()) return 'Maja number on kohustuslik'
        return ''
      case 'postalCode':
        if (!fieldValue.trim()) return 'Postiindeks on kohustuslik'
        if (!/^\d{5}$/.test(fieldValue)) return 'Postiindeks peab olema 5 numbrit'
        return ''
      case 'city':
        if (!fieldValue.trim()) return 'Linn/vald on kohustuslik'
        return ''
      case 'county':
        if (!fieldValue.trim()) return 'Maakond on kohustuslik'
        return ''
      default:
        return ''
    }
  }

  const handleInputChange = (fieldName: keyof AddressData, fieldValue: string) => {
    const newData = { ...addressData, [fieldName]: fieldValue }
    setAddressData(newData)
    onChange(newData)
    
    // Clear validation error when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const handleInputBlur = (fieldName: keyof AddressData) => {
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }))
    const error = validateField(fieldName, addressData[fieldName])
    setValidationErrors(prev => ({ ...prev, [fieldName]: error }))
    onBlur?.()
  }

  // Address autocomplete functionality
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoadingSuggestions(true)
    
    // Create timeout controller for address search
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await fetch(`https://inaadress.maaamet.ee/inaadress/gazetteer?address=${encodeURIComponent(query)}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.addresses && Array.isArray(data.addresses)) {
        setSuggestions(data.addresses.slice(0, 5)) // Limit to 5 suggestions
      } else {
        setSuggestions([])
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('Address search timed out after 5 seconds')
        } else {
          console.error('Address search failed:', error.message)
        }
      } else {
        console.error('Address search failed:', error)
      }
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Debounced address search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressQuery) {
        searchAddresses(addressQuery)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [addressQuery])

  const updateSuggestionPosition = () => {
    if (addressInputRef.current) {
      const rect = addressInputRef.current.getBoundingClientRect()
      setSuggestionPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }

  const updateCountyPosition = () => {
    if (countyInputRef.current) {
      const rect = countyInputRef.current.getBoundingClientRect()
      setCountyPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    // Parse the address suggestion and fill in the fields
    const addressParts = suggestion.aadresstekst.split(' ')
    const houseNumber = addressParts[addressParts.length - 1]
    const street = addressParts.slice(0, -1).join(' ')
    
    const newData = {
      ...addressData,
      street: street,
      houseNumber: houseNumber,
      city: suggestion.omavalitsus,
      county: suggestion.maakond,
      postalCode: suggestion.sihtnumber,
      country: 'Eesti'
    }
    
    setAddressData(newData)
    onChange(newData)
    setAddressQuery('')
    setShowSuggestions(false)
  }

  const handleCountySelect = (county: string) => {
    const newData = { ...addressData, county }
    setAddressData(newData)
    onChange(newData)
    setShowCountyDropdown(false)
  }

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionDropdownRef.current && !suggestionDropdownRef.current.contains(event.target as Node) &&
          addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      
      if (countyDropdownRef.current && !countyDropdownRef.current.contains(event.target as Node) &&
          countyInputRef.current && !countyInputRef.current.contains(event.target as Node)) {
        setShowCountyDropdown(false)
      }
    }

    if (showSuggestions || showCountyDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      if (showSuggestions) updateSuggestionPosition()
      if (showCountyDropdown) updateCountyPosition()
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions, showCountyDropdown])

  return (
    <div className="space-y-4">
      {/* Address Search */}
      <div className="space-y-1">
        <label htmlFor="address-search" className="block text-sm font-medium text-gray-700">
          Aadress *
        </label>
        <div className="relative">
          <input
            id="address-search"
            ref={addressInputRef}
            type="text"
            value={addressQuery}
            onChange={(e) => {
              setAddressQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            placeholder="Alusta aadressi sisestamist..."
            className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500"
          />
          {isLoadingSuggestions && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            </div>
          )}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Alusta aadressi sisestamist automaatseks leidmiseks või täida väljad käsitsi allpool
        </p>
      </div>

      {/* Address Suggestions Portal */}
      {showSuggestions && suggestions.length > 0 && typeof window !== 'undefined' && createPortal(
        <div 
          ref={suggestionDropdownRef}
          className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50"
          style={{ 
            position: 'fixed',
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            width: suggestionPosition.width,
            zIndex: 99999,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAddressSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-sm">{suggestion.aadresstekst}</div>
              <div className="text-xs text-gray-500">{suggestion.pikkaadress}</div>
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Manual Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedInput
          fieldName="street"
          label="Tänav *"
          placeholder="Tänava nimi"
          required
          addressData={addressData}
          fieldTouched={fieldTouched}
          validationErrors={validationErrors}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <ValidatedInput
            fieldName="houseNumber"
            label="Maja nr *"
            placeholder="15"
            required
            addressData={addressData}
            fieldTouched={fieldTouched}
            validationErrors={validationErrors}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
          />
          
          <ValidatedInput
            fieldName="apartment"
            label="Korter"
            placeholder="12"
            addressData={addressData}
            fieldTouched={fieldTouched}
            validationErrors={validationErrors}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedInput
          fieldName="city"
          label="Linn/vald *"
          placeholder="Tallinn"
          required
          addressData={addressData}
          fieldTouched={fieldTouched}
          validationErrors={validationErrors}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
        />
        
        <ValidatedInput
          fieldName="postalCode"
          label="Postiindeks *"
          placeholder="10001"
          required
          addressData={addressData}
          fieldTouched={fieldTouched}
          validationErrors={validationErrors}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
        />
      </div>

      {/* County Selection */}
      <div className="space-y-1">
        <label htmlFor="county-select" className="block text-sm font-medium text-gray-700">
          Maakond *
        </label>
        <button 
          id="county-select"
          ref={countyInputRef}
          type="button"
          aria-expanded={showCountyDropdown}
          aria-haspopup="listbox"
          className={clx(
            "relative border rounded-xl transition-all duration-200 bg-white cursor-pointer w-full",
            {
              "border-red-300 bg-red-50": fieldTouched.county && validationErrors.county,
              "border-green-300 bg-green-50": !validationErrors.county && addressData.county,
              "border-gray-300": !validationErrors.county && !addressData.county,
              "border-yellow-500 ring-2 ring-yellow-500 ring-opacity-20": showCountyDropdown,
            }
          )}
          onClick={() => setShowCountyDropdown(!showCountyDropdown)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowCountyDropdown(!showCountyDropdown)
            }
          }}
        >
          <div className="flex items-center justify-between px-3 py-3">
            <span className={clx(
              "text-sm",
              addressData.county ? "text-gray-900" : "text-gray-500"
            )}>
              {addressData.county || "Vali maakond"}
            </span>
            <svg 
              className={clx(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                showCountyDropdown && "rotate-180"
              )}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {fieldTouched.county && validationErrors.county && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {validationErrors.county}
          </p>
        )}
        {!validationErrors.county && addressData.county && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <span className="text-green-500">✓</span>
            Õige
          </p>
        )}
      </div>

      {/* County Dropdown Portal */}
      {showCountyDropdown && typeof window !== 'undefined' && createPortal(
        <div 
          ref={countyDropdownRef}
          className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
          style={{ 
            position: 'fixed',
            top: countyPosition.top,
            left: countyPosition.left,
            width: countyPosition.width,
            zIndex: 99999,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {estonianCounties.map((county) => (
            <button
              key={county}
              type="button"
              onClick={() => handleCountySelect(county)}
              className={clx(
                "w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors duration-200",
                addressData.county === county && "bg-yellow-50 text-yellow-900"
              )}
            >
              <span className="text-sm">{county}</span>
              {addressData.county === county && (
                <svg className="inline w-4 h-4 ml-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Country (Fixed to Estonia) */}
      <div className="space-y-1">
        <span className="block text-sm font-medium text-gray-700">
          Riik *
        </span>
        <div className="px-3 py-3 border border-green-300 bg-green-50 rounded-xl">
          <div className="flex items-center">
            <span className="text-lg mr-2">🇪🇪</span>
            <span className="text-sm text-gray-900">Eesti</span>
            <span className="text-green-500 ml-auto">✓</span>
          </div>
        </div>
      </div>

      {/* Optional Note for Kuller */}
      {showNote && (
        <div className="space-y-1">
          <label htmlFor="address-note" className="block text-sm font-medium text-gray-700">
            Märkused kulleri jaoks
          </label>
          <textarea
            id="address-note"
            value={addressData.note || ''}
            onChange={(e) => handleInputChange('note', e.target.value)}
            placeholder="Lisainfo aadressi kohta (valikuline)"
            rows={3}
            className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 resize-none"
          />
          <p className="text-xs text-gray-500">
            Näiteks: &quot;2. korrus&quot;, &quot;sinise uksega&quot;, &quot;helistage ukse juures&quot;
          </p>
        </div>
      )}

      {/* Error Message */}
      {hasError && errorMessage && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {errorMessage}
        </p>
      )}
    </div>
  )
} 