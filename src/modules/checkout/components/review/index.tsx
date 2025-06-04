"use client"

import { ShoppingBag, Clock, CreditCard, RotateCcw, CheckCircle, Phone, Mail, MapPin, Shield } from 'lucide-react'
import { convertToLocale } from '@lib/util/money'
import { paymentInfoMap } from '@lib/constants'
import { placeOrder } from '@lib/data/cart'
import { useState } from 'react'
import { useSearchParams } from "next/navigation"
import { WufiButton } from "@lib/components"
import { Thumbnail } from "@lib/components"
import { convertIntervalToText } from '@lib/util/subscription-intervals'

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

  if (!isOpen || !previousStepsCompleted) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Valmis tellimiseks!</h2>
        <p className="text-lg text-gray-600">Kontrollige andmeid ja kinnitage tellimus</p>
      </div>

      {/* Order Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-yellow-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Teie tellimus</h3>
          </div>
          
          <div className="space-y-4">
            {cart.items.map((item: any) => {
              const basePrice = (item.unit_price || 0) * (item.quantity || 1)
              const discountPct = item.metadata?.purchase_type === 'subscription'
                ? (item.metadata?.is_first_order === 'true'
                    ? parseFloat(item.metadata.subscription_discount || '0')
                    : recurringDiscountPct)
                : 0
              const discountAmount = basePrice * (discountPct / 100)
              return (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Thumbnail
                    thumbnail={item.thumbnail}
                    images={item.variant?.product?.images}
                    size="square"
                    className="w-16 h-16 rounded-lg border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {item.product_title}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {item.variant?.title && <p>{item.variant.title}</p>}
                      <p>Kogus: {item.quantity}</p>
                      {item.metadata?.purchase_type === 'subscription' && (
                        <>
                          <p className="text-yellow-700 font-medium">
                            📅 {convertIntervalToText(item.metadata.interval)}
                          </p>
                          <p>Järgmine: {getNextChargeDate(item.metadata.interval) || '–'}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {discountAmount > 0 ? (
                      <>
                        <p className="text-sm line-through text-gray-400">
                          {convertToLocale({ amount: basePrice, currency_code: currencyCode })}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {convertToLocale({ amount: basePrice - discountAmount, currency_code: currencyCode })}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">
                        {convertToLocale({ amount: basePrice, currency_code: currencyCode })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Delivery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tarneinfo</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tarneviis:</span>
                <span className="font-medium">{cart.shipping_methods?.[0]?.name || '–'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aadress:</span>
                <span className="font-medium text-right">
                  {cart.shipping_address?.address_1}<br />
                  {cart.shipping_address?.postal_code} {cart.shipping_address?.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarnetasu:</span>
                <span className="font-medium">
                  {convertToLocale({ amount: shippingCost, currency_code: currencyCode })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Makseinfo</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Makseviis:</span>
                <span className="font-medium">
                  {paymentInfoMap[cart.payment_collection?.payment_sessions?.[0]?.provider_id]?.title || '–'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="h-4 w-4" />
                <span className="text-xs">SSL turvaline krüpteering</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Kontakt</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">E-post:</span>
                <span className="font-medium">{cart.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telefon:</span>
                <span className="font-medium">{cart.shipping_address?.phone || '–'}</span>
              </div>
              {customer ? (
                <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                  ✅ Tellimus lisatakse teie kontole
                </p>
              ) : (
                <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                  ℹ️ Loome teile uue konto e-posti {cart.email} alusel
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Total */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Kokku maksta</h3>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow-800">
              {convertToLocale({ amount: cart.total, currency_code: currencyCode })}
            </p>
            {subscriptionItems.length > 0 && (
              <p className="text-sm text-gray-600">
                Järgmised tellimused: {convertToLocale({ amount: nextOrdersTotal, currency_code: currencyCode })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 pt-6 border-t border-gray-200">
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}
        
        <WufiButton
          variant="primary"
          size="large"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full py-4 text-lg font-bold"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Tellimuse esitamine...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Kinnita tellimus
            </>
          )}
        </WufiButton>

        <div className="text-center text-sm text-gray-600">
          <p>Tellimuse kinnitamisega nõustute meie <a href="/tingimused" className="text-yellow-700 hover:underline">tingimustega</a></p>
        </div>
      </div>
    </div>
  )
}

export default Review
