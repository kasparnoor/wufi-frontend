import { Label } from "@medusajs/ui"
import React, { useEffect, useImperativeHandle, useState, useRef, useCallback } from "react"
import { clx } from '@medusajs/ui'
import { 
  Eye, 
  EyeOff, 
  Phone, 
  ChevronDown, 
  Check, 
  Mail, 
  User, 
  Building2 
} from "lucide-react"
import { 
  parsePhoneNumber, 
  isValidPhoneNumber, 
  formatIncompletePhoneNumber, 
  CountryCode 
} from 'libphonenumber-js'
import ReactCountryFlag from 'react-country-flag'

// Popular countries for phone input
const POPULAR_COUNTRIES = [
  { code: 'EE' as CountryCode, name: 'Estonia', dialCode: '+372' },
  { code: 'LV' as CountryCode, name: 'Latvia', dialCode: '+371' },
  { code: 'LT' as CountryCode, name: 'Lithuania', dialCode: '+370' },
  { code: 'FI' as CountryCode, name: 'Finland', dialCode: '+358' },
  { code: 'SE' as CountryCode, name: 'Sweden', dialCode: '+46' },
  { code: 'NO' as CountryCode, name: 'Norway', dialCode: '+47' },
  { code: 'DK' as CountryCode, name: 'Denmark', dialCode: '+45' },
  { code: 'DE' as CountryCode, name: 'Germany', dialCode: '+49' },
  { code: 'GB' as CountryCode, name: 'United Kingdom', dialCode: '+44' },
  { code: 'US' as CountryCode, name: 'United States', dialCode: '+1' },
]

interface EstonianAddress {
  taisaadress: string
  sihtnumber?: string
  asustusyksus?: string
  maakond?: string
}

type InputVariant = 'default' | 'phone' | 'select' | 'estonian-address'

type BaseInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string
  name: string
  topLabel?: string
  helpText?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  variant?: InputVariant
  icon?: React.ComponentType<{ className?: string }>
}

type PhoneInputProps = BaseInputProps & {
  variant: 'phone'
  onPhoneChange?: (phone: string) => void
  defaultCountry?: string
}

type SelectInputProps = Omit<BaseInputProps, 'type' | 'value' | 'onChange'> & {
  variant: 'select'
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options?: { value: string; label: string }[]
  region?: any
}

type EstonianAddressInputProps = BaseInputProps & {
  variant: 'estonian-address'
  onAddressSelect?: (address: EstonianAddress) => void
}

type DefaultInputProps = BaseInputProps & {
  variant?: 'default'
}

type InputProps = PhoneInputProps | SelectInputProps | EstonianAddressInputProps | DefaultInputProps

