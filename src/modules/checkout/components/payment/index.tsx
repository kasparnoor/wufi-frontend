"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CreditCard, Shield, Lock } from "lucide-react"
import { Button, clx } from "@medusajs/ui"
import { ErrorMessage } from "@lib/components"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

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
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"
  const isStripe = isStripeFunc(selectedPaymentMethod)

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

  const handleChange = useCallback(
    (providerId: string) => {
      setError(null)
      setSelectedPaymentMethod(providerId)
      if (providerId !== activeSession?.provider_id) {
        initiatePayment(providerId)
      }
    },
    [activeSession?.provider_id, initiatePayment]
  )

  const handleEdit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Lock className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-green-800">Turvaline maksmine</h3>
          <p className="text-sm text-green-600">Teie andmed on SSL krüpteeringuga kaitstud</p>
        </div>
      </div>

      {isOpen ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Valige makseviis
            </h3>
            
            {availablePaymentMethods?.length ? (
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={handleChange}
                className="space-y-3"
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <PaymentContainer
                    paymentProviderId={paymentMethod.id}
                    key={paymentMethod.id}
                    paymentInfoMap={paymentInfoMap}
                    selectedPaymentOptionId={selectedPaymentMethod}
                    disabled={isLoading}
                  >
                    {isStripe && selectedPaymentMethod === paymentMethod.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Krediitkaardi andmed
                          </span>
                        </div>
                        <StripeCardContainer 
                          paymentProviderId={paymentMethod.id}
                          paymentInfoMap={paymentInfoMap}
                          selectedPaymentOptionId={selectedPaymentMethod}
                          setCardBrand={setCardBrand}
                          setError={setError}
                          setCardComplete={setCardComplete}
                        />
                        
                        {/* Accepted Cards */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Aktsepteerime:</p>
                          <div className="flex gap-2">
                            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                              V
                            </div>
                            <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                              MC
                            </div>
                            <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
                              AE
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </PaymentContainer>
                ))}
              </RadioGroup>
            ) : (
              <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Makseviisid laadimas...</p>
              </div>
            )}

            <ErrorMessage
              error={error}
              data-testid="payment-method-error-message"
            />
          </div>

          {/* Additional Security Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Miks on teie andmed turvalised?</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• 256-bit SSL krüpteering</li>
                  <li>• PCI DSS sertifitseeritud</li>
                  <li>• Kaardandmeid ei salvestata</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {cart && activeSession ? (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {paymentInfoMap[activeSession.provider_id]?.title || "Makseviis valitud"}
                    </p>
                    <p className="text-xs text-gray-600">
                      Andmed on turvalised ja krüpteeritud
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
  )
}

export default Payment
