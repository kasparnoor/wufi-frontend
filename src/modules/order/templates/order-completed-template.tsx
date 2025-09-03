'use client'

import { Heading } from "@medusajs/ui"

import { CartTotals } from "@lib/components"
import Help from "@modules/account/components/help"
import Items from "@modules/account/components/items"
import OnboardingCta from "@modules/account/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/account/components/shipping-details"
import PaymentDetails from "@modules/account/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import { motion } from "framer-motion"
import { Sparkles, Share2, User, CheckCircle, ArrowRight, RotateCcw, ShoppingBag, Mail, Truck } from "lucide-react"
import SocialShareSuccess from "@modules/common/components/social-share-success"
import { convertToLocale } from "@lib/util/money"
import { convertIntervalToText } from "@lib/util/subscription-intervals"
import { LocalizedClientLink } from "@lib/components"
import { format } from "date-fns"
import { et } from "date-fns/locale"
import { useEffect } from "react"
import { trackPurchase, convertCartItemsToMetaPixel } from "@lib/util/meta-pixel"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {

  // Track purchase event when order is completed
  useEffect(() => {
    if (order && order.id) {
      // Convert order items to Meta Pixel format
      const metaPixelProducts = convertCartItemsToMetaPixel(order.items || [])
      
      trackPurchase({
        content_ids: (order.items || []).map(item => item.variant_id || item.id),
        contents: metaPixelProducts,
        currency: order.currency_code?.toUpperCase() || 'EUR',
        value: order.total / 100, // Convert from cents to euros
        num_items: order.items?.length || 0
      })
    }
  }, [order])

  // Check for subscription items
  const subscriptionItems = order.items?.filter(
    (item: any) => item.metadata?.purchase_type === 'subscription'
  ) || []

  const hasSubscriptionItems = subscriptionItems.length > 0
  const currencyCode = order.currency_code?.toUpperCase() || 'EUR'

  const formatPrice = (amount: number) => {
    return convertToLocale({ amount, currency_code: currencyCode })
  }

  const timelineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="h-14 w-14 text-green-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
            Tellimus kinnitatud!
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Täname teid usalduse eest. Oleme saatnud kinnituse teie e-posti aadressile.
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10 space-y-10 md:space-y-12">
          
          {/* Order Summary */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={timelineVariants}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-gray-600" />
              Tellimuse kokkuvõte #{order.display_id}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700 font-medium">Tellimuse summa:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700 font-medium">Toodete arv:</span>
                <span className="text-gray-900">
                  {order.items?.length || 0} toodet
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">Tarneaadress:</span>
              <p className="text-gray-900 mt-1">
                {order.shipping_address?.company && (
                  <>
                    <strong>{order.shipping_address.company}</strong><br/>
                  </>
                )}
                {(() => {
                  const shippingAddress = order.shipping_address
                  const metadata = shippingAddress?.metadata as any
                  
                  // Check if this is a pakiautomaat order
                  const isPakiautomaat = metadata?.is_pakiautomaat === 'true' || 
                                        metadata?.delivery_type === 'pakiautomaat'
                  
                  // If it's a pakiautomaat order, show the pakiautomaat info
                  if (isPakiautomaat) {
                    const pakiautomaarName = shippingAddress?.address_1 || 
                                            metadata?.pakiautomaat_name || 
                                            metadata?.pakiautomaat_location
                    
                    if (pakiautomaarName) {
                      return (
                        <>
                          📦 {pakiautomaarName}
                          <br/>
                          {shippingAddress?.postal_code} {shippingAddress?.city}
                        </>
                      )
                    }
                  }
                  
                  // For regular addresses or if pakiautomaat info is missing
                  if (shippingAddress?.address_1) {
                    return `${shippingAddress.address_1}, ${shippingAddress.postal_code} ${shippingAddress.city}`
                  }
                  
                  // Fallback if address_1 is empty
                  return `${shippingAddress?.postal_code || ''} ${shippingAddress?.city || ''}`.trim() || 'Aadress puudub'
                })()}
                {order.shipping_address?.metadata?.pickup_location && (
                  <>
                    <br/>Pakiautomaat: {order.shipping_address.metadata.pickup_location}
                  </>
                )}
              </p>
            </div>
          </motion.div>

          {/* Account & Subscription Information */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={timelineVariants}
              className="space-y-8 pt-8 border-t border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                Teie konto ja tellimuse staatus
              </h2>

              {/* Account Status */}
              <motion.div variants={itemVariants} className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800 text-lg mb-1">
                      Konto edukalt seadistatud
                    </h3>
                    <p className="text-base text-green-700">
                      Teie tellimus on seotud kontoga <strong>{order.email}</strong>.
                    </p>
                    
                    <LocalizedClientLink
                      href={`/account`}
                      className="text-sm font-medium text-green-800 hover:text-green-900 mt-3 inline-flex items-center gap-1 transition-colors"
                    >
                      Halda oma kontot
                      <ArrowRight className="h-4 w-4" />
                    </LocalizedClientLink>
                  </div>
                </div>
              </motion.div>


              {/* Conditional Subscription Information */}
              {hasSubscriptionItems ? (
                <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <RotateCcw className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-800 text-lg mb-1">
                        Püsitellimus aktiveeritud!
                      </h3>
                      <p className="text-base text-blue-700 mb-3">
                        Teie püsitellimus on edukalt lisatud teie kontole. Järgmised tooted tarnitakse automaatselt:
                      </p>

                      <ul className="space-y-2 mb-4">
                        {subscriptionItems.map((item: any, index: number) => (
                          <motion.li
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.3 }}
                            className="text-sm text-blue-700 flex items-center justify-between bg-blue-100/50 p-3 rounded-lg"
                          >
                            <span>• {item.title} ({item.quantity}x)</span>
                            <span className="font-medium text-blue-800">
                              {convertIntervalToText(item.metadata?.interval || '1m')}
                            </span>
                          </motion.li>
                        ))}
                      </ul>

                      <div className="bg-blue-100 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-blue-800 font-medium">
                           Järgmised tellimused 5% soodsamalt!
                        </p>
                        <p className="text-xs text-blue-700">
                          Saate oma kontost püsitellimust hallata (peatada, muuta, tühistada). Makseviis on turvaliselt salvestatud järgmiste tellimuste jaoks.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <ShoppingBag className="h-6 w-6 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        Ühekordne ost
                      </h3>
                      <p className="text-base text-gray-700">
                        See tellimus on ühekordne ost. Loodame, et teie lemmikloomale meeldib!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>


            {/* Timeline Section */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={timelineVariants}
              className="space-y-8 pt-8 border-t border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Mail className="h-6 w-6 text-purple-600" />
                Mis edasi?
              </h2>

              <div className="relative pl-6 md:pl-8">
                <div className="absolute left-3 md:left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>


                {/* Step 1 */}
                <motion.div variants={itemVariants} className="relative mb-8">
                  <div className="absolute left-3 md:left-4 top-0 flex items-center justify-center w-6 h-6 bg-purple-500 rounded-full -translate-x-1/2 ring-8 ring-white/50 z-10">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-6 md:ml-8">
                    <h3 className="font-semibold text-gray-900 text-lg">Tellimus vastu võetud</h3>
                    <p className="text-base text-gray-700 mt-1">
                      Teie tellimus on edukalt vastu võetud ja seda töödeldakse.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(order.created_at), "dd. MMMM yyyy HH:mm", { locale: et })}
                    </p>
                  </div>
                </motion.div>


                {/* Step 2 */}
                <motion.div variants={itemVariants} className="relative mb-8">
                  <div className="absolute left-3 md:left-4 top-0 flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full -translate-x-1/2 ring-8 ring-white/50 z-10">
                    <Sparkles className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="ml-6 md:ml-8">
                    <h3 className="font-semibold text-gray-900 text-lg">Tellimuse ettevalmistamine</h3>
                    <p className="text-base text-gray-700 mt-1">
                      Alustame teie toodete hoolikat pakkimist ja ettevalmistamist lähetamiseks.
                    </p>
                  </div>
                </motion.div>


                {/* Step 3 (Conditional) */}
                {hasSubscriptionItems && (
                  <motion.div variants={itemVariants} className="relative mb-8">
                    <div className="absolute left-3 md:left-4 top-0 flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full -translate-x-1/2 ring-8 ring-white/50 z-10">
                      <RotateCcw className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-6 md:ml-8">
                      <h3 className="font-semibold text-gray-900 text-lg">Püsitellimuse seadistamine</h3>
                      <p className="text-base text-gray-700 mt-1">
                        Teie püsitellimus on nüüd aktiivne ja järgmised tarned planeeritud.
                      </p>
                    </div>
                  </motion.div>
                )}


                {/* Step 4 */}
                <motion.div variants={itemVariants} className="relative">
                  <div className="absolute left-3 md:left-4 top-0 flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full -translate-x-1/2 ring-8 ring-white/50 z-10">
                    <Truck className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="ml-6 md:ml-8">
                    <h3 className="font-semibold text-gray-900 text-lg">Lähetatud ja kohaletoimetatud</h3>
                    <p className="text-base text-gray-700 mt-1">
                      Saadame teile teavituse, kui teie tellimus on teele pandud ja kohale toimetatud.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>


          {/* Action Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={timelineVariants}
            className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-100"
          >
            
            
            <LocalizedClientLink
              href="/pood"
              className="flex-1 bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors shadow-md hover:shadow-lg"
            >
              Jätka ostlemist
            </LocalizedClientLink>
          </motion.div>

          {/* Support & Social Share */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={timelineVariants}
            className="space-y-8 pt-8 border-t border-gray-100"
          >
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-3">Vajate abi või on küsimusi?</p>
              <LocalizedClientLink
                href="/klienditugi"
                className="text-lg font-semibold text-purple-600 hover:text-purple-800 transition-colors inline-flex items-center gap-2"
              >
                Võtke meiega ühendust
                <ArrowRight className="h-5 w-5" />
              </LocalizedClientLink>
            </div>

            {/* Social Share Section */}
            <SocialShareSuccess orderId={order.display_id} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}