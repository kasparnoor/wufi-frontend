import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"
import { ShoppingBag, Clock, Shield, ArrowLeft } from "lucide-react"
import { LocalizedClientLink } from "@lib/components"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="cart-container">
        {cart?.items?.length ? (
          <>
            {/* Compact Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <LocalizedClientLink
                  href="/"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Tagasi poodi</span>
                </LocalizedClientLink>
              </div>
              
              <h1 className="heading-hero mb-2">
                Teie valik
              </h1>
              <p className="text-gray-600">
                Vaadake üle oma tooted ja jätkake turvalise kassasse
              </p>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 lg:gap-8">
              {/* Left Column - Cart Items */}
              <div className="space-y-4">
                {/* Sign in prompt for guests */}
                {!customer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <SignInPrompt />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Cart Items */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <ItemsTemplate cart={cart} />
                </div>

                {/* Trust Signals - More Compact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-2 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Turvaline</h3>
                      <p className="text-xs text-gray-600">SSL krüpteeritud</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-2 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Kiire tarne</h3>
                      <p className="text-xs text-gray-600">1-3 tööpäeva</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="xl:sticky xl:top-4 h-fit">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <Summary cart={cart as any} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
