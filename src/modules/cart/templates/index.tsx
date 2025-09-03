import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import { HttpTypes } from "@medusajs/types"
import { ArrowLeft } from "lucide-react"
import { LocalizedClientLink } from "@lib/components"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 lg:py-6">
      <div className="content-container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8" data-testid="cart-container">
        {cart?.items?.length ? (
          <>
            {/* Compact Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <LocalizedClientLink
                  href="/"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Tagasi poodi</span>
                </LocalizedClientLink>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                Teie valik
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Vaadake üle oma tooted ja jätkage turvalise kassasse
              </p>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column - Cart Items */}
              <div className="space-y-3 sm:space-y-4">
                {/* Cart Items */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                  <ItemsTemplate cart={cart} />
                </div>


              </div>

              {/* Right Column - Summary */}
              <div className="xl:sticky xl:top-4 h-fit">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
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
