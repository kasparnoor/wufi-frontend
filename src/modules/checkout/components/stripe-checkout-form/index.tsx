"use client"

import React, { useState, useEffect } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@medusajs/ui'
import { placeOrder } from '@lib/data/cart'
import { convertToLocale } from '@lib/util/money'
import { convertIntervalToText } from '@lib/util/subscription-intervals'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface CheckoutFormProps {
  cart: HttpTypes.StoreCart
  onPaymentSuccess?: (order: any) => void
  onPaymentError?: (error: string) => void
}

const StripeCheckoutForm: React.FC<CheckoutFormProps> = ({ 
  cart, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Detect subscription items in cart
  const subscriptionItems = cart.items?.filter(item => 
    item.metadata?.purchase_type === "subscription" && 
    item.metadata?.autoship === "true"
  ) || []
  
  const hasSubscriptions = subscriptionItems.length > 0
  
  // Calculate pricing
  const currencyCode = cart.currency_code?.toUpperCase() || 'EUR'
  const formatPrice = (amount: number) => {
    return convertToLocale({ amount, currency_code: currencyCode })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      setErrorMessage('Payment system not ready. Please try again.')
      return
    }
    
    setIsProcessing(true)
    setErrorMessage(null)
    
    try {
      // STEP 1: Submit elements (required by Stripe before confirmPayment)
      console.log('Submitting Stripe Elements...')
      const { error: submitError } = await elements.submit()
      if (submitError) {
        console.error('Elements submit failed:', submitError)
        const errorMsg = handleStripeError(submitError)
        setErrorMessage(errorMsg)
        onPaymentError?.(errorMsg)
        return
      }
      
      // STEP 2: Confirm payment (after elements.submit() is successful)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        }
      })

      if (error) {
        const errorMsg = handleStripeError(error)
        setErrorMessage(errorMsg)
        onPaymentError?.(errorMsg)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Complete the cart → creates order → triggers subscription creation
        try {
          // Reduced wait time for payment session to be properly authorized in Medusa
          await new Promise(resolve => setTimeout(resolve, 1000))  // Reduced from 2000ms to 1000ms
          
          await placeOrder()
          // The placeOrder function already handles redirect, but if we need custom handling:
          // onPaymentSuccess?.(order)
        } catch (orderError: any) {
          console.error('Order completion failed:', orderError)
          
          let orderErrorMsg = 'Order completion failed'
          
          // Handle timeout errors specifically
          if (orderError.name === 'AbortError' || 
              orderError.message?.toLowerCase().includes('timeout') ||
              orderError.message?.includes('timed out')) {
            orderErrorMsg = 'Order processing timed out. Your payment was successful. Please check your order status or contact support.'
          } else if (orderError.message?.includes('network') || orderError.message?.includes('fetch')) {
            orderErrorMsg = 'Network error occurred. Your payment was successful. Please check your order status or contact support.'
          } else if (orderError.message?.includes('Payment session validation failed')) {
            // Handle specific validation timeout - payment was successful but order completion timed out
            orderErrorMsg = 'Payment successful but order completion is taking longer than expected. Please check your order status or contact support.'
          } else {
            orderErrorMsg = orderError.message || 'Order completion failed'
          }
          
          setErrorMessage(orderErrorMsg)
          onPaymentError?.(orderErrorMsg)
        }
      }
    } catch (err: any) {
      console.error('Payment processing failed:', err)
      
      let processErrorMsg = 'Payment processing failed. Please try again.'
      
      // Handle timeout errors specifically
      if (err.name === 'AbortError' || 
          err.message?.toLowerCase().includes('timeout') ||
          err.message?.includes('timed out')) {
        processErrorMsg = 'Payment processing timed out. Please check your connection and try again.'
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        processErrorMsg = 'Network error occurred. Please check your connection and try again.'
      }
      
      setErrorMessage(processErrorMsg)
      onPaymentError?.(processErrorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStripeError = (error: any): string => {
    switch (error.code) {
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method.'
      case 'insufficient_funds':
        return 'Insufficient funds. Please try a different card.'
      case 'expired_card':
        return 'Your card has expired. Please use a different card.'
      case 'incorrect_cvc':
        return 'Your card\'s security code is incorrect. Please try again.'
      case 'processing_error':
        return 'An error occurred while processing your card. Please try again.'
      case 'authentication_required':
        return 'Additional authentication is required. Please follow the prompts.'
      default:
        return error.message || 'Payment failed. Please try again.'
    }
  }

  const getButtonText = () => {
    if (isProcessing) return 'Processing Payment...'
    if (hasSubscriptions) return 'Complete Purchase & Start Subscription'
    return 'Complete Purchase'
  }

  return (
    <div className="space-y-6">
      {/* Subscription Notice */}
      {hasSubscriptions && (
        <div className="subscription-notice bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                🔄 Subscription Items in Your Order
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                These items will be automatically renewed based on your selected schedule:
              </p>
              <ul className="space-y-2">
                {subscriptionItems.map(item => (
                  <li key={item.id} className="text-sm text-blue-700 flex items-center justify-between">
                    <span>
                      • {item.product_title} ({item.quantity}x)
                    </span>
                    <span className="font-medium">
                      Every {convertIntervalToText(item.metadata?.interval as string || '1m')}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Your subscription benefits:</strong> Cancel anytime, modify delivery schedule, 
                  automatic renewals, and continued savings on future orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="payment-element-container">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {hasSubscriptions 
              ? "Payment Method (saved for future subscription orders)" 
              : "Payment Method"}
          </label>
                     <PaymentElement 
             options={{
               layout: "tabs",
               fields: {
                 billingDetails: "auto",
               },
               terms: {
                 card: hasSubscriptions ? "auto" : "never",
               },
             }}
           />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="error-message bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Payment Error</h4>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="order-summary bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(cart.subtotal || 0)}</span>
            </div>
            {(cart.shipping_total || 0) > 0 && (
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatPrice(cart.shipping_total || 0)}</span>
              </div>
            )}
            {(cart.tax_total || 0) > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatPrice(cart.tax_total || 0)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatPrice(cart.total || 0)}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="w-full py-3 text-base font-medium"
          size="large"
        >
          {getButtonText()}
        </Button>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 text-center">
          Your payment information is secure and encrypted. 
          {hasSubscriptions && ' Your payment method will be securely saved for future subscription orders.'}
        </p>
      </form>
    </div>
  )
}

export default StripeCheckoutForm 