"use client"

import { useActionState, useState, useCallback, useTransition, useEffect } from "react"
import { ErrorMessage, KrapsButton } from "@lib/components"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { checkCustomerExists as checkCustomerExistsServer } from "@lib/data/customer"
import { User, Mail, Phone, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Loader2, Shield } from "lucide-react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  signupAction?: (prevState: any, formData: FormData) => Promise<any>
}

// Password strength calculation
const calculatePasswordStrength = (password: string) => {
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  score += checks.length ? 2 : 0
  score += checks.lowercase ? 1 : 0
  score += checks.uppercase ? 1 : 0
  score += checks.number ? 1 : 0
  score += checks.special ? 1 : 0
  
  return { score, checks }
}

const getPasswordStrengthColor = (score: number) => {
  if (score < 2) return 'bg-red-500'
  if (score < 4) return 'bg-yellow-500'
  if (score < 5) return 'bg-blue-500'
  return 'bg-green-500'
}

const getPasswordStrengthText = (score: number) => {
  if (score < 2) return 'Nõrk'
  if (score < 4) return 'Keskmine'
  if (score < 5) return 'Tugev'
  return 'Väga tugev'
}

const Register = ({ setCurrentView, signupAction }: Props) => {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, checks: {} as any })
  
  // Add state for customer existence check
  const [existingCustomerCheck, setExistingCustomerCheck] = useState<{
    checking: boolean
    checked: boolean
    exists: boolean
    has_account: boolean
    email: string
  }>({ checking: false, checked: false, exists: false, has_account: false, email: '' })

  // Enhanced signup action with better error handling
  const enhancedSignupAction = useCallback(async (prevState: any, formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const firstName = formData.get("first_name") as string
    const lastName = formData.get("last_name") as string

    // Client-side validation
    const errors: {[key: string]: string} = {}
    
    if (!firstName?.trim()) {
      errors.first_name = 'Eesnimi on kohustuslik'
    }
    
    if (!lastName?.trim()) {
      errors.last_name = 'Perekonnanimi on kohustuslik'
    }
    
    if (!email || !email.includes('@')) {
      errors.email = 'Palun sisestage kehtiv e-posti aadress'
    }
    
    if (!password || password.length < 8) {
      errors.password = 'Parool peab olema vähemalt 8 tähemärki pikk'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return 'Palun parandage vormis olevad vead'
    }

    if (existingCustomerCheck.exists && existingCustomerCheck.has_account && existingCustomerCheck.email === email) {
      return 'Selle e-posti aadressiga konto on juba olemas'
    }

    setValidationErrors({})

    if (signupAction) {
      try {
        const result = await signupAction(prevState, formData)
        
        // If result is an object (successful customer creation), return null (no error)
        // If result is a string, it's an error message
        if (result && typeof result === 'object') {
          // Success - customer object returned, no error to display
          return null
        }
        
        // If it's a string, it's an error message
        return result
      } catch (error: any) {
        // Enhanced error messages
        if (error.message?.includes('email_already_exists') || error.message?.includes('duplicate')) {
          return 'Selle e-posti aadressiga konto on juba olemas. Palun kasutage teist e-posti aadressi või logige sisse.'
        }
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          return 'Ühenduse viga. Palun kontrollige internetiühendust ja proovige uuesti.'
        }
        if (error.message?.includes('validation')) {
          return 'Andmete valideerimine ebaõnnestus. Palun kontrollige sisestatud andmeid.'
        }
        
        return error.message || 'Konto loomine ebaõnnestus. Palun proovige uuesti.'
      }
    }
    
    return "Registreerimise funktsioon pole saadaval"
  }, [signupAction, existingCustomerCheck])

  const [message, formAction] = useActionState(enhancedSignupAction, null)

  // Real-time validation
  const validateField = useCallback((name: string, value: string) => {
    const errors: {[key: string]: string} = {}
    
    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          errors.first_name = 'Eesnimi on kohustuslik'
        } else if (value.trim().length < 2) {
          errors.first_name = 'Eesnimi peab olema vähemalt 2 tähemärki pikk'
        }
        break
      case 'last_name':
        if (!value.trim()) {
          errors.last_name = 'Perekonnanimi on kohustuslik'
        } else if (value.trim().length < 2) {
          errors.last_name = 'Perekonnanimi peab olema vähemalt 2 tähemärki pikk'
        }
        break
      case 'email':
        if (!value) {
          errors.email = 'E-posti aadress on kohustuslik'
        } else if (!value.includes('@') || !value.includes('.')) {
          errors.email = 'Palun sisestage kehtiv e-posti aadress'
        }
        break
      case 'phone':
        if (value && !/^[\d\s\+\-\(\)]{7,}$/.test(value)) {
          errors.phone = 'Palun sisestage kehtiv telefoninumber'
        }
        break
      case 'password':
        if (!value) {
          errors.password = 'Parool on kohustuslik'
        } else if (value.length < 8) {
          errors.password = 'Parool peab olema vähemalt 8 tähemärki pikk'
        }
        
        // Update password strength
        setPasswordStrength(calculatePasswordStrength(value))
        break
    }
    
    setValidationErrors(prev => {
      const newErrors = { ...prev, ...errors }
      if (Object.keys(errors).length === 0) {
        delete newErrors[name]
      }
      return newErrors
    })
  }, [])

  // Function to check if customer exists
  const checkCustomerExists = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return
    
    setExistingCustomerCheck(prev => ({ ...prev, checking: true }))
    
    try {
      const data = await checkCustomerExistsServer(email)
      setExistingCustomerCheck({
        checking: false,
        checked: true,
        exists: data.exists,
        has_account: data.has_account || false,
        email: email
      })
    } catch (error) {
      console.error('Failed to check customer existence:', error)
      setExistingCustomerCheck({
        checking: false,
        checked: true,
        exists: false,
        has_account: false,
        email: email
      })
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      validateField(name, value)
    }
    
    // Reset customer check when email changes
    if (name === 'email') {
      setExistingCustomerCheck({ checking: false, checked: false, exists: false, has_account: false, email: '' })
    }
  }, [touched, validateField])

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
    
    // Check customer existence for email
    if (name === 'email' && value && value.includes('@')) {
      checkCustomerExists(value)
    }
  }, [validateField, checkCustomerExists])

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    // Mark all required fields as touched on submit
    setTouched({ 
      first_name: true, 
      last_name: true, 
      email: true, 
      password: true,
      phone: formData.phone ? true : false 
    })
    
    // Validate all fields
    validateField('first_name', formData.first_name)
    validateField('last_name', formData.last_name)
    validateField('email', formData.email)
    validateField('password', formData.password)
    if (formData.phone) {
      validateField('phone', formData.phone)
    }
  }, [formData, validateField])

  const isFormValid = !validationErrors.first_name && 
                     !validationErrors.last_name && 
                     !validationErrors.email && 
                     !validationErrors.password && 
                     !validationErrors.phone &&
                     formData.first_name && 
                     formData.last_name && 
                     formData.email && 
                     formData.password &&
                     !(existingCustomerCheck.exists && existingCustomerCheck.has_account)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Liitu Kraps perega
        </h2>
        <p className="text-gray-600">
          Loo oma konto ja alusta tellimisega
        </p>
      </div>
      
      <form className="space-y-5" action={formAction} onSubmit={handleSubmit} noValidate>
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700">
              Eesnimi
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
                  validationErrors.first_name && touched.first_name 
                    ? 'border-red-300 bg-red-50' 
                    : !validationErrors.first_name && touched.first_name && formData.first_name
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                placeholder="Eesnimi"
                data-testid="first-name-input"
                aria-describedby={validationErrors.first_name ? "first-name-error" : undefined}
                aria-invalid={!!validationErrors.first_name}
              />
              {!validationErrors.first_name && touched.first_name && formData.first_name && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
            </div>
            {validationErrors.first_name && touched.first_name && (
              <p id="first-name-error" className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-left-1 duration-200" role="alert">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.first_name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700">
              Perekonnanimi
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
                  validationErrors.last_name && touched.last_name 
                    ? 'border-red-300 bg-red-50' 
                    : !validationErrors.last_name && touched.last_name && formData.last_name
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                placeholder="Perekonnanimi"
                data-testid="last-name-input"
                aria-describedby={validationErrors.last_name ? "last-name-error" : undefined}
                aria-invalid={!!validationErrors.last_name}
              />
              {!validationErrors.last_name && touched.last_name && formData.last_name && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
            </div>
            {validationErrors.last_name && touched.last_name && (
              <p id="last-name-error" className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-left-1 duration-200" role="alert">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.last_name}
              </p>
            )}
          </div>
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            E-posti aadress
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
                (validationErrors.email && touched.email) || (existingCustomerCheck.exists && existingCustomerCheck.has_account && existingCustomerCheck.email === formData.email)
                  ? 'border-red-300 bg-red-50' 
                  : !validationErrors.email && touched.email && formData.email && (!existingCustomerCheck.exists || !existingCustomerCheck.has_account)
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              }`}
              placeholder="teie@email.ee"
              data-testid="email-input"
              aria-describedby={validationErrors.email ? "email-error" : undefined}
              aria-invalid={!!validationErrors.email}
            />
            {existingCustomerCheck.checking && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
            )}
            {!existingCustomerCheck.checking && !validationErrors.email && touched.email && formData.email && (!existingCustomerCheck.exists || !existingCustomerCheck.has_account) && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
          </div>
          
          {/* Email validation feedback */}
          {validationErrors.email && touched.email && (
            <p id="email-error" className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-left-1 duration-200" role="alert">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.email}
            </p>
          )}
          
          {existingCustomerCheck.checked && existingCustomerCheck.email === formData.email && (
            <div className={`mt-2 p-4 rounded-xl border transition-all duration-300 animate-in slide-in-from-top-1 ${
              existingCustomerCheck.exists && existingCustomerCheck.has_account
                ? 'bg-red-50 border-red-200' 
                : existingCustomerCheck.exists && !existingCustomerCheck.has_account
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3">
                {existingCustomerCheck.exists && existingCustomerCheck.has_account ? (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                ) : existingCustomerCheck.exists && !existingCustomerCheck.has_account ? (
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    existingCustomerCheck.exists && existingCustomerCheck.has_account
                      ? 'text-red-800' 
                      : existingCustomerCheck.exists && !existingCustomerCheck.has_account
                      ? 'text-blue-800'
                      : 'text-green-800'
                  }`}>
                    {existingCustomerCheck.exists && existingCustomerCheck.has_account ? (
                      <>
                        Selle e-posti aadressiga konto on juba olemas.{" "}
                        <button
                          type="button"
                          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
                          className="underline font-semibold hover:no-underline transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        >
                          Logi sisse
                        </button>
                      </>
                    ) : existingCustomerCheck.exists && !existingCustomerCheck.has_account ? (
                      "Suurepärane! Teil on juba tellimusi selle e-posti aadressiga. Looge konto, et hallata oma tellimusi."
                    ) : (
                      "Suurepärane! See e-posti aadress on vaba."
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phone field */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
            Telefon <span className="text-gray-400 font-normal">(vabatahtlik)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
                validationErrors.phone && touched.phone 
                  ? 'border-red-300 bg-red-50' 
                  : !validationErrors.phone && touched.phone && formData.phone
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              }`}
              placeholder="+372 5123 4567"
              data-testid="phone-input"
              aria-describedby={validationErrors.phone ? "phone-error" : undefined}
              aria-invalid={!!validationErrors.phone}
            />
            {!validationErrors.phone && touched.phone && formData.phone && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
          </div>
          {validationErrors.phone && touched.phone && (
            <p id="phone-error" className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-left-1 duration-200" role="alert">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.phone}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Parool
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
                validationErrors.password && touched.password 
                  ? 'border-red-300 bg-red-50' 
                  : !validationErrors.password && touched.password && formData.password
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              }`}
              placeholder="Vähemalt 8 tähemärki"
              data-testid="password-input"
              aria-describedby={validationErrors.password ? "password-error" : "password-strength"}
              aria-invalid={!!validationErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
              aria-label={showPassword ? "Peida parool" : "Näita parooli"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password strength indicator */}
          {formData.password && touched.password && (
            <div id="password-strength" className="space-y-2 animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Parooli tugevus:</span>
                <span className={`text-sm font-medium ${
                  passwordStrength.score < 2 ? 'text-red-600' :
                  passwordStrength.score < 4 ? 'text-yellow-600' :
                  passwordStrength.score < 5 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {getPasswordStrengthText(passwordStrength.score)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordStrength.checks.length ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Vähemalt 8 tähemärki
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordStrength.checks.uppercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Suured tähed
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordStrength.checks.lowercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Väiksed tähed
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordStrength.checks.number ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Numbrid
                </div>
              </div>
            </div>
          )}
          
          {validationErrors.password && touched.password && (
            <p id="password-error" className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-left-1 duration-200" role="alert">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Error message */}
        {message && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 transition-all duration-300 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <ErrorMessage error={message} data-testid="register-error" />
            </div>
          </div>
        )}

        {/* Terms and conditions */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Konto loomisega nõustute meie{" "}
            <a 
              href="/policies/privaatsuspoliitika" 
              className="font-medium text-yellow-600 hover:text-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              privaatsuspoliitikaga
            </a>{" "}
            ja{" "}
            <a 
              href="/policies/kasutustingimused" 
              className="font-medium text-yellow-600 hover:text-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              kasutustingimustega
            </a>
            .
          </p>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <KrapsButton 
            type="submit" 
            variant="primary" 
            size="large" 
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            data-testid="register-button"
            disabled={isPending || !isFormValid || existingCustomerCheck.checking}
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loome kontot...
              </>
            ) : existingCustomerCheck.checking ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Kontrollin...
              </>
            ) : existingCustomerCheck.exists && existingCustomerCheck.has_account && existingCustomerCheck.email === formData.email ? (
              'E-post juba kasutusel'
            ) : (
              'Loo konto'
            )}
          </KrapsButton>
        </div>

        {/* Switch to login */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Olete juba klient?{" "}
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
              className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
            >
              Logi sisse
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register
