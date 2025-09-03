"use client"

import React, { useState, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@medusajs/ui'
import { CreditCard, Check, AlertCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

interface UpdatePaymentMethodProps {
  subscriptionId: string
  currentPaymentMethod?: {
    brand?: string
    last4?: string
    exp_month?: number
    exp_year?: number
  }
  onSuccess?: (paymentMethod: any) => void
  onError?: (error: string) => void
}

const UpdatePaymentMethodContent: React.FC<Omit<UpdatePaymentMethodProps, 'subscriptionId'> & {
  clientSecret: string
  subscriptionId: string
}> = ({ clientSecret, subscriptionId, currentPaymentMethod, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage('Payment system not ready. Please try again.')
      onError?.('Payment system not ready. Please try again.')
      return
    }

    setIsUpdating(true)
    setErrorMessage(null)

    try {
      // STEP 1: Submit elements (required by Stripe before confirmSetup)
      console.log('Submitting Stripe Elements...')
      const { error: submitError } = await elements.submit()
      if (submitError) {
        console.error('Elements submit failed:', submitError)
        const errorMsg = handleStripeError(submitError)
        setErrorMessage(errorMsg)
        onError?.(errorMsg)
        return
      }
      
      // STEP 2: Confirm setup (after elements.submit() is successful)
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href,
        }
      })

      if (error) {
        const errorMsg = handleStripeError(error)
        setErrorMessage(errorMsg)
        onError?.(errorMsg)
        return
      }

      if (setupIntent?.status === 'succeeded' && setupIntent.payment_method) {
        // Update subscription payment method via API
        const response = await fetch(`/api/customers/me/subscriptions/${subscriptionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_method: {
              provider: 'stripe',
              data: {
                stripe_payment_method_id: setupIntent.payment_method,
                stripe_customer_id: (setupIntent as any).customer || undefined
              }
            }
          })
        })

        if (response.ok) {
          setIsSuccess(true)
          onSuccess?.(setupIntent.payment_method)
          setTimeout(() => setIsSuccess(false), 3000)
        } else {
          throw new Error('Failed to update subscription')
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update payment method'
      setErrorMessage(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStripeError = (error: any): string => {
    switch (error.code) {
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method.'
      case 'expired_card':
        return 'Your card has expired. Please use a different card.'
      case 'incorrect_cvc':
        return 'Your card\'s security code is incorrect. Please try again.'
      case 'processing_error':
        return 'An error occurred while processing your card. Please try again.'
      default:
        return error.message || 'Failed to update payment method'
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Payment Method */}
      {currentPaymentMethod && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Current Payment Method</h3>
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700">
              {currentPaymentMethod.brand?.toUpperCase()} ending in {currentPaymentMethod.last4}
            </span>
            {currentPaymentMethod.exp_month && currentPaymentMethod.exp_year && (
              <span className="text-sm text-gray-500">
                Expires {currentPaymentMethod.exp_month}/{currentPaymentMethod.exp_year}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Update Form */}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
                     <label htmlFor="payment-element" className="block text-sm font-medium text-gray-700 mb-2">
             New Payment Method
           </label>
           <div id="payment-element">
             <PaymentElement 
            options={{
              fields: {
                billingDetails: "auto",
              },
                         }}
           />
           </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="success-message bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Payment Method Updated</h4>
                <p className="text-sm text-green-700">Your subscription payment method has been successfully updated.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-message bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Update Failed</h4>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!stripe || !elements || isUpdating || isSuccess}
          className="w-full"
          size="large"
        >
          {isUpdating ? 'Updating...' : 'Update Payment Method'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Your payment information is secure and encrypted. This will become your new default payment method for this subscription.
        </p>
      </form>
    </div>
  )
}

const UpdatePaymentMethod: React.FC<UpdatePaymentMethodProps> = ({ 
  subscriptionId, 
  currentPaymentMethod,
  onSuccess, 
  onError 
}) => {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Create setup intent for payment method updates
    const createSetupIntent = async () => {
      try {
        const response = await fetch('/api/payment/stripe/create-setup-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription_id: subscriptionId })
        })
        
        if (!response.ok) {
          throw new Error('Failed to create setup intent')
        }
        
        const data = await response.json()
        setClientSecret(data.client_secret)
      } catch (error: any) {
        onError?.(error.message || 'Failed to initialize payment update')
      } finally {
        setIsLoading(false)
      }
    }

    createSetupIntent()
  }, [subscriptionId, onError])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading payment form...</span>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600">Unable to load payment form. Please try again later.</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <UpdatePaymentMethodContent
        clientSecret={clientSecret}
        subscriptionId={subscriptionId}
        currentPaymentMethod={currentPaymentMethod}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}

export default UpdatePaymentMethod 