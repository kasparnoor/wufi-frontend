"use client"

import { useState, ReactNode } from "react"
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
  LucideIcon,
  Settings,
  FileText,
  HelpCircle,
  MessageSquare
} from "lucide-react"
import { format } from "date-fns"
import { convertToLocale } from "@lib/util/money"
import { LocalizedClientLink, QuickActions, KrapsButton } from "@lib/components"
import { Thumbnail } from "@lib/components"

interface OrdersManagementProps {
  orders: HttpTypes.StoreOrder[]
}

const OrdersManagement = ({ orders }: OrdersManagementProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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
      metadata: { is_subscription: true, pet_name: 'Max', subscription_id: 'sub_1' }
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
    } as any,
    {
      id: 'order_3',
      display_id: 1003,
      status: 'shipped',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      total: 4599,
      currency_code: 'EUR',
      items: [
        {
          id: 'item_3',
          title: 'Premium Adult Dog Food',
          quantity: 1,
          thumbnail: null,
          variant: { product: { title: 'Premium Adult Dog Food' } }
        }
      ],
      metadata: { is_subscription: true, pet_name: 'Max', subscription_id: 'sub_1' }
    } as any
  ]

  const allOrders = orders?.length > 0 ? orders : mockOrders
  
  // Sort orders by creation date (newest first)
  const sortedOrders = [...allOrders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Filter orders based on search term
  const filteredOrders = sortedOrders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      order.display_id?.toString().includes(searchLower) ||
      order.metadata?.pet_name?.toString().toLowerCase().includes(searchLower) ||
      order.items?.some(item => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.variant?.product?.title?.toLowerCase().includes(searchLower)
      )
    )
  })

  const subscriptionOrders = allOrders.filter(order => order.metadata?.is_subscription === true)

  const handleDropdownAction = (action: string, orderId: string) => {
    setDropdownOpen(null)
    switch (action) {
      case 'contact-support':
        // Demo action - in real app this would open a support modal or redirect
        alert(`Saadetud toetusmeeskonnale tellimuse #${orderId} kohta. Vastame varsti!`)
        break
      case 'download-invoice':
        // Demo action - in real app this would download the invoice
        alert(`Arve #${orderId} allalaadimine algab kohe... (Demo režiim)`)
        break
      case 'reorder':
        // Demo action - in real app this would add items to cart
        alert(`Tellimus #${orderId} lisatud ostukorvi! (Demo režiim)`)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Kraps Styling */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 rounded-lg p-6 border border-yellow-200/50">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-2">
          Tellimuste ajalugu
        </h1>
        <p className="text-yellow-800">
          Kõik teie tellimused kronoloogilises järjekorras (uusimad eespool)
        </p>
      </div>

      {/* Search and Filter */}
      <KrapsCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-600 h-5 w-5" />
            <input
              type="text"
              placeholder="Otsi tellimuse numbri, lemmiklooma nime või toote järgi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div className="flex gap-2">
            <KrapsButton 
              variant="secondary" 
              size="small"
              className="bg-white hover:bg-yellow-50 border-yellow-300 hover:border-yellow-400 text-yellow-800"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Filtreeri kuupäev
            </KrapsButton>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-3 text-sm text-yellow-700">
            Leitud {filteredOrders.length} tellimu(s)t otsingule &quot;{searchTerm}&quot;
          </div>
        )}
      </KrapsCard>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <KrapsSectionTitle>
            {searchTerm ? `Otsingutulemused (${filteredOrders.length})` : `Kõik tellimused (${sortedOrders.length})`}
          </KrapsSectionTitle>
        </div>
        
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <KrapsOrderCard 
                key={order.id} 
                order={order} 
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                onDropdownAction={handleDropdownAction}
              />
            ))}
          </div>
        ) : searchTerm ? (
          <KrapsCard>
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-yellow-900 mb-2">Tulemusi ei leitud</h3>
              <p className="text-yellow-700 mb-4">
                Otsingule &quot;{searchTerm}&quot; ei leitud ühtegi tellimust
              </p>
              <KrapsButton 
                variant="secondary" 
                onClick={() => setSearchTerm("")}
                className="bg-white hover:bg-yellow-50 border-yellow-300 text-yellow-800"
              >
                Tühista otsing
              </KrapsButton>
            </div>
          </KrapsCard>
        ) : (
          <EmptyOrdersState />
        )}
      </div>

      {/* Kiired toimingud removed */}
    </div>
  )
}

// Updated components with Kraps styling
const KrapsCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg border border-yellow-200 p-4 sm:p-6 hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
)

const KrapsSectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-yellow-900 mb-2">{children}</h2>
)