const Input = React.forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  (props, ref) => {
    const {
      label,
      name,
      topLabel,
      helpText,
      className,
      required,
      variant = 'default',
      icon: IconComponent,
      ...restProps
    } = props

    const hiddenInputRef = useRef<HTMLInputElement>(null)
    const hiddenSelectRef = useRef<HTMLSelectElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [inputValue, setInputValue] = useState('')

    // Phone-specific state
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>('EE')
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
    const [displayValue, setDisplayValue] = useState('')

    // Estonian address-specific state
    const [suggestions, setSuggestions] = useState<EstonianAddress[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [isLoading, setIsLoading] = useState(false)

    // Password toggle state
    const [showPassword, setShowPassword] = useState(false)

    // Set up refs based on variant
    useImperativeHandle(ref, () => {
      if (variant === 'select') {
        return hiddenSelectRef.current!
      }
      return hiddenInputRef.current!
    })

    // Get display value for the visual input
    const getDisplayValue = (): string => {
      if (variant === 'phone') {
        const currentCountry = POPULAR_COUNTRIES.find(c => c.code === selectedCountry) || POPULAR_COUNTRIES[0]
        return displayValue ? `${currentCountry.dialCode} ${displayValue}` : currentCountry.dialCode
      }
      if (variant === 'select') {
        const selectProps = props as SelectInputProps
        const options = selectProps.options || (selectProps.region?.countries || []).map((country: any) => ({
          value: country.iso_2,
          label: country.display_name
        }))
        const selectedOption = options.find((opt: any) => opt.value === selectProps.value)
        return selectedOption ? selectedOption.label : ''
      }
      return inputValue
    }

    // Check if there's actual user content
    const hasValue = (() => {
      if (variant === 'phone') {
        return Boolean(displayValue.trim())
      }
      if (variant === 'select') {
        return Boolean((props as SelectInputProps).value)
      }
      return Boolean(inputValue.trim())
    })()
    
    const shouldFloatLabel = isFocused || hasValue

    // Container click handler
    const handleContainerClick = () => {
      setIsFocused(true)
      if (variant === 'select') {
        hiddenSelectRef.current?.focus()
      } else {
        hiddenInputRef.current?.focus()
      }
    }

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      
      if (variant === 'estonian-address') {
        const addressProps = props as EstonianAddressInputProps
        searchEstonianAddresses(value)
        addressProps.onChange?.(e as any)
      } else {
        const defaultProps = props as DefaultInputProps
        defaultProps.onChange?.(e as any)
      }
    }

    // Handle select changes
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectProps = props as SelectInputProps
      selectProps.onChange(e)
    }

    // Phone input handling
    const handlePhoneInput = (value: string) => {
      const phoneProps = props as PhoneInputProps
      const currentCountry = POPULAR_COUNTRIES.find(c => c.code === selectedCountry) || POPULAR_COUNTRIES[0]
      
      // Extract only the number part after prefix
      let numberPart = ''
      const prefix = currentCountry.dialCode + ' '
      if (value.startsWith(prefix)) {
        numberPart = value.substring(prefix.length)
      } else {
        numberPart = value.replace(/[+\s]/g, '').replace(/^\d{1,3}/, '')
      }
      
      // Clean and format the number
      const cleanValue = numberPart.replace(/[^\d\s]/g, '')
      const formatted = formatIncompletePhoneNumber(cleanValue, selectedCountry)
      setDisplayValue(formatted)
      
      const fullNumber = currentCountry.dialCode + cleanValue.replace(/\s/g, '')
      phoneProps.onPhoneChange?.(fullNumber)
    }

    // Estonian address search
    const searchEstonianAddresses = useCallback(async (query: string) => {
      if (!query || query.length < 3) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`https://api.maaamet.ee/ads/rest/client/1.0.0/detach/get/addresses?keyword=${encodeURIComponent(query)}&max=10`)
        const data = await response.json()
        
        if (data?.responseStatus === 'OK' && data?.responseBody?.aadressDetailDtoList) {
          const addresses = data.responseBody.aadressDetailDtoList.map((addr: any) => ({
            taisaadress: addr.taisaadress || '',
            sihtnumber: addr.sihtnumber || '',
            asustusyksus: addr.asustusyksus || '',
            maakond: addr.maakond || '',
          }))
          setSuggestions(addresses)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Address search error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, [])

    // Styling
    const getContainerStyles = () => {
      const baseStyles = [
        "relative flex items-center w-full h-16 bg-white cursor-text",
        "border-2 rounded-xl transition-all duration-200",
      ]

      const stateStyles = (() => {
        if (isFocused) return "border-yellow-400 ring-2 ring-yellow-100"
        if (isValid === true) return "border-green-500 ring-2 ring-green-100"
        if (isValid === false) return "border-red-500 ring-2 ring-red-100 bg-red-50"
        return "border-gray-300 hover:border-gray-400"
      })()

      return clx(baseStyles, stateStyles)
    }

    const getLabelStyles = () => {
      const baseStyles = [
        "absolute transition-all duration-300 pointer-events-none select-none",
        "flex items-center" // This ensures perfect vertical centering
      ]

      const positionStyles = (() => {
        if (variant === 'phone') {
          return shouldFloatLabel 
            ? "left-24 -top-3 bg-white px-2 z-10"
            : "left-24 top-0 bottom-0"
        }
        if (IconComponent) {
          return shouldFloatLabel
            ? "left-12 -top-3 bg-white px-2 z-10"
            : "left-12 top-0 bottom-0"
        }
        return shouldFloatLabel
          ? "left-4 -top-3 bg-white px-2 z-10"
          : "left-4 top-0 bottom-0"
      })()

      const sizeStyles = shouldFloatLabel ? "!text-base" : "!text-xl"

      const colorStyles = (() => {
        if (isFocused) return "!text-yellow-600"
        if (isValid === true) return "!text-green-600"
        if (isValid === false) return "!text-red-600"
        return shouldFloatLabel ? "!text-gray-700" : "!text-gray-500"
      })()

      return clx(baseStyles, positionStyles, sizeStyles, colorStyles)
    }

    const getContentStyles = () => {
      const baseStyles = [
        "flex-1 text-lg text-gray-900 bg-transparent outline-none border-0"
      ]

      const paddingStyles = (() => {
        if (variant === 'phone') return shouldFloatLabel ? "pl-24 pr-12 pt-3" : "pl-24 pr-12"
        if (variant === 'select') return shouldFloatLabel ? "px-4 pt-3 pr-12" : "px-4 pr-12"
        if (IconComponent) return shouldFloatLabel ? "pl-12 pr-4 pt-3" : "pl-12 pr-4"
        const inputProps = props as DefaultInputProps | EstonianAddressInputProps
        if (inputProps.type === "password") return shouldFloatLabel ? "px-4 pr-12 pt-3" : "px-4 pr-12"
        return shouldFloatLabel ? "px-4 pt-3" : "px-4"
      })()

      return clx(baseStyles, paddingStyles)
    }

    const getActualInputStyles = () => {
      const baseStyles = [
        "absolute inset-0 w-full h-full bg-transparent border-0 outline-none",
        "text-transparent caret-gray-900", // Make text transparent but keep cursor visible
        "selection:bg-yellow-200" // Show text selection
      ]

      const paddingStyles = (() => {
        if (variant === 'phone') return shouldFloatLabel ? "pl-24 pr-12 pt-3" : "pl-24 pr-12"
        if (variant === 'select') return "px-4" // Select doesn't need complex padding
        if (IconComponent) return shouldFloatLabel ? "pl-12 pr-4 pt-3" : "pl-12 pr-4"
        const inputProps = props as DefaultInputProps | EstonianAddressInputProps
        if (inputProps.type === "password") return shouldFloatLabel ? "px-4 pr-12 pt-3" : "px-4 pr-12"
        return shouldFloatLabel ? "px-4 pt-3" : "px-4"
      })()

      return clx(baseStyles, paddingStyles)
    }

    // Initialize values
    useEffect(() => {
      if (variant === 'phone') {
        const phoneProps = props as PhoneInputProps
        const phoneValue = String(phoneProps.value || '')
        if (phoneValue && phoneValue !== getDisplayValue()) {
          try {
            const phoneNumber = parsePhoneNumber(phoneValue)
            if (phoneNumber?.country && phoneNumber.country !== selectedCountry) {
              setSelectedCountry(phoneNumber.country)
            }
            if (phoneNumber?.nationalNumber) {
              const formatted = formatIncompletePhoneNumber(phoneNumber.nationalNumber, phoneNumber.country)
              setDisplayValue(formatted)
            }
          } catch {
            const currentCountry = POPULAR_COUNTRIES.find(c => c.code === selectedCountry) || POPULAR_COUNTRIES[0]
            const withoutPrefix = phoneValue.replace(currentCountry.dialCode, '').trim()
            setDisplayValue(withoutPrefix)
          }
        }
      } else if (variant !== 'select') {
        const value = String((props as any).value || '')
        if (value !== inputValue) {
          setInputValue(value)
        }
      }
    }, [(props as any).value, variant, selectedCountry])

    return (
      <div className={clx("flex flex-col w-full", className)}>
        {topLabel && (
          <Label className="mb-3 text-sm font-semibold text-gray-900">
            {topLabel}
          </Label>
        )}

        <div className={getContainerStyles()} onClick={handleContainerClick} ref={containerRef}>
          {/* Actual input for cursor and form handling */}
          {variant === 'select' ? (
            <select
              ref={hiddenSelectRef}
              name={name}
              value={(props as SelectInputProps).value}
              required={required}
              className="sr-only"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={handleSelectChange}
            >
              <option value="">Vali...</option>
              {((props as SelectInputProps).options || ((props as SelectInputProps).region?.countries || []).map((country: any) => ({
                value: country.iso_2,
                label: country.display_name
              }))).map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={hiddenInputRef}
              type={showPassword ? "text" : (props as any).type}
              name={name}
              value={variant === 'phone' ? getDisplayValue() : inputValue}
              required={required}
              className={getActualInputStyles()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={handleInputChange}
            />
          )}

          {/* Visual content */}
          <div className={getContentStyles()}>
            {getDisplayValue() || (!shouldFloatLabel ? '' : '')}
          </div>

          {/* Icons and controls */}
          {IconComponent && variant !== 'phone' && (
            <IconComponent className="absolute left-4 w-5 h-5 text-gray-400" />
          )}

          {variant === 'phone' && (
            <>
              <div className="absolute left-3 flex items-center">
                <button
                  type="button"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors border-r border-gray-200 pr-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsCountryDropdownOpen(!isCountryDropdownOpen)
                  }}
                >
                  <ReactCountryFlag countryCode={selectedCountry} svg style={{ width: '20px', height: '15px' }} />
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
              </div>
              <Phone className="absolute right-4 w-5 h-5 text-gray-400" />
            </>
          )}

          {variant === 'select' && (
            <ChevronDown className="absolute right-4 w-5 h-5 text-gray-400 pointer-events-none" />
          )}

          {(props as any).type === "password" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowPassword(!showPassword)
              }}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          )}

          {/* Label - hidden for phone variant */}
          {variant !== 'phone' && (
            <div className={getLabelStyles()}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </div>
          )}
        </div>

        {helpText && (
          <p className="mt-2 text-sm text-gray-600">{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
