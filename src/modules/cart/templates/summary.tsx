"use client"

import { Button, Heading, Text } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { WufiButton } from "@lib/components"
import { ArrowRight, ShoppingBag, Shield } from "lucide-react"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import DiscountCode from "@modules/checkout/components/discount-code"
import { LocalizedClientLink } from "@lib/components"
import { CartTotals } from "@lib/components"
import { Separator as Divider } from "@lib/components"

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

  // Use cart's native totals without manual subscription discount calculation
  const adjustedTotals = useMemo(() => {
    return {
      currency_code: cart.currency_code,
      subtotal: cart.subtotal,
      discount_total: cart.discount_total,
      shipping_subtotal: cart.shipping_subtotal,
      tax_total: cart.tax_total,
      gift_card_total: cart.gift_card_total,
      total: cart.total,
    }
  }, [cart])

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="heading-primary flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-gray-700" />
          Kokkuvõte
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {cart.items?.length || 0} {(cart.items?.length || 0) === 1 ? 'toode' : 'toodet'} ostukorvis
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Discount Code Section */}
        <div>
          <DiscountCode cart={cart} />
        </div>
        
        {/* Totals Section */}
        <div>
          <CartTotals 
            totals={adjustedTotals} 
            hasShippingMethod={!!(cart.shipping_methods && cart.shipping_methods.length > 0)}
          />
        </div>
        
        {/* Checkout Button */}
        <div className="space-y-3">
          <LocalizedClientLink
            href={"/checkout?step=" + step}
            data-testid="checkout-button"
            className="block w-full"
          >
            <WufiButton 
              variant="primary"
              size="large"
              className="w-full shadow-lg justify-center group hover:shadow-xl transition-all duration-200"
            >
              Mine kassasse
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </WufiButton>
          </LocalizedClientLink>
          
          <p className="text-xs text-gray-500 text-center">
            Turvalist kassasse jätkamiseks vajutage nuppu
          </p>
        </div>
      </div>
    </div>
  )
}

export default Summary
