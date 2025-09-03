"use client"

import { useCustomerDashboardData } from "@lib/hooks/use-customer-dashboard"

import { Container } from "@medusajs/ui"
import { 
  Package, 
  RefreshCw, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  Heart,
  Plus,
  Settings,
  Eye,
  Info,
  X,
  ArrowRight,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle
} from "lucide-react"
import { format, parseISO, isPast, differenceInDays } from "date-fns"
import { et } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useState, useCallback, useMemo } from "react"
import { KrapsButton } from "../../../../lib/components"
import LocalizedClientLink from "../../../common/components/localized-client-link"
import { QuickActions } from "../../../common/components/quick-actions"
import PauseSubscriptionModal from "../pause-subscription-modal"

// ===== TYPES =====

interface DashboardProps {
  customer: any
}

interface Subscription {
  id: string
  items?: Array<{ product_title?: string }>
  interval?: string
  estimated_total?: number
  next_delivery?: string
  days_until_next?: number
}

interface QuickAction {
  action: string
  label: string
  count: number
}

interface DashboardStats {
  total_orders: number
  active_subscriptions: number
  paused_subscriptions: number
  total_spent: number
  member_since: string
  next_order: string | null
  overdue_orders: number
}

// ===== CONSTANTS =====

const ACTION_URLS: Record<string, string> = {
  profile: '/konto/profiil',
  pets: '/konto/lemmikloomad',
  subscriptions: '/konto/pusitellimused',
  orders: '/konto/tellimused',
  notifications: '/konto/teavitused',
  payment: '/konto/makseviis',
  addresses: '/konto/aadressid',
}

const ACTION_MESSAGES: Record<string, string> = {
  skip: 'Järgmine tarne edukalt vahele jäetud',
  pause: 'Tellimus edukalt peatatud',
  resume: 'Tellimus edukalt taasaktiveeritud',
  cancel: 'Tellimus edukalt tühistatud'
}

const ORDER_STATUS_MESSAGES: Record<string, string> = {
  pending: 'Ootel',
  processing: 'Töötlemisel',
  shipped: 'Saadetud',
  delivered: 'Kohale toimetatud',
  cancelled: 'Tühistatud',
  returned: 'Tagastatud'
}

// ===== COMPONENT =====

