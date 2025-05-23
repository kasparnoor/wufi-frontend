"use client"

import { ShoppingBag, Clock, CreditCard, ArrowPathMini } from '@medusajs/icons'
import { convertToLocale } from '@lib/util/money'
import { paymentInfoMap } from '@lib/constants'
import { placeOrder } from '@lib/data/cart'
import { useState } from 'react'
import { useSearchParams } from "next/navigation"
import WufiButton from '@modules/common/components/wufi-button'
import Thumbnail from '@modules/products/components/thumbnail'

const Review = ({ cart, customer }: { cart: any, customer: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  // For subscription items
  const subscriptionItems = (cart.items ?? []).filter(
    (item: any) => item.metadata?.purchase_type === 'subscription'
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Helper to calculate next charge date from interval metadata
  const getNextChargeDate = (interval?: string): string | null => {
    if (!interval) {
      return null
    }
    const match = interval.match(/(\d+)(\w+)/)
    if (!match) {
      return null
    }
    const value = parseInt(match[1], 10)
    const unit = match[2]
    const now = new Date()
    let date: Date | null = null
    switch (unit) {
      case 'w':
        date = new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000)
        break
      case 'm':
        date = new Date(now)
        date.setMonth(date.getMonth() + value)
        break
      case 'd':
        date = new Date(now.getTime() + value * 24 * 60 * 60 * 1000)
        break
      default:
        return null
    }
    return date.toLocaleDateString()
  }

  // FIRST_EDIT: Insert interval converter to human-readable Estonian text
  const convertIntervalToText = (interval?: string): string => {
    if (!interval) return '—'
    const match = interval.match(/(\d+)(\w+)/)
    if (!match) return interval
    const [, value, unit] = match
    const mapping: Record<string, string> = { w: 'nädala', m: 'kuu', d: 'päeva' }
    const unitText = mapping[unit] || unit
    return `iga ${value} ${unitText} tagant`
  }

  // Compute first and subsequent order totals including discounts and shipping
  const currencyCode = cart.region?.currency_code || ''
  const recurringDiscountPct = 5
  const firstOrderItemsTotal = (cart.items ?? []).reduce((sum: number, item: any) => {
    const base = (item.unit_price || 0) * (item.quantity || 1)
    if (item.metadata?.purchase_type === 'subscription' && item.metadata?.is_first_order === 'true') {
      const pct = parseFloat(item.metadata.subscription_discount || '0')
      return sum + base * (1 - pct / 100)
    }
    return sum + base
  }, 0)
  const nextOrdersItemsTotal = (cart.items ?? []).reduce((sum: number, item: any) => {
    const base = (item.unit_price || 0) * (item.quantity || 1)
    if (item.metadata?.purchase_type === 'subscription') {
      return sum + base * (1 - recurringDiscountPct / 100)
    }
    return sum + base
  }, 0)
  const shippingCost = cart.shipping_subtotal || 0
  const firstOrderTotal = firstOrderItemsTotal + shippingCost
  const nextOrdersTotal = nextOrdersItemsTotal + shippingCost

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await placeOrder()
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`${isOpen ? '' : 'opacity-75'} space-y-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOpen ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <ShoppingBag className="h-4 w-4" />
          </div>
          <h3 className="font-medium text-lg text-gray-900">Tellimuse ülevaatus</h3>
        </div>
      </div>
      
      {isOpen && previousStepsCompleted && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
          {/* Tooted */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-700" aria-hidden="true" /> Tooted
            </h4>
            <div className="divide-y divide-gray-200">
              {cart.items.map((item: any) => {
                const basePrice = (item.unit_price || 0) * (item.quantity || 1)
                const discountPct = item.metadata?.purchase_type === 'subscription'
                  ? (item.metadata?.is_first_order === 'true'
                      ? parseFloat(item.metadata.subscription_discount || '0')
                      : recurringDiscountPct)
                  : 0
                const discountAmount = basePrice * (discountPct / 100)
                return (
                  <div key={item.id} className="py-4 flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <Thumbnail
                        thumbnail={item.thumbnail}
                        images={item.variant?.product?.images}
                        size="square"
                        className="w-12 h-12 p-1 rounded-lg border border-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.product_title} ×{item.quantity}</p>
                        {item.variant?.title && (
                          <p className="text-sm text-gray-600 mt-1">{item.variant.title}</p>
                        )}
                        {item.metadata?.purchase_type === 'subscription' && (
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-500">{convertIntervalToText(item.metadata.interval)}</p>
                            <p className="text-sm text-gray-500">Järgmine arveldus: {getNextChargeDate(item.metadata.interval) || '–'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {discountAmount > 0 ? (
                        <>
                          <p className="text-sm line-through text-gray-500">
                            Hind: {convertToLocale({ amount: basePrice, currency_code: currencyCode })}
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            Hind: {convertToLocale({ amount: basePrice - discountAmount, currency_code: currencyCode })}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-900 font-medium">
                          Hind: {convertToLocale({ amount: basePrice, currency_code: currencyCode })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Üldinfo */}
          <div className="bg-white rounded-xl shadow-sm p-6 divide-y divide-gray-200 space-y-6">
            {/* Tarneteave */}
            <section className="pt-0 space-y-2">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-700" aria-hidden="true" /> Tarneteave
              </h4>
              <p className="text-sm text-gray-700">{cart.shipping_methods?.[0]?.name || '–'} aadressile {cart.shipping_address?.address_1}, {cart.shipping_address?.postal_code} {cart.shipping_address?.city}.</p>
              <p className="text-sm text-gray-700">Tarnetasu: {convertToLocale({ amount: shippingCost, currency_code: currencyCode })}</p>
            </section>
            {/* Makseviis */}
            <section className="py-6 space-y-2">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-700" aria-hidden="true" /> Makseviis
              </h4>
              <p className="text-sm text-gray-700">{paymentInfoMap[cart.payment_collection?.payment_sessions?.[0]?.provider_id]?.title || '–'}</p>
            </section>
            {/* Kasutajakonto */}
            <section className="py-6 space-y-2">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <ArrowPathMini className="h-5 w-5 text-gray-700" aria-hidden="true" /> Kasutajakonto
              </h4>
              <p className="text-sm text-gray-700">
                {customer
                  ? `Tellimus lisatakse sinu kontole ${customer.email}. Järgmine arveldus ja muu tellimuse haldus näed portaalis.`
                  : `Uus konto luuakse e-posti ${cart.email} alusel, kus saad muuta sagedust, makseviisi ja tarnet.`}
              </p>
            </section>
            {/* Kontakt */}
            <section className="pt-6 space-y-2">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <span role="img" aria-label="Telefon" className="h-5 w-5">📞</span> Küsimuste korral
              </h4>
              <p className="text-sm text-gray-700">Helista +372 1234 5678 (E–R 9–18)</p>
            </section>
          </div>

          {/* Kulud */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-semibold mb-4">Kulud</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center tabular-nums">
                <span className="flex items-center">
                  <span>Esimene tellimus</span>
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">30% soodustus</span>
                </span>
                <span className="font-semibold">{convertToLocale({ amount: firstOrderTotal, currency_code: currencyCode })}</span>
              </div>
              <div className="flex justify-between items-center tabular-nums">
                <span className="flex items-center">
                  <span>Järgnevad tellimused</span>
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">5% püsisoodustus</span>
                </span>
                <span className="font-semibold">{convertToLocale({ amount: nextOrdersTotal, currency_code: currencyCode })}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">Tellimust saab muuta või tühistada hiljem konto alt.</p>
          </div>

          {/* Confirm button */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <hr className="border-t border-gray-200 mb-4" />
            <WufiButton
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
              aria-label="Kinnita tellimus"
            >
              {isSubmitting ? 'Kinnitan...' : 'Kinnita tellimus'}
            </WufiButton>
            {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Review