const KrapsStatCard = ({ value, label, color = 'blue' }: { 
  value: string | number
  label: string
  color?: 'blue' | 'green' | 'success' | 'warning'
}) => {
  const colorClasses = {
    blue: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800'
  }

  return (
    <KrapsCard className="text-center">
      <div className={`w-8 h-8 rounded-full ${colorClasses[color]} flex items-center justify-center mx-auto mb-2`}>
        <span className="text-xs font-bold">{String.fromCharCode(8226)}</span>
      </div>
      <div className="text-2xl font-bold text-yellow-900">{value}</div>
      <div className="text-sm text-yellow-700">{label}</div>
    </KrapsCard>
  )
}

const KrapsOrderCard = ({ 
  order, 
  dropdownOpen, 
  setDropdownOpen, 
  onDropdownAction 
}: { 
  order: HttpTypes.StoreOrder
  dropdownOpen: string | null
  setDropdownOpen: (id: string | null) => void
  onDropdownAction: (action: string, orderId: string) => void
}) => {
  const isFromSubscription = order.metadata?.is_subscription === true
  const isDropdownOpen = dropdownOpen === order.id
  
  const getStatusInfo = (status: string): { 
    icon: LucideIcon, 
    color: string, 
    bg: string, 
    label: string 
  } => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { 
          icon: CheckCircle, 
          color: 'text-green-700', 
          bg: 'bg-green-100', 
          label: 'Tarnitud' 
        }
      case 'shipped':
        return { 
          icon: Truck, 
          color: 'text-blue-700', 
          bg: 'bg-blue-100', 
          label: 'Teel' 
        }
      case 'pending':
        return { 
          icon: Clock, 
          color: 'text-yellow-700', 
          bg: 'bg-yellow-100', 
          label: 'Ootel' 
        }
      default:
        return { 
          icon: Package, 
          color: 'text-yellow-700', 
          bg: 'bg-yellow-100', 
          label: 'Töötlemisel' 
        }
    }
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <KrapsCard className="hover:border-yellow-300">
      <div className="space-y-4">
        {/* Header with Order Info */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-yellow-900">
                Tellimus #{order.display_id}
              </h3>
              {isFromSubscription && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <RefreshCw className="h-3 w-3" />
                  Püsitellimus
                </span>
              )}
            </div>
            <p className="text-sm text-yellow-700">
              {format(new Date(order.created_at), 'dd.MM.yyyy')} • {order.metadata?.pet_name || 'Lemmikloomale'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 ${statusInfo.bg} rounded-full`}>
              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          {order.items?.map((item: any, index: number) => (
            <div key={item.id || index} className="flex items-center gap-3 py-2 border-t border-yellow-100 first:border-t-0 first:pt-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex-shrink-0">
                {item.thumbnail ? (
                  <Thumbnail thumbnail={item.thumbnail} size="square" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-yellow-600 text-xs">
                    IMG
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-yellow-900 truncate">
                  {item.title || item.variant?.product?.title}
                </h4>
                <p className="text-sm text-yellow-700">
                  Kogus: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Total and Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-yellow-100">
          <div>
            <p className="text-sm text-yellow-700">Kokku</p>
            <p className="text-lg font-semibold text-yellow-900">
              {convertToLocale({ amount: order.total, currency_code: order.currency_code })}
            </p>
          </div>
          
          <div className="flex gap-2 relative">
            {/* View Order Button */}
            <LocalizedClientLink href={`/konto/orders/details/${order.id}`}>
              <button className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors">
                <Eye className="h-4 w-4" />
              </button>
            </LocalizedClientLink>
            
            {/* Subscription Settings Button */}
            {isFromSubscription && (
              <LocalizedClientLink href="/konto/subscriptions">
                <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </LocalizedClientLink>
            )}
            
            {/* More Actions Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(isDropdownOpen ? null : order.id)}
                className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-yellow-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => onDropdownAction('contact-support', order.display_id?.toString() || order.id)}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-50 flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Võta ühendust toe kohta
                    </button>
                    <button
                      onClick={() => onDropdownAction('download-invoice', order.display_id?.toString() || order.id)}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-50 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Laadi alla arve
                    </button>
                    <button
                      onClick={() => onDropdownAction('reorder', order.display_id?.toString() || order.id)}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-50 flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Telli uuesti
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </KrapsCard>
  )
}

const EmptyOrdersState = () => {
  return (
    <KrapsCard>
      <div className="text-center py-8 sm:py-12">
        <div className="text-4xl sm:text-6xl mb-4">📦</div>
        <h3 className="text-lg sm:text-xl font-semibold text-yellow-900 mb-2">
          Tellimused puuduvad
        </h3>
        <p className="text-yellow-700 mb-6 max-w-md mx-auto">
          Teil pole veel ühtegi tellimust. Alustage ostlemist meie kauplusest!
        </p>
                        <LocalizedClientLink href="/pood">
          <KrapsButton variant="primary">
            Alusta ostlemist
          </KrapsButton>
        </LocalizedClientLink>
      </div>
    </KrapsCard>
  )
}

export default OrdersManagement 