const Dashboard = ({ customer }: DashboardProps) => {
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null)
  

  
  const {
    dashboard,
    profile,
    pets,
    subscriptions,
    notifications,
    recentOrders,
    isLoading,
    error,
    updateSubscription,
    quickAction,
    updateNotifications,
    refetchDashboard
  } = useCustomerDashboardData()

  // ===== MEMOIZED VALUES =====

  const dashboardData = useMemo(() => {
    return dashboard || {
      account_stats: {
        total_orders: 0,
        active_subscriptions: 0,
        paused_subscriptions: 0,
        total_spent: 0,
        member_since: customer?.created_at || new Date().toISOString(),
        next_order: null,
        overdue_orders: 0
      },
      subscriptions: { active: [], paused: [], total_count: 0 },
      upcoming_deliveries: [],
      recent_orders: [],
      notifications: {
        overdue_count: 0,
        next_order_days: null,
        requires_attention: false,
        missing_pets: false,
        setup_incomplete: false
      }
    }
  }, [dashboard, customer?.created_at])

  const stats: DashboardStats = useMemo(() => dashboardData.account_stats, [dashboardData])
  
  const activeSubscriptions: Subscription[] = useMemo(() => 
    dashboardData.subscriptions?.active || [], [dashboardData]
  )
  
  const pausedSubscriptions: Subscription[] = useMemo(() => 
    dashboardData.subscriptions?.paused || [], [dashboardData]
  )
  
  const allNotifications = useMemo(() => notifications?.notifications || [], [notifications])
  const unreadCount = useMemo(() => notifications?.unread_count || 0, [notifications])
  const urgentCount = useMemo(() => notifications?.urgent_count || 0, [notifications])

  // ===== CALLBACK HANDLERS =====

  // Overview is read-only; no quick actions here
  const handlePauseSubscription = useCallback(() => {}, [])

  const handleQuickAction = useCallback(() => {}, [])

  const handleMarkNotificationsRead = useCallback(() => {
    updateNotifications.mutate({
      action: 'mark_all_read'
    })
  }, [updateNotifications])

  // ===== UTILITY FUNCTIONS =====

  const getActionUrl = useCallback((action: string): string => {
    return ACTION_URLS[action] || '/konto'
  }, [])

  const getActionIcon = useCallback((action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      profile: <Heart className="h-4 w-4" />,
      pets: <Heart className="h-4 w-4" />,
      subscriptions: <RefreshCw className="h-4 w-4" />,
      orders: <Package className="h-4 w-4" />,
      notifications: <Bell className="h-4 w-4" />,
      payment: <DollarSign className="h-4 w-4" />,
      addresses: <Settings className="h-4 w-4" />,
    }
    return iconMap[action] || <Settings className="h-4 w-4" />
  }, [])

  const getOrderStatusIcon = useCallback((status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <Clock className="h-4 w-4 text-yellow-500" />,
      processing: <RefreshCw className="h-4 w-4 text-blue-500" />,
      shipped: <Package className="h-4 w-4 text-purple-500" />,
      delivered: <CheckCircle className="h-4 w-4 text-green-500" />,
      cancelled: <XCircle className="h-4 w-4 text-red-500" />,
      returned: <X className="h-4 w-4 text-orange-500" />,
    }
    return iconMap[status] || <Clock className="h-4 w-4 text-gray-500" />
  }, [])

  const getOrderStatusText = useCallback((status: string): string => {
    return ORDER_STATUS_MESSAGES[status] || status
  }, [])

  const formatMemberSince = useMemo(() => {
    if (!stats.member_since) return ''
    return format(parseISO(stats.member_since), 'dd. MMMM yyyy', { locale: et })
  }, [stats.member_since])

  const formatNextOrderDays = useMemo(() => {
    if (!stats.next_order) return null
    return differenceInDays(parseISO(stats.next_order), new Date())
  }, [stats.next_order])

  // ===== RENDER CONDITIONS =====

  // Show authentication error
  if (!customer) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sisselogimist nõutav</h3>
            <p className="text-gray-600 mt-1">
              Armatuurlaua vaatamiseks peate sisse logima
            </p>
          </div>
          <KrapsButton onClick={() => window.location.href = '/konto'}>
            Logi sisse
          </KrapsButton>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Andmete laadimine ebaõnnestus</h3>
            <p className="text-gray-600 mt-1">
              {error.message?.includes('Authentication required') 
                ? 'Palun logige uuesti sisse' 
                : 'Proovige hiljem uuesti'}
            </p>
          </div>
          <KrapsButton 
            onClick={() => refetchDashboard()}
            disabled={isLoading}
          >
            Proovi uuesti
          </KrapsButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header with Kraps Styling */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 rounded-lg p-6 border border-yellow-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-2">
              Tere tulemast tagasi, {customer?.first_name || 'Kasutaja'}!
            </h1>
            <p className="text-yellow-800">
              Siin on teie konto ülevaade ja kiired toimingud.
            </p>
            {formatMemberSince && (
              <p className="text-sm text-yellow-700 mt-1">
                Liige alates: {formatMemberSince}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            {unreadCount > 0 && (
              <div className="relative">
                <button
                  onClick={handleMarkNotificationsRead}
                  className="p-2 bg-yellow-200 rounded-full hover:bg-yellow-300 transition-colors relative"
                  title="Märgi teatised loetuks"
                >
                  <Bell className="h-5 w-5 text-yellow-800" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-2xl font-bold shadow-sm flex-shrink-0">
              {customer?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {urgentCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Tähelepanu vajavad toimingud</h3>
              <p className="text-red-700 text-sm mt-1">
                Teil on {urgentCount} {urgentCount === 1 ? 'tähtis teatis' : 'tähtsaid teatisi'}, mis vajavad teie tähelepanu.
              </p>
            </div>
            <LocalizedClientLink 
              href="/konto/teavitused" 
              className="ml-auto text-red-600 hover:text-red-700 font-medium"
            >
              Vaata teatisi
            </LocalizedClientLink>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-lg border border-yellow-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tellimused kokku</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.total_orders}</p>
            </div>
            <Package className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg border border-yellow-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktiivsed tellimused</p>
              <p className="text-2xl font-bold text-green-600">{stats.active_subscriptions}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Removed: Total Spent and Next Order cards per request */}
      </div>

      {/* Aktiivsed püsitellimused (ülevaade, ainult loetav) */}
      {activeSubscriptions.length > 0 && (
        <div className="bg-white rounded-lg border border-yellow-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Aktiivsed püsitellimused
            </h2>
            <LocalizedClientLink 
              href="/konto/pusitellimused" 
              className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
            >
              Vaata kõiki
              <ArrowRight className="h-4 w-4" />
            </LocalizedClientLink>
          </div>

          <div className="space-y-4">
            {activeSubscriptions.map((subscription: Subscription) => (
              <LocalizedClientLink
                key={subscription.id}
                href={`/konto/pusitellimused?id=${subscription.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-gray-900">
                      {subscription.items?.[0]?.product_title || 'Tellimus'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-900">
                      €{subscription.estimated_total?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Järgmine: {subscription.next_delivery
                      ? format(parseISO(subscription.next_delivery), 'dd. MMMM', { locale: et })
                      : 'Pole määratud'}
                  </span>
                  {subscription.days_until_next && (
                    <span className="text-blue-600 font-medium">
                      ({subscription.days_until_next} päeva)
                    </span>
                  )}
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}

      {/* Peatatud püsitellimused (read-only) */}
      {pausedSubscriptions.length > 0 && (
        <div className="bg-white rounded-lg border border-yellow-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
              <PauseCircle className="h-5 w-5" />
              Peatatud püsitellimused
            </h2>
          </div>
          
          <div className="space-y-4">
            {pausedSubscriptions.map((subscription: Subscription) => (
              <LocalizedClientLink key={subscription.id} href={`/konto/pusitellimused?id=${subscription.id}`} className="block border border-orange-200 rounded-lg p-4 bg-orange-50 hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <PauseCircle className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold text-gray-900">
                        {subscription.items?.[0]?.product_title || 'Tellimus'}
                      </span>
                    </div>
                    <span className="text-sm text-orange-600 bg-orange-200 px-2 py-1 rounded">
                      Peatatud
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-900">
                      €{subscription.estimated_total?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Tellimus on ajutiselt peatatud</div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions removed for simpler ülevaade */}

      {/* Recent Orders */}
      {recentOrders?.orders && recentOrders.orders.length > 0 && (
        <div className="bg-white rounded-lg border border-yellow-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Viimased tellimused
            </h2>
            <LocalizedClientLink 
              href="/konto/tellimused" 
              className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
            >
              Vaata kõiki
              <ArrowRight className="h-4 w-4" />
            </LocalizedClientLink>
          </div>
          
          <div className="space-y-3">
            {recentOrders.orders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getOrderStatusIcon(order.status)}
                  <div>
                    <p className="font-medium text-gray-900">Tellimus #{order.display_id}</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(order.created_at), 'dd. MMMM yyyy', { locale: et })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-900">€{(order.total / 100).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{getOrderStatusText(order.status)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pause Subscription Modal */}
      {showPauseModal && selectedSubscriptionId && (
        <PauseSubscriptionModal
          isOpen={showPauseModal}
          onClose={() => {
            setShowPauseModal(false)
            setSelectedSubscriptionId(null)
          }}
          onPause={(weeks) => handlePauseSubscription(selectedSubscriptionId, weeks)}
        />
      )}
    </div>
  )
}

// ===== SKELETON COMPONENT =====

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gray-100 rounded-lg p-6 h-32"></div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 h-20"></div>
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="bg-gray-100 rounded-lg p-6 h-64"></div>
      <div className="bg-gray-100 rounded-lg p-6 h-48"></div>
    </div>
  )
}

export default Dashboard