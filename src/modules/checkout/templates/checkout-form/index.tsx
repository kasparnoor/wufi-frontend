"use client"

import { HttpTypes } from "@medusajs/types"
import { Addresses } from "@lib/components"
import { Payment } from "@lib/components"
import { Review } from "@lib/components"
import { Shipping } from "@lib/components"
import { AutoshipOptions } from "@lib/components"
import { CheckoutErrorBoundary } from "@lib/components"
import { ShoppingBag, Clock, CreditCard, MapPin, RotateCcw, CheckCircle2, ArrowLeft } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { useEffect, useState, useMemo, useCallback } from "react"
import { WufiButton } from "@lib/components"
import { clx } from "@medusajs/ui"
import React from "react"

export default function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Add hydration state to prevent SSR/hydration mismatches
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const hasAutoshipEligibleItemsInCart = useMemo(() => {
    if (!cart) return false;
    return (cart.items || []).some(
      (item) => (item.product as any)?.metadata?.autoship === true
    );
  }, [cart]);

  const [shippingMethods, setShippingMethods] = useState<HttpTypes.StoreCartShippingOption[] | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[] | null>(null)

  const steps = useMemo(() => [
    ...(hasAutoshipEligibleItemsInCart ? [{ id: "autoship", name: "Püsitellimus", icon: <RotateCcw className="h-5 w-5" /> }] : []),
    { id: "address", name: "Kontakt & Aadress", icon: <MapPin className="h-5 w-5" /> },
    { id: "delivery", name: "Tarnimine", icon: <Clock className="h-5 w-5" /> },
    { id: "payment", name: "Maksmine", icon: <CreditCard className="h-5 w-5" /> },
    { id: "review", name: "Kinnitus", icon: <ShoppingBag className="h-5 w-5" /> }
  ], [hasAutoshipEligibleItemsInCart]);

  const initialStep = searchParams?.get("step");
  let determinedCurrentStep = initialStep || (hasAutoshipEligibleItemsInCart ? "autoship" : "address");
  if (!hasAutoshipEligibleItemsInCart && determinedCurrentStep === "autoship") {
    determinedCurrentStep = "address";
  } else if (!steps.find(s => s.id === determinedCurrentStep)) {
    determinedCurrentStep = hasAutoshipEligibleItemsInCart ? "autoship" : "address";
  }
  const [currentStep, setCurrentStep] = useState(determinedCurrentStep);
  useEffect(() => {
    setCurrentStep(determinedCurrentStep);
  }, [determinedCurrentStep]);

  const currentStepIndex = useMemo(() => steps.findIndex(s => s.id === currentStep), [steps, currentStep]);

  // Track address form validity to disable CTA until required fields are filled
  const [isAddressFormValid, setIsAddressFormValid] = useState(false);
  useEffect(() => {
    if (currentStep === 'address' && isHydrated) {
      // Add a delay to ensure the form is properly rendered after hydration
      const timeoutId = setTimeout(() => {
        const formEl = document.getElementById('address-form') as HTMLFormElement | null;
        if (formEl) {
          const updateValidity = () => {
            try {
              setIsAddressFormValid(formEl.checkValidity());
            } catch (error) {
              console.warn('Form validation error:', error);
              setIsAddressFormValid(false);
            }
          };
          
          updateValidity(); // Initial check
          
          // Add event listeners for real-time validation
          const inputs = Array.from(formEl.elements).filter(el => el.hasAttribute('name'));
          inputs.forEach(input => {
            input.addEventListener('input', updateValidity);
            input.addEventListener('change', updateValidity);
          });
          
          // Also listen for custom events if any components update validity externally
          formEl.addEventListener('customAddressValidityChange', updateValidity);

          return () => {
            inputs.forEach(input => {
              input.removeEventListener('input', updateValidity);
              input.removeEventListener('change', updateValidity);
            });
            formEl.removeEventListener('customAddressValidityChange', updateValidity);
          };
        } else {
          // Form not found, set validation to false
          setIsAddressFormValid(false);
        }
      }, 100); // Small delay to ensure DOM is ready

      return () => clearTimeout(timeoutId);
    } else {
      // Reset for other steps if needed, or ensure it doesn't interfere
      setIsAddressFormValid(false); 
    }
  }, [currentStep, isHydrated]);

  const handleStepClick = useCallback((stepId: string, stepIndex: number) => {
    if (stepIndex < currentStepIndex) {
      router.push(`${pathname}?step=${stepId}`);
    }
  }, [currentStepIndex, router, pathname, steps]);

  const handleStepKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>, stepId: string, stepIndex: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (stepIndex < currentStepIndex) {
        event.preventDefault();
        router.push(`${pathname}?step=${stepId}`);
      }
    }
  }, [currentStepIndex, router, pathname, steps]);
  
  useEffect(() => {
    if (cart?.id) {
      listCartShippingMethods(cart.id).then(setShippingMethods)
      listCartPaymentMethods(cart.region?.id ?? "").then(setPaymentMethods)
    }
  }, [cart?.id, cart?.region?.id])

  if (!cart) {
    return null
  }

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStepId = steps[currentStepIndex + 1].id;
      router.push(`${pathname}?step=${nextStepId}`);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStepId = steps[currentStepIndex - 1].id;
      router.push(`${pathname}?step=${prevStepId}`);
    }
  };

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
  let isNextButtonDisabled = false;
  if (currentStep === "address") {
    isNextButtonDisabled = !isAddressFormValid;
  } else if (currentStep === "delivery") {
    isNextButtonDisabled = !(cart && cart.shipping_methods && cart.shipping_methods.length > 0);
  } else if (currentStep === "payment") {
    const activePaymentSession = cart?.payment_collection?.payment_sessions?.find(ps => ps.status === 'pending');
    isNextButtonDisabled = !activePaymentSession;
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
                    onKeyDown={(e) => handleStepKeyDown(e, step.id, index)}
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
            {currentStep === "address" && <Addresses cart={cart} customer={customer} />}
            {currentStep === "delivery" && <Shipping cart={cart} availableShippingMethods={shippingMethods} />}
            {currentStep === "payment" && <Payment cart={cart} availablePaymentMethods={paymentMethods || []} />}
            {currentStep === "review" && <Review cart={cart} customer={customer} />}
          </div>

          {/* Action Buttons - Improved Layout */}
          {currentStep !== "review" && (
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
              {currentStepIndex > 0 ? (
                <button
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Tagasi
                </button>
              ) : (
                <div></div>
              )}

              <WufiButton
                variant="primary"
                size="large"
                onClick={goToNextStep}
                disabled={isNextButtonDisabled}
                className="px-8 py-3 min-w-[200px] font-semibold"
              >
                {getNextButtonText()}
              </WufiButton>
            </div>
          )}
        </div>
      </div>
    </CheckoutErrorBoundary>
  )
}
