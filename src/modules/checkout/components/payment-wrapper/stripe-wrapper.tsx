"use client"

import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"
import { createContext } from "react"

type StripeWrapperProps = {
  paymentSession?: HttpTypes.StorePaymentSession
  stripeKey?: string
  stripePromise: Promise<Stripe | null> | null
  children: React.ReactNode
  cart?: HttpTypes.StoreCart
}

export const StripeContext = createContext(false)

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
  cart,
}) => {
  const clientSecret = paymentSession?.data?.client_secret as string | undefined

  // Get cart total in cents for Stripe (minimum 50 cents required)
  const cartAmount = cart?.total ? Math.max(Math.round(cart.total * 100), 50) : 1000

  // Create options based on whether we have a client secret or not
  const options: StripeElementsOptions = clientSecret 
    ? {
        clientSecret,
        locale: "et",
      }
    : {
        mode: "payment",
        currency: cart?.currency_code?.toLowerCase() || "eur",
        locale: "et",
        amount: cartAmount, // Use actual cart amount or fallback
      }

  if (!stripeKey) {
    throw new Error(
      "Stripe key is missing. Set NEXT_PUBLIC_STRIPE_KEY environment variable."
    )
  }

  if (!stripePromise) {
    throw new Error(
      "Stripe promise is missing. Make sure you have provided a valid Stripe key."
    )
  }

  // Provide Elements context even when client_secret is not available yet
  // This prevents useStripe/useElements errors during checkout flow
  return (
    <StripeContext.Provider value={true}>
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  )
}

export default StripeWrapper
