import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { PaymentWrapper } from "@lib/components"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Shield, ArrowLeft } from "lucide-react"
import { LocalizedClientLink } from "@lib/components"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
}

export default async function Checkout({ 
  params,
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

  const currentStep = searchParams?.step;
  const isReviewStep = currentStep === 'review';

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="content-container max-w-7xl mx-auto px-4 sm:px-6" data-testid="checkout-container">
        {/* Back to Store Link */}
        <div className="mb-6">
          <LocalizedClientLink
            href="/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Tagasi ostukorvi</span>
          </LocalizedClientLink>
        </div>

        {/* Responsive Layout */}
        <div className={
          isReviewStep 
            ? "grid grid-cols-1 gap-8" 
            : "grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8"
        }>
          {/* Main Content */}
          <div className={isReviewStep ? "max-w-6xl mx-auto" : ""}>
            <PaymentWrapper cart={cart}>
              <CheckoutForm 
                cart={cart} 
                customer={customer} 
              />
            </PaymentWrapper>
          </div>
          
          {/* Sidebar - Hidden on Review Step */}
          {!isReviewStep && (
            <div className="xl:sticky xl:top-6 h-fit">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <CheckoutSummary cart={cart} />
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="mt-4 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-800" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Turvaline ostlemine</p>
                    <p className="text-xs text-gray-500">256-bit SSL krüpteering ja PCI sertifitseeritud</p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="mt-4 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 mb-2">Vajate abi?</p>
                  <div className="space-y-1">
                    <a 
                      href="mailto:help@wufi.ee" 
                      className="block text-sm text-yellow-700 hover:text-yellow-800 transition-colors"
                    >
                      📧 help@wufi.ee
                    </a>
                    <a 
                      href="tel:+372123456" 
                      className="block text-sm text-yellow-700 hover:text-yellow-800 transition-colors"
                    >
                      📞 +372 123 456
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
