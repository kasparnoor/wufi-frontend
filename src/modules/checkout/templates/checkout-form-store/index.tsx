"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { HttpTypes } from "@medusajs/types"
import { useCheckoutStore } from '../../../../lib/stores/checkout-store'
import AddressesNew from "../../components/addresses-new"
import ShippingNew from "../../components/shipping-new"
import Payment from "../../components/payment"
import Review from "../../components/review"
import AutoshipOptions from "../../components/autoship-options"
import CheckoutErrorBoundary from "../../components/checkout-error-boundary"
import { ShoppingBag, Clock, CreditCard, MapPin, RotateCcw, CheckCircle2, ArrowLeft } from "lucide-react"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { KrapsButton } from "@lib/components"
import { clx } from "@medusajs/ui"

interface CheckoutFormProps {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}

export default function CheckoutFormStore({ cart, customer }: CheckoutFormProps) {
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    stepValidation,
    isLoading,
    error,
    reset,
  } = useCheckoutStore()

  const [shippingMethods, setShippingMethods] = useState<any[] | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[] | null>(null)

  // Check for autoship eligible items
  const hasAutoshipEligibleItemsInCart = useMemo(() => {
    if (!cart) return false;
    return (cart.items || []).some(
      (item) => (item.product as any)?.metadata?.autoship === true
    );
  }, [cart]);

  // Define steps based on cart contents
  const steps = useMemo(() => [
    ...(hasAutoshipEligibleItemsInCart ? [{ id: "autoship", name: "Püsitellimus", icon: <RotateCcw className="h-5 w-5" /> }] : []),
    { id: "address", name: "Kontakt & Aadress", icon: <MapPin className="h-5 w-5" /> },
    { id: "delivery", name: "Tarnimine", icon: <Clock className="h-5 w-5" /> },
    { id: "payment", name: "Maksmine", icon: <CreditCard className="h-5 w-5" /> },
    { id: "review", name: "Kinnitus", icon: <ShoppingBag className="h-5 w-5" /> }
  ], [hasAutoshipEligibleItemsInCart]);

  // Initialize current step
  useEffect(() => {
    if (hasAutoshipEligibleItemsInCart && currentStep === 'address') {
      setCurrentStep('autoship')
    } else if (!hasAutoshipEligibleItemsInCart && currentStep === 'autoship') {
      setCurrentStep('address')
    }
  }, [hasAutoshipEligibleItemsInCart, currentStep, setCurrentStep])

  // Load shipping methods when cart changes
  useEffect(() => {
    if (!cart?.id || !cart?.region?.id) return
    
    const loadShippingMethods = async () => {
      try {
        const methods = await listCartShippingMethods(cart.id)
        setShippingMethods(methods)
      } catch (error) {
        console.warn('Failed to load shipping methods:', error)
        setShippingMethods([])
      }
    }

    loadShippingMethods()
  }, [cart?.id, cart?.region?.id])

  // Load payment methods when cart changes
  useEffect(() => {
    if (!cart?.id || !cart?.region?.id) return
    
    const loadPaymentMethods = async () => {
      try {
        const methods = await listCartPaymentMethods(cart.region?.id || '')
        setPaymentMethods(methods)
      } catch (error) {
        console.warn('Failed to load payment methods:', error)
        setPaymentMethods([])
      }
    }

    loadPaymentMethods()
  }, [cart?.id, cart?.region?.id])

  const currentStepIndex = useMemo(() => steps.findIndex(s => s.id === currentStep), [steps, currentStep]);

  // Handle step navigation
  const handleStepClick = (stepId: string, stepIndex: number) => {
    // Only allow navigation to previous steps or current step
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(stepId as any)
    }
  }

  // Get next button text
  const getNextButtonText = () => {
    switch (currentStep) {
      case "autoship":
        return "Jätka kontaktandmetega";
      case "address":
        return "Vali tarneviis";
      case "delivery":
        return "Vali makseviis";
      case "payment":
        return "Vaata üle tellimus";
      default:
        return "Edasi";
    }
  };

  // Determine if the next button should be disabled
  const isNextButtonDisabled = () => {
    switch (currentStep) {
      case "autoship":
        return false
      case "address":
        return !stepValidation.address
      case "delivery":
        return !stepValidation.delivery
      case "payment":
        return !stepValidation.payment
      default:
        return false
    }
  }

  if (!cart) {
    return null
  }

  return (
    <CheckoutErrorBoundary>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with improved visual hierarchy */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-8 py-6 border-b border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Turvaline ostlemine</h1>
            <div className="text-sm text-gray-600">
              Samm {currentStepIndex + 1} / {steps.length}
            </div>
          </div>
          
          {/* Completely Redesigned Progress Bar */}
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
            
            {/* Progress Line */}
            <div 
              className="absolute top-6 left-6 h-0.5 bg-green-500 transition-all duration-500"
              style={{ 
                width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 0px)` 
              }}
            ></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isActive = currentStepIndex === index;
                const isPast = currentStepIndex > index;
                const isNext = currentStepIndex < index;
                
                return (
                  <div 
                    key={step.id} 
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => handleStepClick(step.id, index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleStepClick(step.id, index)
                      }
                    }}
                    role="button"
                    tabIndex={isPast ? 0 : -1}
                    aria-label={`Mine sammule ${step.name}`}
                  >
                    {/* Step Circle */}
                    <div
                      className={clx(
                        "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 border-2 relative z-10",
                        {
                          "bg-yellow-500 text-white border-yellow-500 shadow-lg": isActive,
                          "bg-green-500 text-white border-green-500 hover:scale-105": isPast,
                          "bg-white text-gray-400 border-gray-300 group-hover:border-gray-400": isNext,
                        }
                      )}
                    >
                      {isPast ? <CheckCircle2 className="h-6 w-6" /> : step.icon}
                    </div>
                    
                    {/* Step Label */}
                    <span
                      className={clx("text-sm font-medium text-center max-w-24", {
                        "text-yellow-800": isActive,
                        "text-green-700": isPast,
                        "text-gray-500": isNext,
                      })}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="min-h-[400px] space-y-8">
            {currentStep === "autoship" && hasAutoshipEligibleItemsInCart && <AutoshipOptions cart={cart} />}
            {currentStep === "address" && <AddressesNew cart={cart} customer={customer} />}
            {currentStep === "delivery" && <ShippingNew cart={cart} availableShippingMethods={shippingMethods} />}
            {currentStep === "payment" && <Payment cart={cart} availablePaymentMethods={paymentMethods || []} />}
            {currentStep === "review" && <Review cart={cart} customer={customer} />}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons - Only show for address step */}
          {currentStep === "address" && (
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
              {currentStepIndex > 0 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Tagasi
                </button>
              ) : (
                <div></div>
              )}

                             <KrapsButton
                 variant="primary"
                 size="large"
                 onClick={nextStep}
                 disabled={isNextButtonDisabled() || isLoading}
                 className="px-8 py-3 min-w-[200px] font-semibold"
               >
                 {isLoading ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     Laeb...
                   </>
                 ) : (
                   getNextButtonText()
                 )}
               </KrapsButton>
            </div>
          )}

          {/* Back Button for Review Step */}
          {currentStep === "review" && (
            <div className="flex items-center justify-start pt-8 border-t border-gray-200 mt-8">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
                Tagasi makseviiside juurde
              </button>
            </div>
          )}
        </div>
      </div>
    </CheckoutErrorBoundary>
  )
} 