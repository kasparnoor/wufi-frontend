import { Container } from "@medusajs/ui"

import ChevronDown from "@modules/common/icons/chevron-down"
import { LocalizedClientLink } from "@lib/components"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0

  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden small:block">
        {/* Welcome Header with Kraps Styling */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 rounded-lg p-6 mb-6 border border-yellow-200/50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-yellow-900 mb-1" data-testid="welcome-message" data-value={customer?.first_name}>
                Tere tulemast, {customer?.first_name}!
              </h1>
              <p className="text-yellow-800">
                Sisse logitud kui:{" "}
                <span
                  className="font-semibold"
                  data-testid="customer-email"
                  data-value={customer?.email}
                >
                  {customer?.email}
                </span>
              </p>
            </div>
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-2xl font-bold shadow-sm">
              {customer?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {/* Stats Cards with Kraps Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion */}
          <div className="bg-white rounded-lg border border-yellow-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-900">Profiil</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-sm font-bold">{profileCompletion}%</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="w-full bg-yellow-100 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-yellow-700">
              Profiil {profileCompletion}% täidetud
            </p>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-lg border border-yellow-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-900">Aadressid</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-lg font-bold" data-testid="addresses-count" data-value={addressCount}>
                  {addressCount}
                </span>
              </div>
            </div>
            <p className="text-sm text-yellow-700">
              {addressCount === 0 ? 'Aadresse pole salvestatud' : `${addressCount} salvestatud aadressi`}
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg border border-yellow-200 p-6 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-900">Tellimused</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-lg font-bold">
                  {orders?.length || 0}
                </span>
              </div>
            </div>
            <p className="text-sm text-yellow-700">
              {orders?.length === 0 ? 'Tellimusi pole' : `${orders?.length} tellimust kokku`}
            </p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-yellow-900">Viimased tellimused</h3>
            <LocalizedClientLink 
              href="/konto/tellimused"
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium hover:underline"
            >
              Vaata kõiki
            </LocalizedClientLink>
          </div>
          
          <ul className="space-y-4" data-testid="orders-wrapper">
            {orders && orders.length > 0 ? (
              orders.slice(0, 5).map((order) => {
                return (
                  <li
                    key={order.id}
                    data-testid="order-wrapper"
                    data-value={order.id}
                    className="border border-yellow-100 rounded-lg hover:border-yellow-300 transition-colors"
                  >
                    <LocalizedClientLink
                      href={`/konto/orders/details/${order.id}`}
                    >
                      <div className="p-4 hover:bg-yellow-50/50 rounded-lg transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-yellow-900 block mb-1">Tellimise kuupäev</span>
                            <span className="text-yellow-700" data-testid="order-created-date">
                              {new Date(order.created_at).toLocaleDateString('et-EE')}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-yellow-900 block mb-1">Tellimuse number</span>
                            <span className="text-yellow-700" data-testid="order-id" data-value={order.display_id}>
                              #{order.display_id}
                            </span>
                          </div>
                          <div className="md:text-right">
                            <span className="font-semibold text-yellow-900 block mb-1">Kogusumma</span>
                            <span className="text-yellow-700 font-semibold" data-testid="order-amount">
                              {convertToLocale({
                                amount: order.total,
                                currency_code: order.currency_code,
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <ChevronDown className="-rotate-90 text-yellow-600" />
                        </div>
                      </div>
                    </LocalizedClientLink>
                  </li>
                )
              })
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 text-2xl">📦</span>
                </div>
                <p className="text-yellow-700 font-medium" data-testid="no-orders-message">
                  Viimased tellimused puuduvad
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Alustage oma esimest tellimust meie poest
                </p>
                <LocalizedClientLink 
                  href="/pood"
                  className="inline-block mt-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Sirvi tooteid
                </LocalizedClientLink>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
