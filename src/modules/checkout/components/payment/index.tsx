"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CreditCard, Shield, Lock } from "lucide-react"
import { Button, clx } from "@medusajs/ui"
import { ErrorMessage, ClientOnly } from "@lib/components"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { StripePaymentElementChangeEvent } from "@stripe/stripe-js"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import PaymentButton from "@modules/checkout/components/payment-button"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripeComplete, setStripeComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>()

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"
  
  // Always call hooks in the same order, but handle missing context gracefully
  const stripe = useStripe()
  const elements = useElements()

  // Check if we have Stripe context ready (both will be null if not in Elements provider)
  const stripeReady = !!stripe && !!elements

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Payment Component Debug:', {
        isOpen,
        stripeReady,
        stripe: !!stripe,
        elements: !!elements,
        activeSession: !!activeSession,
        activeSessionData: activeSession,
        availablePaymentMethods: availablePaymentMethods?.length,
        paymentCollection: !!cart?.payment_collection,
        selectedPaymentMethod
      })
    }
  }, [isOpen, stripeReady, stripe, elements, activeSession, availablePaymentMethods, selectedPaymentMethod])

  /**
   * Starts the payment session for the given provider.
   */
  const initiatePayment = useCallback(
    async (providerId: string) => {
      setIsLoading(true)
      try {
        const response = await initiatePaymentSession(cart, {
          provider_id: providerId,
        })

        if (!response) {
          setError("An error occurred, please try again.")
          return
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    },
    [cart]
  )

  // Initialize Stripe session when payment step is opened
  const initStripe = async () => {
    try {
      console.log('Initializing Stripe session...')
      await initiatePaymentSession(cart, {
        provider_id: "pp_stripe_stripe",
      })
      console.log('Stripe session initialized successfully')
    } catch (err) {
      console.error("Failed to initialize Stripe session:", err)
      setError("Failed to initialize payment. Please try again.")
    }
  }

  // Recovery function for failed payment sessions
  const recoverPaymentSession = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Recovering payment session...')
      
      // Force re-initialize the payment session
      await initiatePaymentSession(cart, {
        provider_id: "pp_stripe_stripe",
      })
      
      console.log('Payment session recovered successfully')
    } catch (err: any) {
      console.error("Failed to recover payment session:", err)
      setError("Unable to recover payment session. Please refresh the page and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-initialize if missing, or if session exists but has no client_secret
    const needsInit = !activeSession || (activeSession && !activeSession.data?.client_secret)
    if (needsInit && isOpen) {
      console.log('No active session found, initializing Stripe...')
      initStripe()
    }
  }, [cart, isOpen, activeSession])

  // Also initialize payment session when first entering payment step
  useEffect(() => {
    if (isOpen && cart && !activeSession) {
      console.log('Payment step opened without session, initializing...')
      initStripe()
    }
  }, [isOpen, cart, activeSession])

  // Handle PaymentElement changes
  const handlePaymentElementChange = async (
    event: StripePaymentElementChangeEvent
  ) => {
    console.log('PaymentElement change:', event)
    // Catches the selected payment method and sets it to state
    if (event.value.type) {
      setSelectedPaymentMethod(event.value.type)
    }
    
    // Sets stripeComplete on form completion
    setStripeComplete(event.complete)

    // Clears any errors on successful completion
    if (event.complete) {
      setError(null)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if payment session is ready
      if (!activeSession) {
        setError("Payment session not ready. Please try again.")
        return
      }

      // Navigate to the final checkout step
      router.push(pathname + "?step=review", {
        scroll: false,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  // Show debug info in development
  if (process.env.NODE_ENV === 'development' && isOpen) {
    console.log('Payment render conditions:', {
      availablePaymentMethodsLength: availablePaymentMethods?.length,
      stripeReady,
      activeSession: !!activeSession,
      shouldShowPaymentElement: !!(availablePaymentMethods?.length && stripeReady && activeSession)
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {isOpen ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Makseviis
            </h3>
            
            {/* Payment method selection message */}
            {availablePaymentMethods?.length && stripeReady && activeSession && (
              <div className="mt-5 transition-all duration-150 ease-in-out">
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Makse valmis!
                        </h4>
                        <p className="text-sm text-gray-600">
                          Stripe maksesüsteem on aktiveeritud
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white/70 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900">Turvaline kaardimakse</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>SSL krüpteeritud</span>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>Stripe&apos;i poolt kaitstud</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-blue-800">
                      <strong>Järgmine samm:</strong> Sisestage makseandmed tellimuse ülevaate lehel ja kinnitage ost
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Show loading state when Stripe is not ready */}
            {(!stripeReady || !activeSession) && (
              <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Maksevõimalused laadimas...</p>

                
                {/* Recovery button if session fails to load */}
                {!activeSession && !isLoading && (
                  <div className="mt-4">
                    <button
                      onClick={recoverPaymentSession}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                      disabled={isLoading}
                    >
                      Try to recover payment session
                    </button>
                  </div>
                )}
              </div>
            )}

            <ErrorMessage
              error={error}
              data-testid="payment-method-error-message"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {cart && activeSession && selectedPaymentMethod ? (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {paymentInfoMap[selectedPaymentMethod]?.title || "Kaardimakse"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Makse on valmis kinnitamiseks
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEdit}
                    className="text-sm text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
                  >
                    Muuda
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">Makseviis pole veel valitud</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Payment
