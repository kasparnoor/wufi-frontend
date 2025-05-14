import { ShoppingBag } from "@medusajs/icons"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"

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

  return (
    <div className="flex flex-col gap-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Tellimuse kokkuvõte
        </h2>
      </div>
      <div className="space-y-6">
        <div>
          <ItemsPreviewTemplate cart={cart} />
        </div>
        <div>
          <DiscountCode cart={cart} />
        </div>
        <div className="border-t border-gray-200 pt-6">
          <CartTotals totals={adjustedTotals} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
