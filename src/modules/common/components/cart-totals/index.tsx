"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    shipping_subtotal?: number | null
  }
  hasShippingMethod?: boolean
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, hasShippingMethod = false }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    gift_card_total,
    shipping_subtotal,
  } = totals

  const getShippingDisplay = () => {
    if (!hasShippingMethod) {
      return 'Arvutatakse hiljem'
    }
    if (shipping_subtotal === 0) {
      return 'Tasuta'
    }
    return convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })
  }

  return (
    <div className="space-y-4">
      {/* Breakdown Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-700 text-sm">
            Vahesumma
          </span>
          <span className="font-medium text-gray-900" data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        
        {!!discount_total && (
          <div className="flex items-center justify-between py-2 bg-green-50 -mx-3 px-3 rounded-lg">
            <span className="flex items-center gap-x-2 text-green-700 font-medium text-sm">
              🏷️ Allahindlus
            </span>
            <span
              className="text-green-700 font-bold"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              - {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between py-2">
          <span className="flex items-center gap-x-2 text-gray-700 text-sm">
            📦 Saatmine
          </span>
          <span className="font-medium text-gray-900" data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {getShippingDisplay()}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <span className="flex items-center gap-x-2 text-gray-700 text-sm">
            🧾 Maksud
          </span>
          <span className="font-medium text-gray-900" data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
        
        {!!gift_card_total && (
          <div className="flex items-center justify-between py-2 bg-purple-50 -mx-3 px-3 rounded-lg">
            <span className="flex items-center gap-x-2 text-purple-700 font-medium text-sm">
              🎁 Kinkekaart
            </span>
            <span
              className="text-purple-700 font-bold"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              - {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Savings Display */}
      {(discount_total ?? 0) > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-700 font-bold text-sm">
            🎉 Säästsite: {convertToLocale({ amount: discount_total ?? 0, currency_code })}
          </p>
        </div>
      )}

      {/* Total */}
      <div className="bg-gray-900 text-white rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Kokku</span>
          <span className="text-2xl font-bold" data-testid="cart-total" data-value={total ?? 0}>
            {convertToLocale({ amount: total ?? 0, currency_code })}
          </span>
        </div>
        <p className="text-gray-300 text-xs mt-1">
          Kõik maksud ja tasud kaasa arvatud
        </p>
      </div>
    </div>
  )
}

export default CartTotals
