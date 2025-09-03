"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle, Mail, LogIn, UserPlus, ArrowRight } from "lucide-react"
import { KrapsButton } from "@lib/components"
import { checkCustomerExists } from "@lib/data/customer"
import { toast } from "@medusajs/ui"
import { useDebounce } from "@lib/hooks/use-debounce"

interface CustomerActivationPromptProps {
  email: string
  onLoginSuccess?: () => void
  onGuestContinue?: () => void
  disabled?: boolean
  className?: string
}

export default function CustomerActivationPrompt({
  email,
  onLoginSuccess,
  onGuestContinue,
  disabled = false,
  className = ""
}: CustomerActivationPromptProps) {
  const [customerCheck, setCustomerCheck] = useState<{
    checking: boolean
    exists: boolean
    checked: boolean
  }>({
    checking: false,
    exists: false,
    checked: false
  })
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  
  // Debounce email to avoid too many API calls
  const debouncedEmail = useDebounce(email, 1000)

  // Check customer existence when email changes
  useEffect(() => {
    const checkCustomer = async () => {
      if (!debouncedEmail || !debouncedEmail.includes('@')) {
        setCustomerCheck({
          checking: false,
          exists: false,
          checked: false
        })
        setShowLoginPrompt(false)
        return
      }

      setCustomerCheck(prev => ({ ...prev, checking: true }))

      try {
        const result = await checkCustomerExists(debouncedEmail)
        
        setCustomerCheck({
          checking: false,
          exists: result.exists,
          checked: true
        })

        // Show login prompt if customer exists and has account
        if (result.exists && result.has_account) {
          setShowLoginPrompt(true)
        } else {
          setShowLoginPrompt(false)
          onGuestContinue?.()
        }
      } catch (error) {
        console.error('Error checking customer existence:', error)
        setCustomerCheck({
          checking: false,
          exists: false,
          checked: true
        })
        setShowLoginPrompt(false)
        // Continue as guest on error
        onGuestContinue?.()
      }
    }

    checkCustomer()
  }, [debouncedEmail, onGuestContinue])

  const handleGoToLogin = () => {
    router.push(`/${countryCode}/account?email=${encodeURIComponent(email)}`)
  }

  const handleContinueAsGuest = () => {
    setShowLoginPrompt(false)
    onGuestContinue?.()
  }

  // Show login prompt for existing customers with accounts
  if (showLoginPrompt) {
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-green-900 mb-1">
              Tere tulemast tagasi!
            </h4>
            <p className="text-sm text-green-800 mb-3">
              Teie e-posti aadressiga <strong>{email}</strong> on juba konto olemas. 
              Logige sisse, et kasutada salvestatud andmeid ja ajalugu.
            </p>
            <div className="flex flex-wrap gap-2">
              <KrapsButton
                onClick={handleGoToLogin}
                variant="primary"
                size="small"
                disabled={disabled}
              >
                <LogIn className="h-4 w-4 mr-1" />
                Logi sisse
              </KrapsButton>
              <KrapsButton
                onClick={handleContinueAsGuest}
                variant="secondary"
                size="small"
                disabled={disabled}
              >
                Jätka külalisena
              </KrapsButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show confirmation for new customers
  if (customerCheck.checked && !customerCheck.exists) {
    return (
      <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <UserPlus className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">
              Uus klient
            </h4>
            <p className="text-sm text-blue-800">
              Teie tellimus seotakse e-posti aadressiga <strong>{email}</strong>. 
              Saate igal ajal luua konto kraps.ee-s, et hallata oma tellimusi veebis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
} 