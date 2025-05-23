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
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    gift_card_total,
    shipping_subtotal,
  } = totals

  return (
    <div>
      {/* Breakdown Section */}
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            Vahesumma (enne saatmist ja makse)
          </span>
          <span data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-x-1 text-green-600 font-medium">
              🏷️ Allahindlus
            </span>
            <span
              className="text-green-600 font-semibold"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              - {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-1 text-gray-700">
            📦 Saatmine (1–3 tööpäeva jooksul)
          </span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-x-1 text-gray-700">
            🧾 Maksud
          </span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-x-1 text-gray-700">
              🎁 Kinkekaart
            </span>
            <span
              className="text-green-600 font-semibold"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              - {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>

      {/* Savings and Total */}
      <div className="mt-4 text-right space-y-2">
        {(discount_total ?? 0) > 0 && (
          <div className="text-green-600 font-bold">
            Säästsid {convertToLocale({ amount: discount_total ?? 0, currency_code })}
          </div>
        )}
        <div className="h-px w-full border-b border-gray-200" />
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg font-bold text-xl">
          <span>Kokku</span>
          <span data-testid="cart-total" data-value={total ?? 0}>
            {convertToLocale({ amount: total ?? 0, currency_code })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CartTotals
