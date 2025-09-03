'use client'

import { retrieveOrder } from "@lib/data/orders"
import { retrieveCustomer } from "@lib/data/customer"
import { Sparkles, Share2, User, CheckCircle, ArrowRight, RotateCcw, ShoppingBag, Mail, Truck } from "lucide-react"
import SocialShareSuccess from "@modules/common/components/social-share-success"
import { convertToLocale } from "@lib/util/money"
import { convertIntervalToText } from "@lib/util/subscription-intervals"
import { LocalizedClientLink } from "@lib/components"
import { notFound, redirect } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { et } from "date-fns/locale"

// Helper to determine if customer is new (heuristic)
const isNewCustomer = (customer: any) => {
  // This is a simple heuristic. In a real system, you might have a flag
  // set during registration or a more robust check.
  if (!customer || !customer.created_at || !customer.updated_at) return false;
  const createdAt = new Date(customer.created_at);
  const updatedAt = new Date(customer.updated_at);
  // If created and updated timestamps are very close, assume new
  return Math.abs(createdAt.getTime() - updatedAt.getTime()) < 5000; // 5 seconds
}

export default async function CheckoutSuccessContent({
  searchParams,
}: {
  searchParams: { payment_intent?: string; payment_intent_client_secret?: string }
}) {
  const clientSecret = searchParams.payment_intent_client_secret

  if (!clientSecret) {
    return notFound()
  }

  let order
  try {
    order = await retrieveOrder(clientSecret)
  } catch (error) {
    console.error("Failed to retrieve order:", error)
    return notFound()
  }

  const customer = await retrieveCustomer()
  const newCustomer = isNewCustomer(customer)

  if (!order || !customer) {
    redirect("/") // Redirect if order or customer not found
  }

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
                {order.shipping_address?.address_1}, {order.shipping_address?.postal_code} {order.shipping_address?.city}
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
                      Tellimus edukalt loodud
                    </h3>
                    <p className="text-base text-green-700">
                      Teie tellimus on seotud e-posti aadressiga <strong>{customer.email}</strong>.
                    </p>
                    {newCustomer && (
                      <p className="text-sm text-green-700 mt-2">
                        Saate igal ajal luua konto kraps.ee-s sama e-posti aadressiga, et hallata oma tellimusi veebis.
                      </p>
                    )}
                    <LocalizedClientLink
                      href={`/konto`}
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


            

          

          {/* Action Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={timelineVariants}
            className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-100"
          >
            <LocalizedClientLink
              href={`/konto/orders/${order.id}`}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              Vaata tellimuse detaile
              <ArrowRight className="h-4 w-4" />
            </LocalizedClientLink>
            
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
