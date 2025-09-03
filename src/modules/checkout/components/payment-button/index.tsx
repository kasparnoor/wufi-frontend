"use client"

import { isManual, isStripe } from "@lib/constants"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import { placeOrder } from "@lib/data/cart"
import { rateLimitedAction, RATE_LIMITS } from "@lib/util/client-rate-limit"
import { sanitizeErrorMessage, createErrorHandler } from "@lib/util/error-handling"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
  className?: string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
  className,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
          className={className}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton 
          notReady={notReady} 
          data-testid={dataTestId} 
          className={className}
        />
      )
    default:
      return <Button disabled className={className}>Valige makseviis</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
  className,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
  className?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  // Create secure error handler
  const handleError = createErrorHandler(setErrorMessage, 'Makse ebaõnnestus. Palun proovige uuesti.')

  const stripe = useStripe()
  const elements = useElements()

  // Check if cart contains subscription items
  const hasSubscriptions = cart.items?.some(item => 
    item.metadata?.purchase_type === "subscription" && 
    item.metadata?.autoship === "true"
  ) || false

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements || paymentConfirmed || notReady

  // Monitor payment collection status and complete order when authorized
  React.useEffect(() => {
    if (cart?.payment_collection?.status === "authorized" && paymentConfirmed && !submitting) {
      console.log('Payment collection is authorized, completing order automatically...')
      setSubmitting(true)
      onPaymentCompleted().catch((error) => {
        console.error('Auto order completion failed:', error)
        setSubmitting(false)
      })
    }
  }, [cart?.payment_collection?.status, paymentConfirmed, submitting])

  // Debug logging in development only
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PaymentButton debug:', {
        stripe: !!stripe,
        elements: !!elements,
        paymentConfirmed,
        notReady,
        disabled,
        hasPaymentCollection: !!cart?.payment_collection,
        paymentCollectionStatus: cart?.payment_collection?.status,
      })
    }
  }, [stripe, elements, paymentConfirmed, notReady, disabled, cart])

  const handlePayment = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log('=== PAYMENT BUTTON CLICKED ===', {
      cartId: cart?.id,
      timestamp: new Date().toISOString()
    })
    
    // Apply client-side rate limiting with debugging
    try {
      console.log('Checking rate limiting for payment attempts...')
      await rateLimitedAction(
        `payment-${cart?.id}`,
        async () => Promise.resolve(),
        {
          ...RATE_LIMITS.PAYMENT_ATTEMPT,
          errorMessage: 'Liiga palju maksekatse. Palun oodake enne uuesti proovimist.',
        }
      )
      console.log('Rate limiting check passed')
    } catch (error: any) {
      console.error('INSTANT ERROR: Rate limiting failed:', error.message)
      handleError(error, 'Rate limiting')
      return
    }
    
    console.log('Checking Stripe dependencies...', {
      stripe: !!stripe,
      elements: !!elements,
      cart: !!cart,
      notReady
    })
    
    if (!stripe || !elements || !cart) {
      console.error('INSTANT ERROR: Missing Stripe dependencies', {
        stripe: !!stripe,
        elements: !!elements,
        cart: !!cart
      })
      setErrorMessage('Makseviis pole veel valmis. Palun oodake hetk ja proovige uuesti.')
      return
    }

    if (notReady) {
      console.error('INSTANT ERROR: Cart not ready for payment', {
        hasShippingAddress: !!cart.shipping_address,
        hasBillingAddress: !!cart.billing_address,
        hasEmail: !!cart.email,
        hasShippingMethods: (cart.shipping_methods?.length ?? 0) > 0
      })
      setErrorMessage('Tellimus pole veel valmis. Palun kontrollige kõik väljad.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      console.log('Starting Stripe payment confirmation...')
      
      // Validate payment session exists before confirming
      console.log('Checking payment session...', {
        hasPaymentCollection: !!cart.payment_collection,
        paymentSessions: cart.payment_collection?.payment_sessions?.length || 0,
        sessionStatuses: cart.payment_collection?.payment_sessions?.map(s => s.status) || []
      })
      
      const activeSession = cart.payment_collection?.payment_sessions?.find(
        (s) => s.status === "pending"
      )
      
      if (!activeSession) {
        console.error('INSTANT ERROR: No active payment session found', {
          paymentCollection: !!cart.payment_collection,
          allSessions: cart.payment_collection?.payment_sessions?.map(s => ({
            id: s.id,
            provider: s.provider_id,
            status: s.status
          })) || []
        })
        setErrorMessage('Makse seanss ei leitud. Palun värskendage lehte ja proovige uuesti.')
        return
      }
      
      // STEP 1: Submit elements (required by Stripe before confirmPayment)
      console.log('Submitting Stripe Elements...')
      const { error: submitError } = await elements.submit()
      if (submitError) {
        console.error('Elements submit failed:', submitError)
        const errorMsg = handleStripeError(submitError)
        setErrorMessage(errorMsg)
        return
      }
      
      // Confirm payment using PaymentElement
      const clientSecret = activeSession.data?.client_secret as string
      
      console.log('Checking client secret...', {
        hasClientSecret: !!clientSecret,
        sessionData: activeSession.data ? Object.keys(activeSession.data) : 'no data'
      })
      
      if (!clientSecret) {
        console.error('INSTANT ERROR: No client secret found in payment session', {
          sessionId: activeSession.id,
          providerId: activeSession.provider_id,
          sessionData: activeSession.data
        })
        setErrorMessage('Makse seanss pole täielikult seadistatud. Palun proovige lehte värskendada.')
        return
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Using client secret for payment confirmation:', clientSecret ? 'present' : 'missing')
      }
      
      // STEP 2: Confirm payment (after elements.submit() is successful)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        }
      })

      console.log('Stripe confirmPayment result:', { error, paymentIntent })

      if (error) {
        console.error('Stripe payment error:', error)
        const pi = error.payment_intent

        // Handle specific payment intent states
        if (pi && (pi.status === "requires_capture" || pi.status === "succeeded")) {
          console.log('Payment requires capture or succeeded, completing order...')
          await onPaymentCompleted(pi.id)
        } else if (pi && pi.status === "requires_payment_method") {
          // Payment failed, requires new payment method
          setErrorMessage('Makse ebaõnnestus. Palun proovige teist makseviisi.')
        } else if (pi && pi.status === "requires_action") {
          // 3D Secure or similar action required
          setErrorMessage('Vajalik lisaautentimine. Palun järgige juhiseid ja proovige uuesti.')
        } else {
          const errorMsg = handleStripeError(error)
          console.error('Payment failed with error:', errorMsg)
          setErrorMessage(errorMsg)
        }
        return
      }

      // Handle successful payment intent
      if (paymentIntent) {
        console.log('Payment intent received:', {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        })
        
        if (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture") {
          console.log('Payment intent successful, completing order...', paymentIntent.status)
          setPaymentConfirmed(true)
          await onPaymentCompleted(paymentIntent.id)
        } else if (paymentIntent.status === "processing") {
          // Payment is being processed (e.g., bank transfers)
          setErrorMessage('Makse töödeldakse. Te saate kinnituse, kui makse on lõpetatud.')
        } else {
          console.warn('Unexpected payment intent status:', paymentIntent.status)
          setErrorMessage('Makse staatus ebaselge. Palun võtke ühendust toega, kui teid võeti tasu.')
        }
      } else {
        console.error('No payment intent returned from Stripe')
        setErrorMessage('Makse kinnitus ebaõnnestus. Palun proovige uuesti.')
      }
    } catch (err: any) {
      console.error('Payment processing failed:', err)
      setErrorMessage('Makse töötlemine ebaõnnestus. Palun proovige uuesti.')
    } finally {
      setSubmitting(false)
    }
  }

  const onPaymentCompleted = async (paymentIntentId?: string) => {
    try {
      console.log('Attempting to complete order...', { 
        cartId: cart?.id, 
        paymentIntentId,
        timestamp: new Date().toISOString()
      })
      
      // Defensive check: ensure cart is still available
      if (!cart?.id) {
        console.error('Cart is no longer available during payment completion')
        setErrorMessage('Tellimuse andmed pole kättesaadavad. Palun värskendage lehte ja proovige uuesti.')
        return
      }
      
      if (paymentIntentId) {
        // Stripe path
        const { completeStripePaymentFlow, placeOrder } = await import('@lib/data/cart')
        const authorized = await completeStripePaymentFlow(cart.id, paymentIntentId)

        console.log('Medusa payment flow completed. Authorized:', authorized)

        await placeOrder(cart.id, !authorized)
        console.log('Order placed (authorized:', authorized, ')')
      } else {
        // Non-Stripe or unknown payment provider. Validate first, then place order normally.
        const { validatePaymentSessionsBeforeOrder, placeOrder } = await import('@lib/data/cart')
        const validationPassed = await validatePaymentSessionsBeforeOrder(cart.id)

        if (!validationPassed) {
          throw new Error('Payment validation failed. Please try again or contact support.')
        }

        await placeOrder(cart.id, false)
        console.log('Order placed (non-Stripe path)')
      }
    } catch (err: any) {
      console.error('Order completion failed:', err)
      
      // Enhanced error messages for common issues including timeout
      if (err.name === 'AbortError' || err.message?.toLowerCase().includes('timeout')) {
        setErrorMessage('Ühendus aegus. Teie makse võib olla edukalt töödeldud. Palun kontrollige oma kontot või võtke ühendust toega.')
      } else if (err.message?.toLowerCase().includes('timeout') || err.message?.includes('timed out')) {
        setErrorMessage('Serveriga ühenduse loomine aegus. Palun proovige uuesti või võtke ühendust toega.')
      } else if (err.message?.includes('Payment session validation failed')) {
        // Handle specific validation timeout - payment was successful but order completion timed out
        setErrorMessage('Makse edukalt sooritatud, kuid tellimuse lõpetamine võtab tavalisest kauem aega. Palun kontrollige oma kontot või võtke ühendust toega.')
      } else if (err.message?.includes('payment session') && err.message?.includes('not authorized')) {
        setErrorMessage('Makse autoriseerimine ebaõnnestus. Teie kaarti ei võetud tasu. Palun proovige uuesti.')
      } else if (err.message?.includes('already exists')) {
        setErrorMessage('Tellimus võib olla juba töödeldud. Palun kontrollige oma kontot või võtke ühendust toega.')
      } else if (err.message?.includes('shipping_address')) {
        setErrorMessage('Tellimuse andmetes on viga. Palun värskendage lehte ja proovige uuesti.')
      } else if (err.message?.includes('Cannot read properties of undefined')) {
        setErrorMessage('Tellimuse andmed said vigaseks. Palun värskendage lehte ja proovige uuesti.')
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        setErrorMessage('Võrguühenduse viga. Palun kontrollige internetiühendust ja proovige uuesti.')
      } else {
        setErrorMessage(err.message || 'Tellimuse lõpetamine ebaõnnestus. Palun võtke ühendust toega.')
      }
      
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleStripeError = (error: any) => {
    switch (error.code) {
      case 'card_declined':
        return 'Teie kaart lükati tagasi. Palun proovige teist makseviisi.'
      case 'insufficient_funds':
        return 'Ebapiisavad vahendid. Palun proovige teist kaarti.'
      case 'expired_card':
        return 'Teie kaart on aegunud. Palun kasutage teist kaarti.'
      case 'incorrect_cvc':
        return 'Teie kaardi turvakood on vale. Palun proovige uuesti.'
      case 'processing_error':
        return 'Teie kaardi töötlemisel tekkis viga. Palun proovige uuesti.'
      default:
        return error.message || 'Makse ebaõnnestus. Palun proovige uuesti.'
    }
  }

  const getButtonText = () => {
    if (paymentConfirmed) return '✅ Makse kinnitatud'
    if (submitting) return 'Töötlemisel...'
    if (hasSubscriptions) return 'Maksa ja alusta püsitellimust'
    return 'Maksa tellimus'
  }

  return (
    <>
      <Button
        type="button"
        disabled={disabled}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
        className={`${className} ${disabled ? '' : 'cursor-pointer hover:opacity-90'}`}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.6 : 1
        }}
      >
        {getButtonText()}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ 
  notReady, 
  "data-testid": dataTestId,
  className
}: { 
  notReady: boolean
  "data-testid"?: string
  className?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err: any) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        type="button"
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId || "submit-order-button"}
        className={className}
      >
        Complete Test Payment
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
