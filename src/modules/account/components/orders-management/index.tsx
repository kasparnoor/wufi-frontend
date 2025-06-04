"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { 
  Package, 
  Calendar, 
  RefreshCw, 
  Search, 
  Download,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Info,
  CheckCircle,
  Clock,
  Truck,
  LucideIcon
} from "lucide-react"
import { format } from "date-fns"
import { convertToLocale } from "@lib/util/money"
import { LocalizedClientLink } from "@lib/components"
import { Thumbnail } from "@lib/components"

interface OrdersManagementProps {
  orders: HttpTypes.StoreOrder[]
}

const OrdersManagement = ({ orders }: OrdersManagementProps) => {
  const [filterType, setFilterType] = useState<'all' | 'subscription' | 'one-time'>('all')
  
  // Mock data to demonstrate the approach
  const mockOrders: HttpTypes.StoreOrder[] = [
    {
      id: 'order_1',
      display_id: 1001,
      status: 'completed',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      total: 4599,
      currency_code: 'EUR',
      items: [
        {
          id: 'item_1',
          title: 'Premium Adult Dog Food',
          quantity: 1,
          thumbnail: null,
          variant: { product: { title: 'Premium Adult Dog Food' } }
        }
      ],
      metadata: { is_subscription: true, pet_name: 'Max' }
    } as any,
    {
      id: 'order_2', 
      display_id: 1002,
      status: 'pending',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      total: 2499,
      currency_code: 'EUR',
      items: [
        {
          id: 'item_2',
          title: 'Dog Treats Variety Pack',
          quantity: 2,
          thumbnail: null,
          variant: { product: { title: 'Dog Treats Variety Pack' } }
        }
      ],
      metadata: { is_subscription: false, pet_name: 'Max' }
    } as any
  ]

  const allOrders = orders?.length > 0 ? orders : mockOrders
  
  const filteredOrders = allOrders.filter(order => {
    switch (filterType) {
      case 'subscription':
        return order.metadata?.is_subscription === true
      case 'one-time':
        return order.metadata?.is_subscription !== true
      default:
        return true
    }
  })

  const subscriptionOrders = allOrders.filter(order => order.metadata?.is_subscription === true)
  const oneTimeOrders = allOrders.filter(order => order.metadata?.is_subscription !== true)

  return (
    <div className="space-y-6">
      {/* Demo Notice - Clean Style */}
      <CleanDemoNotice />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Max'i tellimused 📦
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Vaadake oma tellimuste ajalugu ja jälgige tarne staatust
        </p>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <CleanSectionTitle>Ülevaade</CleanSectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MobileStatCard 
            value={allOrders.length}
            label="Tellimust kokku"
          />
          <MobileStatCard 
            value={subscriptionOrders.length}
            label="Püsitellimused"
            color="green"
          />
          <MobileStatCard 
            value={oneTimeOrders.length}
            label="Ühekordsed tellimused"
            color="blue"
          />
        </div>
      </div>

      {/* Filter Tabs - Mobile optimized */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <MobileFilterButton
          active={filterType === 'all'}
          onClick={() => setFilterType('all')}
          color="gray"
        >
          Kõik tellimused ({allOrders.length})
        </MobileFilterButton>
        <MobileFilterButton
          active={filterType === 'subscription'}
          onClick={() => setFilterType('subscription')}
          color="green"
        >
          Püsitellimused ({subscriptionOrders.length})
        </MobileFilterButton>
        <MobileFilterButton
          active={filterType === 'one-time'}
          onClick={() => setFilterType('one-time')}
          color="purple"
        >
          Ühekordsed ({oneTimeOrders.length})
        </MobileFilterButton>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <CleanSectionTitle>Tellimused</CleanSectionTitle>
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <MobilePetOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyOrdersState filterType={filterType} />
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <CleanSectionTitle>Kiired toimingud</CleanSectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MobileQuickActionTile 
            icon={<Package className="h-5 w-5" />}
            title="Korda tellimust"
            description="Telli uuesti"
          />
          <MobileQuickActionTile 
            icon={<RefreshCw className="h-5 w-5" />}
            title="Alusta püsitellimust"
            description="Automaatsed tarned"
          />
          <MobileQuickActionTile 
            icon={<Download className="h-5 w-5" />}
            title="Laadi alla arved"
            description="PDF failid"
          />
          <MobileQuickActionTile 
            icon={<RotateCcw className="h-5 w-5" />}
            title="Tagasta tellimus"
            description="14 päeva tagastus"
          />
        </div>
      </div>
    </div>
  )
}

// Standardized Clean Components (No Gray Backgrounds)

const CleanDemoNotice = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center gap-2">
      <Info className="h-5 w-5 text-blue-600" />
      <span className="text-blue-800 text-sm">
        <strong>Demo:</strong> Näidisandmed kuni süsteem valmis saab
      </span>
    </div>
  </div>
)

const CleanCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-4 sm:p-6 ${className}`}>
    {children}
  </div>
)

const CleanSectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>
)

const MobileStatCard = ({ value, label, color = 'gray' }: { 
  value: string | number
  label: string
  color?: 'gray' | 'green' | 'blue'
}) => {
  const colorClasses: Record<string, string> = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    blue: 'text-blue-600',
  }

  return (
    <CleanCard>
      <div className="text-center">
        <div className={`text-xl sm:text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
        <div className="text-xs sm:text-sm text-gray-600">{label}</div>
      </div>
    </CleanCard>
  )
}

const MobileFilterButton = ({ 
  active, 
  onClick, 
  children, 
  color = 'gray' 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode
  color?: 'gray' | 'green' | 'purple'
}) => {
  const activeClasses: Record<string, string> = {
    gray: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    purple: 'bg-purple-600 text-white',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full sm:w-auto px-4 py-3 rounded-lg font-medium transition-colors text-sm touch-manipulation ${
        active
          ? activeClasses[color]
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

// Mobile Pet Order Card with responsive design
const MobilePetOrderCard = ({ order }: { order: HttpTypes.StoreOrder }) => {
  const orderDate = new Date(order.created_at)
  
  const getStatusInfo = (status: string): { 
    icon: LucideIcon, 
    color: string, 
    bg: string, 
    label: string 
  } => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-700',
          bg: 'bg-green-100',
          label: 'Lõpetatud'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-800',
          bg: 'bg-yellow-100',
          label: 'Ootel'
        }
      case 'shipped':
        return {
          icon: Truck,
          color: 'text-blue-700',
          bg: 'bg-blue-100',
          label: 'Saadetud'
        }
      default:
        return {
          icon: Package,
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          label: 'Tundmatu'
        }
    }
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <CleanCard className="hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl">
              {order.metadata?.is_subscription ? '🔄' : '📦'}
            </div>
            <div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tellimus #{order.display_id}
                </h3>
                {order.metadata?.is_subscription && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full w-fit">
                    Püsitellimus
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {format(orderDate, 'dd. MMMM yyyy')} • {order.metadata?.pet_name || 'Max'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
            </div>
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Order Items - Mobile optimized */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {item.thumbnail ? (
                      <Thumbnail thumbnail={item.thumbnail} images={[]} size="small" />
                    ) : (
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {item.title || item.variant?.product?.title || 'Toode'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Kogus: {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total and Actions - Mobile optimized */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pt-4 border-t">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </span>
            <span className="text-sm text-gray-600 ml-2">
              ({order.items?.length || 0} toode{(order.items?.length || 0) > 1 ? 't' : ''})
            </span>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
              <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-manipulation">
                <Eye className="h-4 w-4" />
                Vaata tellimust
              </button>
            </LocalizedClientLink>
            
            {order.status === 'completed' && (
              <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-manipulation">
                <RefreshCw className="h-4 w-4" />
                Telli uuesti
              </button>
            )}
          </div>
        </div>
      </div>
    </CleanCard>
  )
}

// Mobile Quick Action Tile with responsive design
const MobileQuickActionTile = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) => {
  return (
    <CleanCard className="hover:shadow-md transition-shadow cursor-pointer touch-manipulation">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="text-blue-600">{icon}</div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </CleanCard>
  )
}

// Empty Orders State with better Estonian
const EmptyOrdersState = ({ filterType }: { filterType: string }) => {
  const getEmptyStateContent = () => {
    switch (filterType) {
      case 'subscription':
        return {
          icon: '🔄',
          title: 'Püsitellimusi pole',
          description: 'Teil pole veel ühtegi püsitellimust. Alustage regulaarsete tarnetega!',
          buttonText: 'Alusta püsitellimust',
          href: '/products'
        }
      case 'one-time':
        return {
          icon: '📦',
          title: 'Ühekordseid tellimusi pole',
          description: 'Teil pole veel ühekordseid tellimusi.',
          buttonText: 'Telli midagi',
          href: '/products'
        }
      default:
        return {
          icon: '📦',
          title: 'Tellimusi pole',
          description: 'Teil pole veel ühtegi tellimust. Alustage oma esimese tellimusega!',
          buttonText: 'Alusta ostlemist',
          href: '/products'
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <CleanCard>
      <div className="text-center py-8 sm:py-12">
        <div className="text-4xl sm:text-6xl mb-4">{content.icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {content.description}
        </p>
        <LocalizedClientLink href={content.href}>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            {content.buttonText}
          </button>
        </LocalizedClientLink>
      </div>
    </CleanCard>
  )
}

export default OrdersManagement 