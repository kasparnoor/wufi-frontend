"use client"

import { ShoppingBag, CreditCard, MapPin, Mail, Phone } from 'lucide-react'
import { convertToLocale } from '@lib/util/money'
import { useSearchParams } from "next/navigation"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertIntervalToText } from '@lib/util/subscription-intervals'
import CartTotals from "@modules/common/components/cart-totals"
import { isPakiautomaat } from "@lib/util/checkout-helpers"
import { useState } from 'react'
import { useStripe, useElements } from "@stripe/react-stripe-js"
import { PaymentElement } from "@stripe/react-stripe-js"
import PaymentButton from "@modules/checkout/components/payment-button"

const Review = ({ cart, customer }: { cart: any, customer: any }) => {
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  // Subscription items
  const subscriptionItems = (cart.items ?? []).filter(
    (item: any) => item.metadata?.purchase_type === 'subscription'
  )

  // Payment state
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Stripe hooks
  const stripe = useStripe()
  const elements = useElements()

  // Currency formatting
  const currencyCode = cart?.currency_code?.toUpperCase() || 'EUR'
  const formatPrice = (amount: number) => {
    return convertToLocale({ amount, currency_code: currencyCode })
  }

  // Show helpful message when not ready
  if (!isOpen) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Navigeerige tellimuse ülevaate sammule.</p>
      </div>
    )
  }

  if (!cart || !previousStepsCompleted) {
    return (
      <div className="space-y-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800">Tellimuse lõpuleviimiseks on vaja täita eelnevad sammud</h3>
        <div className="space-y-2 text-sm">
          {!cart?.shipping_address && <p className="text-yellow-700">• Tarneaadress puudub</p>}
          {!cart?.shipping_methods?.length && <p className="text-yellow-700">• Tarneviis pole valitud</p>}
          {!cart?.payment_collection && !paidByGiftcard && <p className="text-yellow-700">• Makseviis pole valitud</p>}
          {!cart?.email && <p className="text-yellow-700">• E-posti aadress puudub</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Main Layout: Single Column for Better Mobile Experience */}
      <div className="space-y-8">
        
        {/* Order Summary Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
              <ShoppingBag className="h-6 w-6" />
              Teie tellimus
            </h3>
            <p className="text-gray-600">Kontrollige oma tellimuse sisu</p>
          </div>
          
          <div className="space-y-6">
            {cart.items.map((item: any) => {
              const isSubscription = item.metadata?.purchase_type === 'subscription'
              const interval = item.metadata?.interval

              return (
                <div key={item.id} className="flex gap-4 pb-6 border-b last:border-b-0 last:pb-0">
                  <Thumbnail
                    thumbnail={item.thumbnail}
                    images={item.variant?.product?.images}
                    size="square"
                    className="w-20 h-20 flex-shrink-0 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{item.product_title}</h4>
                    {item.variant?.title && (
                      <p className="text-sm text-gray-600 mt-1">{item.variant.title}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-600">Kogus: {item.quantity}</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                    {isSubscription && interval && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          🔄 {convertIntervalToText(interval)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Total */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <CartTotals 
              totals={{
                currency_code: cart.currency_code,
                subtotal: cart.subtotal,
                discount_total: cart.discount_total,
                shipping_subtotal: cart.shipping_total || cart.shipping_subtotal, 
                tax_total: cart.tax_total,
                gift_card_total: cart.gift_card_total,
                total: cart.total,
              }}
              hasShippingMethod={!!(cart.shipping_methods && cart.shipping_methods.length > 0)}
              cart={cart}
            />
            
            {/* Subscription Info */}
            {subscriptionItems.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  📅 Püsitellimus aktiveerub peale esimest makset
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Järgmised tellimused 5% soodsamalt
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery & Contact Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
              <MapPin className="h-6 w-6" />
              Tarne ja kontakt
            </h3>
            <p className="text-gray-600">Teie tarneandmed ja kontaktinfo</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shipping */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tarneviis</h4>
              <p className="text-gray-700 mb-2">{cart.shipping_methods?.[0]?.name}</p>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{cart.shipping_address?.first_name} {cart.shipping_address?.last_name}</p>
                {isPakiautomaat(cart.shipping_methods?.[0]?.name) ? (
                  <p>📦 {cart.shipping_address?.address_1 || 'Pakiautomaat valimata'}, {cart.shipping_address?.postal_code} {cart.shipping_address?.city}</p>
                ) : (
                  <p>{cart.shipping_address?.address_1 || 'Aadress puudub'}, {cart.shipping_address?.postal_code} {cart.shipping_address?.city}</p>
                )}
              </div>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Kontaktandmed</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{cart.email}</span>
                </div>
                {(cart.shipping_address?.phone || cart.phone) && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {cart.shipping_address?.phone || cart.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
              <CreditCard className="h-6 w-6" />
              Makse
            </h3>
            <p className="text-gray-600">Sisestage oma makseandmed tellimuse lõpetamiseks</p>
          </div>
          
          {/* Error display */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          {/* Payment Element */}
          <div className="mb-8">
            <PaymentElement 
              options={{
                layout: "tabs",
                fields: {
                  billingDetails: "auto",
                },
              }}
            />
          </div>

          {/* Payment Button */}
          <PaymentButton
            cart={cart}
            data-testid="review-payment-button"
            className="w-full py-4 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          />

          {/* Security & Terms */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>SSL krüpteeritud</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Stripe&apos;i kaitstud</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>14-päevane tagastus</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 text-center">
              Tellimuse kinnitamisega nõustute meie{' '}
              <a href="/kasutustingimused" className="text-blue-600 hover:underline">
                tingimustega
              </a>{' '}
              ja{' '}
              <a href="/privaatsuspoliitika" className="text-blue-600 hover:underline">
                privaatsuspoliitikaga
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Review
