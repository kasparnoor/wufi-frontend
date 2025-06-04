import { ShoppingBag, Shield, Truck, Clock } from "lucide-react"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import { DiscountCode } from "@lib/components"
import { CartTotals } from "@lib/components"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  // Compute total subscription discount
  const subscriptionDiscountSum = (cart.items ?? []).reduce((sum: number, item: any) => {
    if (
      item.metadata?.purchase_type === "subscription" &&
      item.metadata?.is_first_order === "true"
    ) {
      const pct = parseFloat(String(item.metadata.subscription_discount ?? 0))
      const lineTotal = (item.unit_price ?? 0) * (item.quantity ?? 0)
      return sum + lineTotal * (pct / 100)
    }
    return sum
  }, 0)

  // Build adjusted totals object
  const adjustedTotals = {
    currency_code: cart.currency_code,
    subtotal: (cart.subtotal ?? 0) - subscriptionDiscountSum,
    discount_total: (cart.discount_total ?? 0) + subscriptionDiscountSum,
    shipping_subtotal: cart.shipping_subtotal,
    tax_total: cart.tax_total,
    gift_card_total: cart.gift_card_total,
    total: (cart.total ?? 0) - subscriptionDiscountSum,
  }

  const itemCount = cart.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0

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
        />
      </div>

      {/* Trust Signals */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-800">SSL turvaline</p>
            <p className="text-green-600">Andmed on krüpteeritud</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Truck className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">Tasuta tarne</p>
            <p className="text-blue-600">Üle 50€ tellimusele</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-orange-800">Kiire tarne</p>
            <p className="text-orange-600">1-3 tööpäeva</p>
          </div>
        </div>
      </div>

      {/* Customer Support */}
      <div className="border-t border-gray-200 pt-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Vajate abi?</p>
          <a 
            href="mailto:help@wufi.ee" 
            className="text-sm font-medium text-yellow-700 hover:text-yellow-800 transition-colors"
          >
            Võtke meiega ühendust →
          </a>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
