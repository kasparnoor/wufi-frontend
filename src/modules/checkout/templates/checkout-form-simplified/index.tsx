"use client"

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HttpTypes } from "@medusajs/types"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { User, Building2, Truck, Package, CreditCard, CheckCircle, ArrowLeft } from "lucide-react"
import { KrapsButton, ModernInput, PhoneInput, EstonianAddressInput } from "@lib/components"
import { setAddresses, updateCart, initiatePaymentSession, setShippingMethod } from "@lib/data/cart"
import { listCartPaymentMethods } from "@lib/data/payment"
import { loadLocations, getLocationDisplayName, type Location } from "@lib/util/locations"
import { login, checkCustomerExists as checkCustomerExistsServer } from "@lib/data/customer"
import Payment from "@modules/checkout/components/payment"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import Review from "@modules/checkout/components/review"
import { clx } from "@medusajs/ui"
import { trackInitiateCheckout, convertCartItemsToMetaPixel, calculateCartValue } from "@lib/util/meta-pixel"
  


type CustomerType = 'individual' | 'business'
type DeliveryMethod = 'kuller' | 'pakiautomaat'

interface ContactInfo {
  email: string
  first_name: string
  last_name: string
  phone: string
  company?: string
  company_registration?: string
}

interface ValidationErrors {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  company?: string
  company_registration?: string
}

interface FieldTouched {
  first_name: boolean
  last_name: boolean
  email: boolean
  phone: boolean
  company: boolean
  company_registration: boolean
}

interface AddressInfo {
  street: string
  houseNumber: string
  apartment: string
  postalCode: string
  city: string
  county: string
  country: string
  note: string
}

// These will be loaded from the JSON file

// Custom input component with validation - moved outside to prevent re-creation on each render
const ValidatedInput = React.forwardRef<HTMLInputElement, { 
  fieldName: keyof ContactInfo
  label: string
  placeholder: string
  type?: string
  required?: boolean
  contactInfo: ContactInfo
  fieldTouched: FieldTouched
  validationErrors: ValidationErrors
  handleInputChange: (fieldName: keyof ContactInfo, value: string) => void
  handleInputBlur: (fieldName: keyof ContactInfo) => void
  onEnterKey?: () => void
}>(({ 
  fieldName, 
  label, 
  placeholder, 
  type = "text",
  required = false,
  contactInfo,
  fieldTouched,
  validationErrors,
  handleInputChange,
  handleInputBlur,
  onEnterKey
}, ref) => {
  const [isTyping, setIsTyping] = React.useState(false)
  const [showValidation, setShowValidation] = React.useState(false)
  const [typingTimeout, setTypingTimeout] = React.useState<NodeJS.Timeout | null>(null)
  
  const hasError = fieldTouched[fieldName] && validationErrors[fieldName]
  const hasValue = (contactInfo[fieldName]?.length || 0) > 0
  
  // Debounced validation logic
  React.useEffect(() => {
    if (isTyping) {
      // Set new timeout for validation
      const timeout = setTimeout(() => {
        setIsTyping(false)
        setShowValidation(true)
      }, 600) // Shorter delay for text inputs
      
      setTypingTimeout(timeout)
      
      // Cleanup function
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [isTyping]) // Removed typingTimeout from dependencies
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(fieldName, e.target.value)
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }
    
    // Mark as typing to delay validation
    if (e.target.value.length > 0) {
      setIsTyping(true)
      setShowValidation(false)
    } else {
      // Show validation immediately when field is empty
      setIsTyping(false)
      setShowValidation(true)
    }
  }
  
  const handleBlur = () => {
    // Show validation immediately on blur
    setIsTyping(false)
    setShowValidation(true)
    handleInputBlur(fieldName)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEnterKey?.()
    }
  }
  
  const shouldShowError = showValidation && hasError && !isTyping
  const shouldShowSuccess = showValidation && !hasError && hasValue && fieldTouched[fieldName] && !isTyping
  
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={contactInfo[fieldName] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={clx(
          "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200",
          {
            "border-red-300 bg-red-50": shouldShowError,
            "border-green-300 bg-green-50": shouldShowSuccess,
            "border-gray-300 bg-white": !shouldShowError && !shouldShowSuccess,
          }
        )}
        required={required}
        ref={ref}
      />
      {shouldShowError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {validationErrors[fieldName]}
        </p>
      )}
      {shouldShowSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="text-green-500">✓</span>
          Õige
        </p>
      )}
    </div>
  )
})

ValidatedInput.displayName = 'ValidatedInput'

