import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { ShoppingBag, Clock } from "@medusajs/icons"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="pt-24 pb-12 bg-gray-50">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <>
            <div className="flex flex-col items-start mb-8">
              <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
                <ShoppingBag className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-700 font-semibold">Teie ostukorv</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Ostukorvi sisu</h1>
              <p className="text-gray-600">Vaadake üle oma tooted ja jätkake kassasse</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
              <div className="flex flex-col gap-y-6">
                {!customer && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border-0 mb-4">
                    <SignInPrompt />
                  </div>
                )}
                
                <div className="bg-white p-4 rounded-xl shadow-sm border-0">
                  <ItemsTemplate cart={cart} />
                </div>

                {/* Shopping features */}
                <div className="flex items-center justify-between gap-4 mt-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm border-0 flex items-center gap-2 group hover:shadow-md transition-shadow duration-200">
                    <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Turvaline</h3>
                      <p className="text-xs text-gray-600">SSL krüpteeritud</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded-xl shadow-sm border-0 flex items-center gap-2 group hover:shadow-md transition-shadow duration-200">
                    <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Kiire kohaletoimetamine</h3>
                      <p className="text-xs text-gray-600">1-3 tööpäeva</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded-xl shadow-sm border-0 flex items-center gap-2 group hover:shadow-md transition-shadow duration-200">
                    <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Tagastamine</h3>
                      <p className="text-xs text-gray-600">30-päeva õigus</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="sticky top-20">
                  {cart && cart.region && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
                      <Summary cart={cart as any} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-4 rounded-xl shadow-sm border-0 flex flex-col items-center">
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
