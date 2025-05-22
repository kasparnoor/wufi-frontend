"use client"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import WufiButton from "@modules/common/components/wufi-button"
import { ArrrowRight, ShoppingBag } from "@medusajs/icons"
import { useMemo } from "react"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  // If the cart has any subscription items, start at the autoship step
  if ((cart.items ?? []).some(item => item.metadata?.purchase_type === "subscription")) {
    return "autoship"
  }
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  // Calculate total subscription discount across line items
  const subscriptionDiscountSum = useMemo(() => {
    return (cart.items ?? []).reduce((sum, item) => {
      if (
        item.metadata?.purchase_type === "subscription" &&
        item.metadata?.is_first_order === "true"
      ) {
        const pct = parseFloat(String(item.metadata.subscription_discount ?? 0))
        const lineTotal = (item.unit_price || 0) * (item.quantity || 0)
        return sum + lineTotal * (pct / 100)
      }
      return sum
    }, 0)
  }, [cart.items])

  // Adjust cart totals to include subscription discount
  const adjustedTotals = useMemo(() => {
    const originalDiscount = cart.discount_total || 0
    const subtotal = (cart.subtotal || 0) - subscriptionDiscountSum
    const discount_total = originalDiscount + subscriptionDiscountSum
    const total = (cart.total || 0) - subscriptionDiscountSum
    return {
      currency_code: cart.currency_code,
      subtotal,
      discount_total,
      shipping_subtotal: cart.shipping_subtotal,
      tax_total: cart.tax_total,
      gift_card_total: cart.gift_card_total,
      total,
    }
  }, [cart, subscriptionDiscountSum])

  return (
    <div className="flex flex-col gap-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Kokkuvõte</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <DiscountCode cart={cart} />
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <CartTotals totals={adjustedTotals} />
        </div>
        
        <div className="pt-2">
          <LocalizedClientLink
            href={"/checkout?step=" + step}
            data-testid="checkout-button"
            className="block w-full"
          >
            <WufiButton 
              variant="primary"
              size="large"
              className="w-full shadow-md justify-center"
            >
              Mine kassasse
              <ArrrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </WufiButton>
          </LocalizedClientLink>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl mt-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="text-gray-700 font-medium">Turvaline maksmine</span>
          </div>
          <p className="text-sm text-gray-600">
            Tellimuse eest saate tasuda kasutades krediit- või deebetkaarte. Kõik maksetehingud on krüpteeritud.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Summary
