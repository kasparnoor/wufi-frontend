"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { ErrorMessage, KrapsButton } from "@lib/components"
import { useActionState, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ActivationRequired from "@modules/common/components/activation-required"
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  loginAction?: (prevState: any, formData: FormData) => Promise<any>
}

const Login = ({ setCurrentView, loginAction }: Props) => {
  const [showActivationRequired, setShowActivationRequired] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Enhanced login action that checks for activation errors
  const enhancedLoginAction = async (prevState: any, formData: FormData) => {
    console.log("[LOGIN] enhancedLoginAction start", { time: new Date().toISOString() })
    const email = formData.get("email") as string
    setCustomerEmail(email)
    
    if (loginAction) {
      console.log("[LOGIN] invoking loginAction")
      const result = await loginAction(prevState, formData)
      console.log("[LOGIN] loginAction returned", { type: typeof result, result })
      
      // Check if result indicates activation is required
      if (result && typeof result === 'string' && 
          (result.includes("Account not activated") || 
           result.includes("Please check your email for activation link") ||
           result.includes("konto pole aktiveeritud") ||
           result.includes("aktiveerimislink"))) {
        setShowActivationRequired(true)
        console.log("[LOGIN] activation required")
        return null // Don't show the error message, show activation required instead
      }
      
      return result
    }
    
    return "No login action provided"
  }

  const [message, formAction] = useActionState(enhancedLoginAction, null)

  // Redirect to konto dashboard on successful login
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  useEffect(() => {
    console.log("[LOGIN] message updated", { time: new Date().toISOString(), type: typeof message, message })
    if (message && typeof message !== 'string') {
      const target = `/${countryCode}/konto`
      console.log("[LOGIN] redirecting to", target)
      // Navigate client-side; avoid NEXT_REDIRECT surfacing from server action.
      router.replace(target)
      // Ensure RSC picks auth cookie on next render
      router.refresh()
    }
  }, [message, router, countryCode])

  // Check if the error message indicates activation is required
  const isActivationError = message && typeof message === 'string' && 
    (message.includes("Account not activated") || 
     message.includes("Please check your email for activation link") ||
     message.includes("konto pole aktiveeritud") ||
     message.includes("aktiveerimislink"))

  // Show activation required component if needed
  if (showActivationRequired || isActivationError) {
    return (
      <ActivationRequired 
        customerEmail={customerEmail}
        title="Konto aktiveerimist vaja"
        description="Teie konto vajab aktiveerimist enne sisselogimist."
        onResendClick={() => {
          // Reset state to allow trying again
          setShowActivationRequired(false)
        }}
        onLogoutClick={() => {
          // Reset state to go back to login
          setShowActivationRequired(false)
          setCustomerEmail('')
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tere tulemast tagasi!
        </h2>
        <p className="text-gray-600">
          Logi sisse oma kontole
        </p>
      </div>
      
      <form className="space-y-5" action={formAction} onSubmit={() => console.log("[LOGIN] form submit", new Date().toISOString())}>
        {/* Pass country code to server action so it can redirect on success */}
        <input type="hidden" name="country_code" value={(useParams() as { countryCode: string }).countryCode} />
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
              autoComplete="email"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              placeholder="teie@email.ee"
              data-testid="email-input"
            />
          </div>
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
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              placeholder="Sisesta oma parool"
              data-testid="password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {typeof message === 'string' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <ErrorMessage error={message} data-testid="login-error-message" />
            </div>
          </div>
        )}

        {/* Forgot password link */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="/parooli-taastamine" className="font-medium text-yellow-600 hover:text-yellow-700 transition-colors">
              Unustasid parooli?
            </a>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <KrapsButton 
            type="submit" 
            variant="primary" 
            size="large" 
            className="w-full"
            data-testid="sign-in-button"
          >
            Logi sisse
          </KrapsButton>
        </div>

        {/* Switch to register */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Ei ole veel klient?{" "}
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
              className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
              data-testid="register-button"
            >
              Loo uus konto
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login