export default function CheckoutFormSimplified({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  // Refs for keyboard navigation
  const firstNameRef = React.useRef<HTMLInputElement>(null)
  const lastNameRef = React.useRef<HTMLInputElement>(null)
  const emailRef = React.useRef<HTMLInputElement>(null)
  const phoneRef = React.useRef<HTMLInputElement>(null)
  // Create a mock cart for testing if none exists
  const workingCart = cart || ({
    id: 'test-cart',
    total: 5000, // 50€ for testing
    email: '',
    metadata: {}
  } as any)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get current step from URL - ensure we always have a valid step
  const currentStepParam = searchParams?.get("step")
  const [currentStep, setCurrentStep] = useState<string>('customer') // Start with stable default
  
  // Update step only on client after hydration
  useEffect(() => {
    const validSteps = ['customer', 'delivery', 'payment', 'review']
    let targetStep = 'customer'
    
    if (currentStepParam === 'autoship') {
      targetStep = 'customer'
    } else if (currentStepParam && validSteps.includes(currentStepParam)) {
      targetStep = currentStepParam
    }
    
    setCurrentStep(targetStep)
  }, [currentStepParam])
  
  // Form state
  const [customerType, setCustomerType] = useState<CustomerType>('individual')
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: customer?.email || '',
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    company_registration: ''
  })
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pakiautomaat')
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    street: '',
    houseNumber: '',
    apartment: '',
    postalCode: '',
    city: '',
    county: '',
    country: 'Eesti',
    note: ''
  })
  const [selectedPakiautomaat, setSelectedPakiautomaat] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [fieldTouched, setFieldTouched] = useState<FieldTouched>({
    first_name: false,
    last_name: false,
    email: false,
    phone: false,
    company: false,
    company_registration: false
  })
  
  // Add payment methods state
  const [paymentMethods, setPaymentMethods] = useState<any[] | null>(null)

  // Add locations state
  const [locations, setLocations] = useState<Location[]>([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [locationSearch, setLocationSearch] = useState('')
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  
  // Refs for dropdown positioning
  const locationInputRef = useRef<HTMLDivElement>(null)
  const locationDropdownRef = useRef<HTMLDivElement>(null)

  // Add customer existence check state with stable initial state
  const [existingCustomerCheck, setExistingCustomerCheck] = useState<{
    checked: boolean
    exists: boolean
    email: string
  }>({ checked: false, exists: false, email: '' })
  
  // Prevent hydration mismatch by deferring customer check
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Add inline login state
  const [inlineLogin, setInlineLogin] = useState<{
    password: string
    isLoggingIn: boolean
    showPasswordField: boolean
    loginError: string | null
  }>({
    password: '',
    isLoggingIn: false,
    showPasswordField: false,
    loginError: null
  })

  // Function to check if customer exists
  const checkCustomerExists = React.useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return
    
    try {
      const data = await checkCustomerExistsServer(email)
      setExistingCustomerCheck({
        checked: true,
        exists: data.exists,
        email: email
      })
      
      // Reset inline login state when checking new email
      setInlineLogin({
        password: '',
        isLoggingIn: false,
        showPasswordField: false,
        loginError: null
      })
    } catch (error) {
      console.error('Failed to check customer existence:', error)
      // Fallback to not exists on error
      setExistingCustomerCheck({
        checked: true,
        exists: false,
        email: email
      })
    }
  }, [])

  // Function to handle inline login
  const handleInlineLogin = async () => {
    if (!inlineLogin.password.trim()) {
      setInlineLogin(prev => ({ ...prev, loginError: 'Palun sisestage parool' }))
      return
    }

    setInlineLogin(prev => ({ ...prev, isLoggingIn: true, loginError: null }))

    try {
      // Create FormData as expected by the login function
      const formData = new FormData()
      formData.append('email', contactInfo.email)
      formData.append('password', inlineLogin.password)

      // Call the existing login function
      const result = await login(null, formData)

      if (result && typeof result === 'string') {
        // Login failed - result contains error message
        setInlineLogin(prev => ({ 
          ...prev, 
          loginError: 'Vale e-post või parool' 
        }))
      } else {
        // Login successful - refresh the page to get the authenticated session
        window.location.reload()
      }
    } catch (error) {
      console.error('Login failed:', error)
      setInlineLogin(prev => ({ 
        ...prev, 
        loginError: 'Sisselogimise viga. Palun proovige uuesti.' 
      }))
    } finally {
      setInlineLogin(prev => ({ ...prev, isLoggingIn: false }))
    }
  }

  // Load locations on component mount
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        setLocationsLoading(true)
        const locationData = await loadLocations()
        setLocations(locationData)
        // Restore persisted selection after refresh
        const persisted = typeof window !== 'undefined' ? window.localStorage.getItem('checkout:selectedPakiautomaat') : null
        if (persisted && !selectedPakiautomaat) {
          setSelectedPakiautomaat(persisted)
        }
      } catch (error) {
        console.error('Failed to load locations:', error)
      } finally {
        setLocationsLoading(false)
      }
    }
    loadLocationData()
  }, [])

  // Handle dropdown positioning and click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node) &&
          locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
      }
    }

    if (showLocationDropdown) {
      // Update position immediately and after a small delay to ensure proper rendering
      updateDropdownPosition()
      setTimeout(updateDropdownPosition, 10)
      
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('resize', updateDropdownPosition)
      window.addEventListener('scroll', updateDropdownPosition, true) // Use capture for better scroll handling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition)
    }
  }, [showLocationDropdown])

  // Filter locations based on search
  const filteredLocations = locations.filter(location => {
    if (!locationSearch.trim()) return true
    const searchTerm = locationSearch.toLowerCase()
    return (
      location.name.toLowerCase().includes(searchTerm) ||
      location.city.toLowerCase().includes(searchTerm) ||
      location.address.toLowerCase().includes(searchTerm) ||
      location.county.toLowerCase().includes(searchTerm)
    )
  })

  // Track InitiateCheckout event when checkout process starts
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      const metaPixelProducts = convertCartItemsToMetaPixel(cart.items)
      const cartValue = calculateCartValue(cart.items)
      
      trackInitiateCheckout({
        content_ids: cart.items.map(item => item.variant_id || item.id),
        contents: metaPixelProducts,
        currency: cart.currency_code?.toUpperCase() || 'EUR',
        value: cartValue,
        num_items: cart.items.length
      })
    }
  }, []) // Only run once when component mounts

  // Load payment methods when cart or region changes
  useEffect(() => {
    if (cart?.region?.id) {
      const loadPaymentMethods = async () => {
        try {
          console.log('Loading payment methods for region:', cart.region?.id)
          const methods = await listCartPaymentMethods(cart.region?.id || '')
          console.log('Payment methods loaded:', methods)
          setPaymentMethods(methods)
        } catch (error) {
          console.warn('Failed to load payment methods:', error)
          setPaymentMethods([])
        }
      }
      loadPaymentMethods()
    }
  }, [cart?.region?.id])

  // Also load payment methods when entering review step (instead of payment step)
  useEffect(() => {
    if (currentStep === 'review' && cart?.region?.id && !paymentMethods?.length) {
      const loadPaymentMethods = async () => {
        try {
          console.log('Loading payment methods for review step:', cart.region?.id)
          const methods = await listCartPaymentMethods(cart.region?.id || '')
          console.log('Payment methods loaded:', methods)
          setPaymentMethods(methods)
          
          // Also initialize payment session to ensure we have a client secret
          if (cart && !cart.payment_collection?.payment_sessions?.length) {
            try {
              console.log('Initializing payment session for review step...')
              await initiatePaymentSession(cart, {
                provider_id: "pp_stripe_stripe",
              })
              console.log('Payment session initialized for review step')
            } catch (paymentError: any) {
              console.warn('Failed to initialize payment session:', paymentError)
            }
          }
        } catch (error) {
          console.warn('Failed to load payment methods:', error)
          setPaymentMethods([])
        }
      }
      loadPaymentMethods()
    }
  }, [currentStep, cart?.region?.id, paymentMethods?.length])

  // Get order total (already in euros)
  const orderTotalInEuros = workingCart?.total || 0

  // Determine if address is required based on user's logic
  const isAddressRequired = () => {
    return (
      customerType === 'business' || 
      orderTotalInEuros > 160 || 
      deliveryMethod === 'kuller'
    )
  }

  // Steps configuration
  const steps = [
    { id: 'customer', name: 'Klient', icon: User },
    { id: 'delivery', name: 'Tarne', icon: Truck },
    { id: 'review', name: 'Kinnitamine', icon: CheckCircle }
  ]

  // URL drives state via the effect above; navigation uses goToStep which pushes to URL.

  // Clear customer existence check when user becomes authenticated
  useEffect(() => {
    if (customer && existingCustomerCheck.exists) {
      setExistingCustomerCheck({ checked: false, exists: false, email: '' })
      setInlineLogin({
        password: '',
        isLoggingIn: false,
        showPasswordField: false,
        loginError: null
      })
    }
  }, [customer, existingCustomerCheck.exists])

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email on kohustuslik'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Palun sisestage kehtiv emaili aadress'
    
    // Don't return validation error for existing customers since we have inline login
    // The inline login UI will handle this case
    
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Telefon on kohustuslik'
    const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/
    if (!phoneRegex.test(phone)) return 'Palun sisestage kehtiv telefoninumber'
    return undefined
  }

  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name.trim()) return `${fieldName} on kohustuslik`
    if (name.length < 2) return `${fieldName} peab olema vähemalt 2 tähemärki pikk`
    return undefined
  }

  const validateCompany = (company: string): string | undefined => {
    if (!company.trim()) return 'Ettevõtte nimi on kohustuslik'
    return undefined
  }

  const validateCompanyRegistration = (registration: string): string | undefined => {
    if (!registration.trim()) return 'Registrikood on kohustuslik'
    if (registration.length < 8) return 'Registrikood peab olema vähemalt 8 numbrit'
    return undefined
  }

  const validateField = React.useCallback((fieldName: keyof ContactInfo, value: string): string | undefined => {
    switch (fieldName) {
      case 'email':
        return validateEmail(value)
      case 'phone':
        return validatePhone(value)
      case 'first_name':
        return validateName(value, 'Eesnimi')
      case 'last_name':
        return validateName(value, 'Perekonnanimi')
      case 'company':
        return customerType === 'business' ? validateCompany(value) : undefined
      case 'company_registration':
        return customerType === 'business' ? validateCompanyRegistration(value) : undefined
      default:
        return undefined
    }
  }, [customerType])

  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {}
    
    Object.keys(contactInfo).forEach((key) => {
      const fieldName = key as keyof ContactInfo
      const value = contactInfo[fieldName] || ''
      const error = validateField(fieldName, value)
      if (error) {
        errors[fieldName] = error
      }
    })

    return errors
  }

  const isStep1Valid = () => {
    const errors = validateAllFields()
    const hasValidationErrors = Object.keys(errors).length > 0
    
    // Check if customer already exists and hasn't logged in
    const customerExistsAndNotLoggedIn = existingCustomerCheck.checked && 
                                        existingCustomerCheck.email === contactInfo.email && 
                                        existingCustomerCheck.exists &&
                                        !customer // Not logged in
    
    // Check if customer existence check is needed but not completed
    const emailNeedsCheck = contactInfo.email && 
                           contactInfo.email.includes('@') && 
                           (!existingCustomerCheck.checked || existingCustomerCheck.email !== contactInfo.email)
    
    return !hasValidationErrors && !customerExistsAndNotLoggedIn && !emailNeedsCheck
  }

  const isStep2Valid = () => {
    if (deliveryMethod === 'pakiautomaat') {
      const pakiValid = selectedPakiautomaat && selectedPakiautomaat.trim() !== ''
      if (isAddressRequired()) {
        return pakiValid && addressInfo.street && addressInfo.city && addressInfo.postalCode
      }
      return pakiValid
    } else {
      // Kuller always requires address
      return addressInfo.street && addressInfo.city && addressInfo.postalCode
    }
  }

  // Input handlers
  const handleInputChange = React.useCallback((fieldName: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [fieldName]: value }))
    
    // Reset customer check when email changes significantly (not just typing)
    if (fieldName === 'email' && value !== existingCustomerCheck.email) {
      setExistingCustomerCheck({ checked: false, exists: false, email: '' })
      // Only reset inline login if the email is significantly different
      // Don't reset if user is just editing the same email
      if (!value.includes('@') || Math.abs(value.length - (existingCustomerCheck.email?.length || 0)) > 2) {
        setInlineLogin({
          password: '',
          isLoggingIn: false,
          showPasswordField: false,
          loginError: null
        })
      }
    }
    
    // Clear error when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: undefined }))
    }
  }, [existingCustomerCheck.email, validationErrors])

  const handleInputBlur = React.useCallback(async (fieldName: keyof ContactInfo) => {
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }))
    
    const value = contactInfo[fieldName] || ''
    
    // Check customer existence for email field
    if (fieldName === 'email' && value && value.includes('@')) {
      await checkCustomerExists(value)
    }
    
    const error = validateField(fieldName, value)
    setValidationErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [contactInfo, checkCustomerExists, validateField])

  // Handle customer type change
  const handleCustomerTypeChange = (type: CustomerType) => {
    setCustomerType(type)
    // Clear business-specific errors when switching to individual
    if (type === 'individual') {
      setValidationErrors(prev => ({
        ...prev,
        company: undefined,
        company_registration: undefined
      }))
      setFieldTouched(prev => ({
        ...prev,
        company: false,
        company_registration: false
      }))
      setContactInfo(prev => ({
        ...prev,
        company: '',
        company_registration: ''
      }))
    }
  }

  // Handle step navigation
  const goToStep = (stepId: string) => {
    // Use URL as the source of truth to avoid state/URL sync loops
    if (currentStepParam !== stepId) {
      router.push(`${pathname}?step=${stepId}`)
    }
  }

  const goToNextStep = async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (currentStep === 'customer') {
        // Save customer info and type to cart
        // Only update cart if it's a real cart
        if (cart) {
          await updateCart({
            email: contactInfo.email,
            metadata: {
              ...cart?.metadata,
              customer_type: customerType,
              contact_info: JSON.stringify(contactInfo)
            }
          })
        }
        goToStep('delivery')
      } else if (currentStep === 'delivery') {
        // Save delivery info and set shipping method
        const shippingData: any = {
          first_name: contactInfo.first_name,
          last_name: contactInfo.last_name,
          company: customerType === 'business' ? contactInfo.company : undefined,
          phone: contactInfo.phone,
          country_code: 'ee', // Use lowercase for consistency
          address_2: '' // Initialize address_2 field
        }

        if (deliveryMethod === 'pakiautomaat') {
          // For pakiautomaat/postipunkt, use the selected location as address
          const selectedLocation = locations.find(loc => loc.id === selectedPakiautomaat)
          const pakiautomaarName = selectedLocation?.name || selectedPakiautomaat
          
          // Ensure we have a valid pakiautomaat name
          if (!pakiautomaarName) {
            setError('Palun valige pakiautomaat')
            return
          }
          
          shippingData.address_1 = pakiautomaarName
          shippingData.city = selectedLocation?.city || 'Tallinn' // Use location city or default
          shippingData.postal_code = selectedLocation?.zip || '10000' // Use location zip or default
          
          // Add pakiautomaat/postipunkt-specific metadata
          shippingData.metadata = {
            delivery_type: 'pakiautomaat',
            pakiautomaat_location: selectedPakiautomaat,
            pakiautomaat_name: pakiautomaarName,
            pakiautomaat_type: selectedLocation?.type || 'pakiautomaat',
            is_pakiautomaat: 'true',
            ...(isAddressRequired() && {
              full_address: JSON.stringify(addressInfo)
            })
          }
        } else {
          // For kuller, use the provided address
          shippingData.address_1 = `${addressInfo.street} ${addressInfo.houseNumber}${addressInfo.apartment ? '/' + addressInfo.apartment : ''}`
          shippingData.address_2 = addressInfo.apartment || '' // Set apartment as address_2
          shippingData.city = addressInfo.city
          shippingData.postal_code = addressInfo.postalCode
          shippingData.province = addressInfo.county // Use user-selected county
          shippingData.metadata = {
            delivery_type: 'kuller',
            courier_instructions: addressInfo.note || ''
          }
        }

        // Validate email before persisting addresses (backend requires it)
        const emailToUse = (contactInfo.email || cart?.email || '').trim()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(emailToUse)) {
          setError('Palun sisestage kehtiv e‑post enne tarneviisi salvestamist')
          setIsLoading(false)
          return
        }

        // Set addresses - need to create a proper FormData object
        const formData = new FormData()
        
        // Add email (validated)
        formData.append('email', emailToUse)
        
        // Debug logging for address data
        console.log('Setting addresses with shippingData:', {
          address_1: shippingData.address_1,
          city: shippingData.city,
          postal_code: shippingData.postal_code,
          delivery_method: deliveryMethod,
          selected_pakiautomaat: selectedPakiautomaat
        })
        
        // Add shipping address fields
        Object.entries(shippingData).forEach(([key, value]) => {
          if (value !== undefined && key !== 'metadata') {
            formData.append(`shipping_address.${key}`, String(value))
          }
        })
        
        // Add metadata fields for shipping address
        if (shippingData.metadata) {
          Object.entries(shippingData.metadata).forEach(([key, value]) => {
            if (value !== undefined) {
              formData.append(`shipping_address.metadata.${key}`, String(value))
            }
          })
        }
        
        // Add delivery type for address processing
        formData.append('delivery_type', deliveryMethod)
        
        // Add billing address fields (same as shipping)
        Object.entries(shippingData).forEach(([key, value]) => {
          if (value !== undefined && key !== 'metadata') {
            formData.append(`billing_address.${key}`, String(value))
          }
        })

        // Add metadata fields for billing address
        if (shippingData.metadata) {
          Object.entries(shippingData.metadata).forEach(([key, value]) => {
            if (value !== undefined) {
              formData.append(`billing_address.metadata.${key}`, String(value))
            }
          })
        }
        
        // Only set addresses if it's a real cart
        if (cart) {
          const addrErr = await setAddresses(null, formData)
          if (typeof addrErr === 'string' && addrErr) {
            setError('Viga tarneaadressi salvestamisel: ' + addrErr)
            setIsLoading(false)
            return
          }
        }

        // Set shipping method based on delivery type
        if (cart && deliveryMethod) {
          try {
            // Map UI delivery method to actual shipping option IDs from backend
            let shippingOptionId: string | null = null
            // Dynamically query options for this cart to avoid hardcoded IDs
            try {
              const resp = await fetch(`/api/store/shipping-options?cart_id=${encodeURIComponent(cart.id)}&fields=+service_zone.fulfllment_set.type,*service_zone.fulfillment_set.location.address`, {
                method: 'GET'
              })
              if (resp.ok) {
                const data = await resp.json()
                const options = (data?.shipping_options || []) as Array<{ id: string; name?: string; provider_id?: string }>
                const match = options.find(opt => {
                  const name = (opt.name || '').toLowerCase()
                  return deliveryMethod === 'pakiautomaat' ? name.includes('pakiautomaat') || name.includes('postipunkt') : name.includes('kuller') || name.includes('courier')
                })
                if (match) {
                  shippingOptionId = match.id
                }
              }
            } catch {}
            
            if (shippingOptionId) {
              await setShippingMethod({
                cartId: cart.id,
                shippingMethodId: shippingOptionId
              })
              
              // After setting shipping method, initialize payment session for the new total
              try {
                await initiatePaymentSession(cart, {
                  provider_id: "pp_stripe_stripe",
                })
                console.log('Payment session re-initialized after shipping method change')
              } catch (paymentError: any) {
                console.warn('Failed to re-initialize payment session:', paymentError)
              }
            }
          } catch (shippingError: any) {
            console.error('Failed to set shipping method:', shippingError)
            setError('Viga tarneviisi salvestamisel: ' + shippingError.message)
            return // Don't proceed to payment if shipping failed
          }
        }
        
        goToStep('review')
      } else if (currentStep === 'review') {
        goToStep('review')
      }
    } catch (err: any) {
      setError(err.message || 'Viga andmete salvestamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const goToPreviousStep = () => {
    const stepOrder = ['customer', 'delivery', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      goToStep(stepOrder[currentIndex - 1])
    }
  }

  // Get continue button text
  const getContinueButtonText = () => {
    switch (currentStep) {
      case 'customer':
        return 'Jätka tarnimisega'
      case 'delivery':
        return 'Jätka maksega'
      case 'review':
        return 'Kinnitamine'
      default:
        return 'Jätka'
    }
  }

  // Check if continue button should be disabled
  const isContinueDisabled = () => {
    switch (currentStep) {
      case 'customer':
        return !isStep1Valid()
      case 'delivery':
        return !isStep2Valid()
      default:
        return false
    }
  }

  const currentStepIndex = Math.max(0, steps.findIndex(step => step.id === currentStep))

  // Check if cart has subscription items
  const hasSubscriptionItems = () => {
    return cart?.items?.some((item: any) => item.metadata?.purchase_type === 'subscription') || false
  }

  // Calculate dropdown position for fixed positioning
  const updateDropdownPosition = () => {
    if (locationInputRef.current) {
      const rect = locationInputRef.current.getBoundingClientRect()
      
      // For fixed positioning, use viewport coordinates directly
      setDropdownPosition({
        top: rect.bottom + 4, // 4px gap below the input
        left: rect.left,
        width: rect.width
      })
    }
  }

  // Helper functions for location search
  const handleLocationSelect = (location: Location) => {
    setSelectedPakiautomaat(location.id)
    setLocationSearch(getLocationDisplayName(location))
    setShowLocationDropdown(false)
    // Persist selection for refresh-resilience
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('checkout:selectedPakiautomaat', location.id)
      }
    } catch {}
  }

  const handleLocationSearchChange = (value: string) => {
    setLocationSearch(value)
    setShowLocationDropdown(true)
    // Update position when opening dropdown
    updateDropdownPosition()
    
    // Clear selection if search doesn't match exactly
    if (selectedPakiautomaat) {
      const selectedLocation = locations.find(loc => loc.id === selectedPakiautomaat)
      if (!selectedLocation || getLocationDisplayName(selectedLocation) !== value) {
        setSelectedPakiautomaat('')
      }
    }
  }

  const handleLocationInputFocus = () => {
    setShowLocationDropdown(true)
    updateDropdownPosition()
  }

  const handleLocationInputBlur = () => {
    // Don't hide dropdown on blur - let click outside handle it
  }

  // Persist contact info minimal fields for refresh
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('checkout:email', contactInfo.email || '')
        window.localStorage.setItem('checkout:first_name', contactInfo.first_name || '')
        window.localStorage.setItem('checkout:last_name', contactInfo.last_name || '')
        window.localStorage.setItem('checkout:phone', contactInfo.phone || '')
      }
    } catch {}
  }, [contactInfo.email, contactInfo.first_name, contactInfo.last_name, contactInfo.phone])

  // Restore contact info on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setContactInfo(prev => ({
          ...prev,
          email: prev.email || window.localStorage.getItem('checkout:email') || '',
          first_name: prev.first_name || window.localStorage.getItem('checkout:first_name') || '',
          last_name: prev.last_name || window.localStorage.getItem('checkout:last_name') || '',
          phone: prev.phone || window.localStorage.getItem('checkout:phone') || ''
        }))
      }
    } catch {}
  }, [])

  // Step gating: prevent entering steps that are not yet satisfied
  useEffect(() => {
    if (!isMounted) return
    const hasCartEmail = !!cart?.email
    const typedEmail = (contactInfo.email || '').trim()
    const emailOk = !validateEmail(typedEmail)
    const hasShippingMethod = !!(cart?.shipping_methods && cart.shipping_methods.length > 0)

    if (currentStep === 'delivery') {
      if (!hasCartEmail && !emailOk) {
        goToStep('customer')
        return
      }
    }

    if (currentStep === 'review') {
      if (!hasCartEmail && !emailOk) {
        goToStep('customer')
        return
      }
      if (!hasShippingMethod) {
        goToStep('delivery')
        return
      }
    }
  }, [isMounted, currentStep, cart?.email, cart?.shipping_methods?.length, contactInfo.email])

  // Prevent hydration mismatch by ensuring component only renders after mount
  if (!isMounted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-8 py-6 border-b border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Ostlemine</h1>
            <div className="text-sm text-gray-600">Loading...</div>
          </div>
        </div>
        <div className="p-8">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-gray-500">Loading checkout...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-8 py-6 border-b border-yellow-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Ostlemine</h1>
          <div className="text-sm text-gray-600">
            Samm {currentStepIndex + 1} / {steps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
          <div 
            className="absolute top-6 left-6 h-0.5 bg-yellow-500 transition-all duration-500"
            style={{ 
              width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 0px)` 
            }}
          ></div>
          
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStepIndex === index
              const isPast = currentStepIndex > index
              const isNext = currentStepIndex < index
              
              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center"
                >
                  <div
                    className={clx(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 border-2 relative z-10",
                      {
                        "bg-yellow-500 text-white border-yellow-500": isActive || isPast,
                        "bg-white text-gray-400 border-gray-300": isNext,
                      }
                    )}
                  >
                    {isPast ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  
                  <span
                    className={clx("text-sm font-medium text-center max-w-24", {
                      "text-yellow-800": isActive,
                      "text-yellow-700": isPast,
                      "text-gray-500": isNext,
                    })}
                  >
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="min-h-[400px]">
          {currentStep === 'customer' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Kas olete eraisik või ettevõte?
                </h2>
                <p className="text-sm text-gray-600">
                  Valige sobiv kliendi tüüp ja täitke kontaktandmed.
                </p>
              </div>

              {/* Customer Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  className={clx(
                    "p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative w-full",
                    {
                      "border-yellow-500 bg-yellow-50": customerType === 'individual',
                      "border-gray-200 bg-white hover:bg-gray-50": customerType !== 'individual'
                    }
                  )}
                  onClick={() => handleCustomerTypeChange('individual')}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <User className="h-12 w-12 text-gray-600" />
                    <h3 className="text-lg font-semibold">Eraisik</h3>
                    <p className="text-sm text-gray-600">Pakiautomaat/postipunkt ilma aadressita alla 160€</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={clx(
                    "p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative w-full",
                    {
                      "border-yellow-500 bg-yellow-50": customerType === 'business',
                      "border-gray-200 bg-white hover:bg-gray-50": customerType !== 'business'
                    }
                  )}
                  onClick={() => handleCustomerTypeChange('business')}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Building2 className="h-12 w-12 text-gray-600" />
                    <h3 className="text-lg font-semibold">Ettevõte</h3>
                    <p className="text-sm text-gray-600">Äriarvete väljastamine</p>
                  </div>
                </button>
              </div>

              {/* Contact Info Form */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Kontaktandmed</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ValidatedInput
                    ref={firstNameRef}
                    fieldName="first_name"
                    label="Eesnimi *"
                    placeholder="Teie eesnimi"
                    required
                    contactInfo={contactInfo}
                    fieldTouched={fieldTouched}
                    validationErrors={validationErrors}
                    handleInputChange={handleInputChange}
                    handleInputBlur={handleInputBlur}
                    onEnterKey={() => {
                      lastNameRef.current?.focus()
                    }}
                  />
                  <ValidatedInput
                    ref={lastNameRef}
                    fieldName="last_name"
                    label="Perekonnanimi *"
                    placeholder="Teie perekonnanimi"
                    required
                    contactInfo={contactInfo}
                    fieldTouched={fieldTouched}
                    validationErrors={validationErrors}
                    handleInputChange={handleInputChange}
                    handleInputBlur={handleInputBlur}
                    onEnterKey={() => {
                      emailRef.current?.focus()
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ValidatedInput
                      ref={emailRef}
                      fieldName="email"
                      label="E-post *"
                      placeholder="teie@email.ee"
                      type="email"
                      required
                      contactInfo={contactInfo}
                      fieldTouched={fieldTouched}
                      validationErrors={validationErrors}
                      handleInputChange={handleInputChange}
                      handleInputBlur={handleInputBlur}
                      onEnterKey={() => {
                        phoneRef.current?.focus()
                      }}
                    />
                    
                    {/* Show login form if customer exists - only after client hydration */}
                    {isClient && existingCustomerCheck.checked && existingCustomerCheck.email === contactInfo.email && existingCustomerCheck.exists && !customer && (
                      <div className="mt-2 p-4 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <p className="text-sm text-blue-800 font-medium">
                              Selle e-posti aadressiga konto on juba olemas
                            </p>
                          </div>
                          
                          {!inlineLogin.showPasswordField ? (
                            <div>
                              <button
                                type="button"
                                onClick={() => setInlineLogin(prev => ({ ...prev, showPasswordField: true }))}
                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Logi sisse
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <label htmlFor="inline-login-password" className="block text-sm font-medium text-blue-800 mb-1">
                                  Parool
                                </label>
                                <input
                                  id="inline-login-password"
                                  type="password"
                                  value={inlineLogin.password}
                                  onChange={(e) => setInlineLogin(prev => ({ ...prev, password: e.target.value, loginError: null }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      handleInlineLogin()
                                    }
                                  }}
                                  placeholder="Sisestage oma parool"
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  disabled={inlineLogin.isLoggingIn}
                                />
                              </div>
                              
                              {inlineLogin.loginError && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                  <span className="text-red-500">⚠</span>
                                  {inlineLogin.loginError}
                                </p>
                              )}
                              
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleInlineLogin}
                                  disabled={inlineLogin.isLoggingIn || !inlineLogin.password.trim()}
                                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                  {inlineLogin.isLoggingIn ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                      Logib sisse...
                                    </>
                                  ) : (
                                    'Logi sisse'
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInlineLogin(prev => ({ ...prev, showPasswordField: false, password: '', loginError: null }))}
                                  className="text-sm text-blue-700 underline hover:text-blue-900"
                                  disabled={inlineLogin.isLoggingIn}
                                >
                                  Katkesta
                                </button>
                              </div>
                              
                              <p className="text-xs text-blue-700">
                                Unustasid parooli?{" "}
                                <a 
                                  href="/ee/account/login?forgot=true" 
                                  className="underline hover:text-blue-900"
                                >
                                  Taasta parool
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <PhoneInput
                    value={contactInfo.phone || ''}
                    onChange={(value) => handleInputChange('phone', value)}
                    onBlur={() => handleInputBlur('phone')}
                    hasError={fieldTouched.phone && !!validationErrors.phone}
                    errorMessage={validationErrors.phone}
                    required
                    onEnterKey={() => {
                      // Continue to next step or button if this is the last field
                      const nextButton = document.querySelector('[data-testid="continue-button"]') as HTMLButtonElement
                      nextButton?.focus()
                    }}
                  />
                </div>

                {customerType === 'business' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ValidatedInput
                      fieldName="company"
                      label="Ettevõtte nimi *"
                      placeholder="Ettevõtte OÜ"
                      required
                      contactInfo={contactInfo}
                      fieldTouched={fieldTouched}
                      validationErrors={validationErrors}
                      handleInputChange={handleInputChange}
                      handleInputBlur={handleInputBlur}
                    />
                    <ValidatedInput
                      fieldName="company_registration"
                      label="Registrikood *"
                      placeholder="12345678"
                      required
                      contactInfo={contactInfo}
                      fieldTouched={fieldTouched}
                      validationErrors={validationErrors}
                      handleInputChange={handleInputChange}
                      handleInputBlur={handleInputBlur}
                    />
                  </div>
                )}

                {/* Subscription Notice */}
                {hasSubscriptionItems() && (
                  <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Püsitellimus teie korvis</p>
                        {customer ? (
                          <p>Lisame tellimuse sinu kontole, saad seda alati muuta, tühistada või vahele jätta.</p>
                        ) : existingCustomerCheck.exists ? (
                          <p>Logi sisse ülal, et lisada tellimus oma olemasolevale kontole. Saad seda alati muuta, tühistada või vahele jätta.</p>
                        ) : (
                          <p>Teie tellimus seotakse e-posti aadressiga {contactInfo.email}. Saate igal ajal luua konto kraps.ee-s, et hallata oma tellimusi veebis.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'delivery' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Kuidas soovite tellimust kätte saada?
                </h2>
                <p className="text-sm text-gray-600">
                  Valige sobiv tarneviis. Tellimuse summa: {orderTotalInEuros.toFixed(2)}€
                </p>
              </div>

              {/* Delivery Method Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  className={clx(
                    "p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative w-full",
                    {
                      "border-yellow-500 bg-yellow-50": deliveryMethod === 'pakiautomaat',
                      "border-gray-200 bg-white hover:bg-gray-50": deliveryMethod !== 'pakiautomaat'
                    }
                  )}
                  onClick={() => setDeliveryMethod('pakiautomaat')}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Package className="h-12 w-12 text-blue-600" />
                    <h3 className="text-lg font-semibold">Pakiautomaat või postipunkt</h3>
                    <p className="text-sm text-gray-600">Mugav ja taskukohane (2.90€)</p>
                    {!isAddressRequired() && (
                      <p className="text-xs text-green-600 font-medium">Aadressi pole vaja</p>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className={clx(
                    "p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative w-full",
                    {
                      "border-yellow-500 bg-yellow-50": deliveryMethod === 'kuller',
                      "border-gray-200 bg-white hover:bg-gray-50": deliveryMethod !== 'kuller'
                    }
                  )}
                  onClick={() => setDeliveryMethod('kuller')}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Truck className="h-12 w-12 text-green-600" />
                    <h3 className="text-lg font-semibold">Kuller</h3>
                    <p className="text-sm text-gray-600">Otse ukseni (4.90€)</p>
                    <p className="text-xs text-orange-600 font-medium">Aadress kohustuslik</p>
                  </div>
                </button>
              </div>

              {/* Pakiautomaat/Postipunkt Selection */}
              {deliveryMethod === 'pakiautomaat' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Valige pakiautomaat või postipunkt</h3>
                  {locationsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Laadin asukohti...</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div ref={locationInputRef} className="relative">
                        <input
                          type="text"
                          value={locationSearch}
                          onChange={(e) => handleLocationSearchChange(e.target.value)}
                          onFocus={handleLocationInputFocus}
                          onBlur={handleLocationInputBlur}
                          placeholder="Otsige pakiautomaati või postipunkti..."
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Selection indicator */}
                      {selectedPakiautomaat && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-800 font-medium">
                              Valitud: {(() => {
                                const selected = locations.find(loc => loc.id === selectedPakiautomaat)
                                return selected ? getLocationDisplayName(selected) : ''
                              })()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Address Form - Conditional */}
              {isAddressRequired() && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      {customerType === 'business' && "Äriklientidele on aadress alati kohustuslik."}
                      {orderTotalInEuros > 160 && "Tellimuste puhul üle 160€ on aadress kohustuslik."}
                      {deliveryMethod === 'kuller' && "Kulleriga tarnimiseks on aadress kohustuslik."}
                    </p>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">Tarneaadress</h3>
                  
                  <EstonianAddressInput
                    value={addressInfo}
                    onChange={setAddressInfo}
                    showNote={deliveryMethod === 'kuller'}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-8">
              {/* Wrap Review component in PaymentWrapper for Stripe Elements context */}
              <PaymentWrapper cart={workingCart}>
                <Review 
                  cart={{
                    ...workingCart,
                    email: contactInfo.email,
                    shipping_address: {
                      ...workingCart?.shipping_address,
                      first_name: contactInfo.first_name,
                      last_name: contactInfo.last_name,
                      phone: contactInfo.phone,
                      company: customerType === 'business' ? contactInfo.company : undefined,
                      // Use the selected pakiautomaat name for address_1
                      address_1: deliveryMethod === 'pakiautomaat' 
                        ? (locations.find(loc => loc.id === selectedPakiautomaat)?.name || selectedPakiautomaat || 'Valimata')
                        : (isAddressRequired() 
                          ? `${addressInfo.street} ${addressInfo.houseNumber}${addressInfo.apartment ? '/' + addressInfo.apartment : ''}`
                          : ''),
                      city: deliveryMethod === 'pakiautomaat'
                        ? (locations.find(loc => loc.id === selectedPakiautomaat)?.city || 'Tallinn')
                        : addressInfo.city,
                      postal_code: deliveryMethod === 'pakiautomaat'
                        ? (locations.find(loc => loc.id === selectedPakiautomaat)?.zip || '10000')
                        : addressInfo.postalCode,
                      country_code: 'EE'
                    },
                    // Add billing_address (required for PaymentButton)
                    billing_address: {
                      ...workingCart?.billing_address,
                      first_name: contactInfo.first_name,
                      last_name: contactInfo.last_name,
                      phone: contactInfo.phone,
                      company: customerType === 'business' ? contactInfo.company : undefined,
                      // Use the selected pakiautomaat name for address_1
                      address_1: deliveryMethod === 'pakiautomaat' 
                        ? (locations.find(loc => loc.id === selectedPakiautomaat)?.name || selectedPakiautomaat || 'Valimata')
                        : (isAddressRequired() 
                          ? `${addressInfo.street} ${addressInfo.houseNumber}${addressInfo.apartment ? '/' + addressInfo.apartment : ''}`
                          : ''),
                      city: deliveryMethod === 'pakiautomaat'
                        ? (locations.find(loc => loc.id === selectedPakiautomaat)?.city || 'Tallinn')
                        : addressInfo.city,
                      postal_code: deliveryMethod === 'pakiautomaat'
                        ? (locations.find(loc => loc.id === selectedPakiautomaat)?.zip || '10000')
                        : addressInfo.postalCode,
                      country_code: 'EE'
                    },
                    // Preserve the original shipping_methods and payment_collection
                    shipping_methods: workingCart?.shipping_methods || [],
                    payment_collection: workingCart?.payment_collection
                  }} 
                  customer={customer} 
                />
              </PaymentWrapper>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentStep !== 'review' && (
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
            {currentStepIndex > 0 ? (
              <button
                onClick={goToPreviousStep}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                type="button"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
                Tagasi
              </button>
            ) : (
              <div></div>
            )}

            <KrapsButton
              variant="primary"
              size="large"
              onClick={goToNextStep}
              disabled={isContinueDisabled() || isLoading}
              className={clx(
                "px-8 py-3 min-w-[200px] font-semibold transition-all duration-200",
                {
                  "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300": isContinueDisabled() || isLoading,
                  "bg-yellow-500 text-white hover:bg-yellow-600": !isContinueDisabled() && !isLoading
                }
              )}
              data-testid="continue-button"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  Salvestab...
                </div>
              ) : (
                getContinueButtonText()
              )}
            </KrapsButton>
            
            {/* Validation feedback */}
            {isContinueDisabled() && !isLoading && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                {currentStep === 'customer' && "Palun täitke kõik kohustuslikud väljad"}
                {currentStep === 'delivery' && "Palun valige tarneviis ja täitke nõutud andmed"}
              </p>
            )}
          </div>
        )}

        {/* Back Button for Review Step */}
        {currentStep === 'review' && (
          <div className="flex items-center justify-start pt-8 border-t border-gray-200 mt-8">
            <button
              onClick={goToPreviousStep}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Tagasi
            </button>
          </div>
        )}
      </div>

      {/* Portal Dropdown for Pakiautomaat Selection */}
      {showLocationDropdown && typeof window !== 'undefined' && createPortal(
        <div 
          ref={locationDropdownRef}
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
          {/* Dropdown content */}
          {filteredLocations.length > 0 ? (
            <div className="max-h-64 overflow-auto">
              {filteredLocations.slice(0, 50).map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {getLocationDisplayName(location)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {location.address}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {location.county}
                      </div>
                    </div>
                    <div className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {location.type === 'pakiautomaat' ? 'Pakiautomaat' : 'Postipunkt'}
                    </div>
                  </div>
                </button>
              ))}
              {filteredLocations.length > 50 && (
                <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                  Näitan esimest 50 tulemust. Täpsustage otsingut rohkemate nägemiseks.
                </div>
              )}
            </div>
          ) : locationSearch.trim() ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Otsingule &quot;{locationSearch}&quot; ei leitud tulemusi.
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              Sisestage otsingutermin...
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
