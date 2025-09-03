import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, type JSX } from "react"

import { RadioGroup as Radio, RadioGroupItem, SkeletonCardDetails } from "@lib/components"

import { isManual } from "@lib/constants"
import { PaymentElement } from "@stripe/react-stripe-js"
import { StripePaymentElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-ui-border-interactive":
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <div className="w-4 h-4 border-2 rounded-full flex items-center justify-center border-gray-300 data-[checked]:border-ui-fg-interactive data-[checked]:bg-ui-fg-interactive">
            {selectedPaymentOptionId === paymentProviderId && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  cart,
}: Omit<PaymentContainerProps, "children"> & {
  cart?: any; // Add cart to detect subscriptions
}) => {
  const stripeReady = useContext(StripeContext)

  // Check if cart contains subscription items
  const hasSubscriptions = cart?.items?.some((item: any) => 
    item.metadata?.purchase_type === "subscription" && 
    item.metadata?.autoship === "true"
  ) || false

  const paymentElementOptions: StripePaymentElementOptions = useMemo(() => {
    return {
      layout: "tabs",
      // For subscriptions, we need to save payment method for future use
      paymentMethodCreation: hasSubscriptions ? "on_session" : "automatic",
      fields: {
        billingDetails: "auto", // Let PaymentElement handle billing details
      },
      terms: {
        card: hasSubscriptions ? "auto" : "never", // Show terms for subscriptions
      },
    }
  }, [hasSubscriptions])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId && (
        <div className="my-4 transition-all duration-150 ease-in-out">
          {hasSubscriptions && (
            <div className="subscription-notice mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                🔄 Subscription Items Detected
              </h3>
              <p className="text-xs text-blue-700 mb-2">
                This order contains subscription items that will be automatically renewed.
              </p>
              <ul className="text-xs text-blue-600">
                {cart?.items
                  ?.filter((item: any) => item.metadata?.purchase_type === "subscription")
                  ?.map((item: any) => (
                    <li key={item.id}>
                      • {item.product_title} - Every {item.metadata?.interval || "month"}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          
          {stripeReady ? (
            <div>
              <Text className="txt-medium-plus text-ui-fg-base mb-2">
                {hasSubscriptions 
                  ? "Enter your payment details (saved for future subscriptions):" 
                  : "Enter your payment details:"}
              </Text>
              <PaymentElement
                options={paymentElementOptions}
              />
            </div>
          ) : (
            <SkeletonCardDetails />
          )}
        </div>
      )}
    </PaymentContainer>
  )
}

export default PaymentContainer
