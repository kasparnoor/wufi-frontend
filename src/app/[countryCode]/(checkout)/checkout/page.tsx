import { retrieveCart, retrieveOrRestoreCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { PaymentWrapper } from "@lib/components"
import CheckoutFormSimplified from "@modules/checkout/templates/checkout-form-simplified"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Kassa | Kraps",
  description: "Lõpeta oma tellimus turvaliselt. Kiire kohaletoimetamine üle Eesti.",
}

export default async function Checkout({ 
  params,
  searchParams 
}: { 
  params: { countryCode: string }; 
  searchParams: Promise<{ step?: string }>
}) {
  let cart = null
  let customer = null
  
  try {
    // Try cart cookie, then secure restore for logged-in users
    cart = await retrieveCart()
    if (!cart) {
      cart = await retrieveOrRestoreCart(params.countryCode)
    }
    customer = await retrieveCustomer()
    
    // Only fetch shipping/payment methods if cart exists and we're not in the middle of payment processing
    if (cart) {
      // Wrap in try-catch to handle payment processing state issues
      try {
        await listCartShippingMethods(cart.id)
        await listCartPaymentMethods(cart.region?.id ?? "")
      } catch (methodsError) {
        console.warn('Failed to load shipping/payment methods during checkout:', methodsError)
        // Continue with checkout even if methods fail to load
        // The client-side will handle loading these when needed
      }
    }
  } catch (error) {
    console.error('Error loading checkout data:', error)
    // Continue rendering even if cart/customer loading fails
    // The checkout form will handle empty state gracefully
  }

  // Hard gate: require a real cart with items. If cookies were cleared or cart is empty, go back to cart page.
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    redirect(`/${params.countryCode}/cart`)
  }

  // Await searchParams to fix Next.js 15 error
  const resolvedSearchParams = await searchParams
  const currentStep = resolvedSearchParams?.step;
  const isReviewStep = currentStep === 'review';

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="content-container max-w-4xl mx-auto px-4 sm:px-6" data-testid="checkout-container">
        {/* Single Column Layout */}
        <div className="w-full">
          <PaymentWrapper cart={cart}>
            <CheckoutFormSimplified 
              cart={cart} 
              customer={customer} 
            />
          </PaymentWrapper>
        </div>
      </div>
    </div>
  )
}
