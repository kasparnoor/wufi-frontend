import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"
import { ShoppingBag, Clock, Truck, Shield } from "lucide-react"
import { LocalizedClientLink } from "@lib/components"
import { FreeShippingProgress } from "@lib/components"

const CheckoutSummary = ({
  cart,
}: {
  cart: HttpTypes.StoreCart | null
}) => {
  if (!cart?.id) {
    return null
  }

  const itemCount = cart.items?.length || 0

  // Calculate adjusted totals to apply subscription discounts
  const adjustedTotals = {
    currency_code: cart.currency_code,
    subtotal: cart.subtotal,
    discount_total: cart.discount_total,
    shipping_subtotal: cart.shipping_subtotal,
    tax_total: cart.tax_total,
    gift_card_total: cart.gift_card_total,
    total: cart.total,
  }

  return (
    <div className="space-y-6">
      {/* Header with item count */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-yellow-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Tellimuse kokkuvõte
            </h2>
            <p className="text-sm text-gray-600">
              {itemCount} {itemCount === 1 ? 'toode' : 'toodet'}
            </p>
          </div>
        </div>
      </div>

      {/* Free Shipping Progress */}
      <div>
        <FreeShippingProgress 
          subtotal={cart.subtotal || 0}
          currencyCode={cart.currency_code}
        />
      </div>

      {/* Order Items - Collapsible */}
      <div className="space-y-4">
        <ItemsPreviewTemplate cart={cart} />
      </div>

      {/* Discount Code */}
      <div className="border-t border-gray-200 pt-4">
        <DiscountCode cart={cart} />
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4">
        <CartTotals 
          totals={adjustedTotals} 
          hasShippingMethod={!!(cart.shipping_methods && cart.shipping_methods.length > 0)}
          cart={cart}
        />
      </div>

      {/* Customer Support */}
      <div className="border-t border-gray-200 pt-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Vajate abi?</p>
          <LocalizedClientLink
            href="/klienditugi"
            className="text-sm font-medium text-yellow-700 hover:text-yellow-800 transition-colors"
          >
            Võtke meiega ühendust →
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
