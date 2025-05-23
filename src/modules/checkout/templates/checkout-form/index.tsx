"use client"

import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import AutoshipOptions from "@modules/checkout/components/autoship-options"
import { ShoppingBag, Clock, CreditCard, MapPin, ArrowPathMini } from "@medusajs/icons"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { useEffect, useState, useMemo, useCallback } from "react"
import WufiButton from "@modules/common/components/wufi-button"
import { clx } from "@medusajs/ui"

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

  const hasAutoshipEligibleItemsInCart = useMemo(() => {
    if (!cart) return false;
    return (cart.items || []).some(
      (item) => (item.product as any)?.metadata?.autoship === true
    );
  }, [cart]);

  const [shippingMethods, setShippingMethods] = useState<HttpTypes.StoreCartShippingOption[] | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[] | null>(null)

  const steps = useMemo(() => [
    ...(hasAutoshipEligibleItemsInCart ? [{ id: "autoship", name: "Püsitellimus", icon: <ArrowPathMini className="h-5 w-5" /> }] : []),
    { id: "address", name: "Aadress", icon: <MapPin className="h-5 w-5" /> },
    { id: "delivery", name: "Tarnimine", icon: <Clock className="h-5 w-5" /> },
    { id: "payment", name: "Maksmine", icon: <CreditCard className="h-5 w-5" /> },
    { id: "review", name: "Ülevaade", icon: <ShoppingBag className="h-5 w-5" /> }
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
    if (currentStep === 'address') {
      const formEl = document.getElementById('address-form') as HTMLFormElement | null;
      if (formEl) {
        const updateValidity = () => setIsAddressFormValid(formEl.checkValidity());
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
      }
    } else {
      // Reset for other steps if needed, or ensure it doesn't interfere
      setIsAddressFormValid(false); 
    }
  }, [currentStep]);

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
        return "Edasi aadressi juurde";
      case "address":
        return "Jätka tarneviisiga";
      case "delivery":
        return "Jätka maksmisega";
      case "payment":
        return "Jätka ülevaatusega";
      // No case for 'review' as the button is hidden on the last step by current logic
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
  // For "autoship", it's enabled by default if present.
  // For "review", the button is not shown.

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <div className="mb-10">
        <div className="relative flex items-center justify-between px-6">
          <div className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200 z-0"></div>
          <div
            className="absolute left-6 top-1/2 h-0.5 -translate-y-1/2 bg-yellow-400 z-0 transition-all duration-300"
            style={{ width: `${(currentStepIndex) / (steps.length - 1) * 100}%` }}
          />
          {steps.map((step, index) => {
            const isActive = currentStepIndex === index;
            const isPast = currentStepIndex > index;
            
            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center relative z-10 ${isPast ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => handleStepClick(step.id, index)}
                onKeyDown={(e) => handleStepKeyDown(e, step.id, index)}
                role="button"
                tabIndex={isPast ? 0 : -1}
                aria-label={`Mine sammule ${step.name}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200 scale-110'
                      : isPast
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-yellow-700 border-b-2 border-yellow-300 pb-1'
                      : isPast
                      ? 'text-gray-700'
                      : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="min-h-[300px] space-y-10">
        {currentStep === "autoship" && hasAutoshipEligibleItemsInCart && <AutoshipOptions cart={cart} />}
        {currentStep === "address" && <Addresses cart={cart} customer={customer} />}
        {currentStep === "delivery" && <Shipping cart={cart} availableShippingMethods={shippingMethods} />}
        {currentStep === "payment" && <Payment cart={cart} availablePaymentMethods={paymentMethods || []} />}
        {currentStep === "review" && <Review cart={cart} customer={customer} />}
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        <div>
          {currentStepIndex > 0 && (
            <WufiButton
              variant="secondary" 
              onClick={goToPreviousStep}
              className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
              size="large"
            >
              Tagasi
            </WufiButton>
          )}
        </div>
        <div>
          {currentStepIndex < steps.length - 1 && (
            <WufiButton
              variant="primary"
              type={currentStep === "address" ? "submit" : "button"}
              form={currentStep === "address" ? "address-form" : undefined}
              onClick={currentStep === "address" ? undefined : goToNextStep}
              size="large"
              className={clx(
                currentStep === "address" ? "px-10 py-4 text-lg" : "",
                {
                  "opacity-50 cursor-not-allowed": isNextButtonDisabled,
                  // Add any specific disabled hover/focus styles if needed, e.g.:
                  // "hover:bg-primary-base focus:ring-primary-base": isNextButtonDisabled 
                  // (assuming primary-base is the default non-hover state)
                }
              )}
              disabled={isNextButtonDisabled}
            >
              {getNextButtonText()}
              {currentStep === "address" && <span className="ml-2">→</span>}
            </WufiButton>
          )}
        </div>
      </div>
    </div>
  )
}
