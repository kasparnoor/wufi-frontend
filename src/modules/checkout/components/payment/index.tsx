"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CreditCard } from "@medusajs/icons"
import { Button, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
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

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setIsLoading(true);
    setSelectedPaymentMethod(method)
    console.log(`[Payment] Setting payment method to: ${method}`);
    if (method && !paidByGiftcard) {
      try {
        console.log("[Payment] Initiating payment session for cart:", cart?.id);
        const response = await initiatePaymentSession(cart, { provider_id: method });
        console.log("[Payment] initiatePaymentSession response:", response);
      } catch (err: any) {
        console.error("[Payment] Error initiating payment session:", err);
        setError(err.message || "Viga makseviisi seadistamisel.");
      }
    }
    setIsLoading(false);
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const paymentSessionIsActiveForSelectedMethod =
        activeSession?.provider_id === selectedPaymentMethod

      if (!paymentSessionIsActiveForSelectedMethod && selectedPaymentMethod && !paidByGiftcard) {
        setIsLoading(true);
        try {
          console.log("[Payment] handleSubmit: Initiating payment session for cart:", cart?.id, "method:", selectedPaymentMethod);
          const response = await initiatePaymentSession(cart, { provider_id: selectedPaymentMethod });
          console.log("[Payment] handleSubmit initiatePaymentSession response:", response);
        } catch (err: any) {
          console.error("[Payment] handleSubmit: Error initiating payment session:", err);
          setError(err.message || "Viga makseviisi kinnitamisel.");
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className={`${isOpen ? '' : 'opacity-75'} space-y-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOpen ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <CreditCard className="h-4 w-4" />
          </div>
          <h3 className="font-medium text-gray-900">Makseinfo</h3>
        </div>
        
        {!isOpen && paymentReady && (
          <button
            onClick={handleEdit}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            data-testid="edit-payment-button"
          >
            Muuda
          </button>
        )}
      </div>
      
      {isOpen ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-6">
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <span className="text-sm text-gray-700">Valige oma eelistatud makseviis</span>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                <div className="space-y-4">
                  {availablePaymentMethods.map((paymentMethod) => (
                    <div key={paymentMethod.id}>
                      {isStripeFunc(paymentMethod.id) ? (
                        <StripeCardContainer
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                          paymentInfoMap={paymentInfoMap}
                          setCardBrand={setCardBrand}
                          setError={setError}
                          setCardComplete={setCardComplete}
                        />
                      ) : (
                        <PaymentContainer
                          paymentInfoMap={paymentInfoMap}
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Makseviis</p>
              <p className="text-sm text-gray-900">Kinkekaart</p>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {/* Removed redundant internal submit button; using global progression CTA instead */}
        </div>
      ) : (
        <div className="space-y-2">
          {cart && paymentReady && activeSession && (
            <>
              <p className="text-xs font-medium text-gray-500">Makseviis</p>
              <p className="text-sm text-gray-900">
                {paymentInfoMap[activeSession?.provider_id]?.title ||
                  activeSession?.provider_id}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Payment
