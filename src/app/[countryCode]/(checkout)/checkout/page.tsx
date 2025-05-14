import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ShieldCheck } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
}

export default async function Checkout({ 
  params, // countryCode is in params
  searchParams 
}: { 
  params: { countryCode: string }; 
  searchParams: { step?: string } 
}) {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  
  await listCartShippingMethods(cart.id)
  await listCartPaymentMethods(cart.region?.id ?? "")

  const currentStep = searchParams?.step; // Read step into a variable

  return (
    <div className="py-8 bg-gray-50 min-h-[85vh]">
      <div className="content-container max-w-7xl mx-auto px-4 sm:px-6" data-testid="checkout-container">
        <div className={`grid grid-cols-1 gap-8 ${currentStep === 'review' ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_380px]'}`}>
          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <PaymentWrapper cart={cart}>
                <CheckoutForm 
                  cart={cart} 
                  customer={customer} 
                />
              </PaymentWrapper>
            </div>
          </div>
          
          <div className="h-fit">
            <div className="sticky top-20">
              {currentStep !== 'review' && (
                <div className="bg-white p-6 rounded-2xl shadow-md border-0 hover:shadow-lg transition-all duration-300">
                  <CheckoutSummary cart={cart} />
                </div>
              )}
              
              {currentStep !== 'review' && (
                <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Turvaline ostlemine</p>
                      <p className="text-xs text-gray-500">Kõik andmed on SSL krüpteeritud ja turvalised</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
