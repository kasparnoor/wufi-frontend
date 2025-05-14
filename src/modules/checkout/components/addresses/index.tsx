"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { MapPin } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useToggleState } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  // const handleContinue = () => {
  //   router.push(pathname + "?step=delivery")
  // }

  return (
    <div className={`${isOpen ? '' : 'opacity-75'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOpen ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <MapPin className="h-4 w-4" />
          </div>
          <h3 className="font-medium text-lg text-gray-900">Tarneinfo</h3>
        </div>
        
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            data-testid="edit-address-button"
          >
            Muuda
          </button>
        )}
      </div>
      
      {isOpen ? (
        <form action={formAction} id="address-form">
          <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-6">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 mt-6">
                  Arveldusaadress
                </h3>

                <BillingAddress cart={cart} />
              </div>
            )}
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          {cart && cart.shipping_address ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Tarneaadress
                  </p>
                  <p className="text-sm text-gray-900">
                    {cart.shipping_address.first_name}{" "}
                    {cart.shipping_address.last_name}
                  </p>
                  <p className="text-sm text-gray-900">
                    {cart.shipping_address.address_1}{" "}
                    {cart.shipping_address.address_2}
                  </p>
                  <p className="text-sm text-gray-900">
                    {cart.shipping_address.postal_code},{" "}
                    {cart.shipping_address.city}
                  </p>
                  <p className="text-sm text-gray-900">
                    {cart.shipping_address.country_code?.toUpperCase()}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Kontakt
                  </p>
                  <p className="text-sm text-gray-900">
                    {cart.shipping_address.phone}
                  </p>
                  <p className="text-sm text-gray-900">
                    {cart.email}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Arveldusaadress
                  </p>

                  {sameAsBilling ? (
                    <p className="text-sm text-gray-900">
                      Sama kui tarneaadress
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-900">
                        {cart.billing_address?.first_name}{" "}
                        {cart.billing_address?.last_name}
                      </p>
                      <p className="text-sm text-gray-900">
                        {cart.billing_address?.address_1}{" "}
                        {cart.billing_address?.address_2}
                      </p>
                      <p className="text-sm text-gray-900">
                        {cart.billing_address?.postal_code},{" "}
                        {cart.billing_address?.city}
                      </p>
                      <p className="text-sm text-gray-900">
                        {cart.billing_address?.country_code?.toUpperCase()}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {/* {isOpen === null && (
                <button
                  onClick={handleContinue}
                  className="w-full mt-5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Jätka tarnimisega
                </button>
              )} */}
            </>
          ) : (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Addresses
