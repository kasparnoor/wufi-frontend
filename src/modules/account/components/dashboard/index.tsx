"use client"

import { useQuery } from "@tanstack/react-query"
import { retrieveCustomerDashboard } from "@lib/data/customer"
import { DashboardData, NotificationData, QuickAction, OrderInfo, Pet, OrderSummary, SubscriptionSummary } from "../../../../types/customer"
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
  X
} from "lucide-react"
import { format } from "date-fns"
import { LocalizedClientLink } from "@lib/components"
import { convertToLocale } from "@lib/util/money"
import { useState } from "react"

interface DashboardProps {
  customer: any
}

const Dashboard = ({ customer }: DashboardProps) => {
  const [showPauseModal, setShowPauseModal] = useState(false)

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: retrieveCustomerDashboard,
    enabled: !!customer,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const handlePauseSubscription = (weeks: number) => {
    console.log(`Pausing subscription for ${weeks} weeks`)
    alert(`Tellimus peatatud ${weeks} ${weeks === 1 ? 'nädalaks' : 'nädalaks'}. Saate selle igal ajal taasaktiveerida.`)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Simplified mock data focused on order placement rather than delivery predictions
  if (error || !dashboardData) {
    const mockDashboard: DashboardData = {
      customer: {
        id: customer?.id || 'mock_id',
        email: customer?.email || 'kasutaja@example.com',
        first_name: customer?.first_name || 'Kasutaja',
        last_name: customer?.last_name || 'Test',
        pets: [
          { 
            name: 'Max', 
            type: 'dog', 
            breed: 'Labrador', 
            age: 3,
            food_type: 'Premium Adult Dog Food',
            next_order: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      account_stats: {
        total_orders: 8,
        active_subscriptions: 1,
        paused_subscriptions: 0,
        total_spent: 245.60,
        member_since: '2023-01-15',
        next_order: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        overdue_orders: 0
      },
      notifications: {
        overdue_count: 0,
        next_order_days: 25,
        requires_attention: false,
        missing_pets: false,
        setup_incomplete: false
      },
      quick_actions: [],
      upcoming_deliveries: [
        {
          id: 'mock_order_1',
          status: 'scheduled',
          next_order: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          days_until_next: 25
        }
      ],
      recent_orders: [],
      subscriptions: {
        active: [
          {
            id: 'mock_sub_1',
            status: 'active',
            next_delivery: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            interval: 'Iga 4 nädala tagant',
            days_until_next: 25,
            is_overdue: false,
            items: [{ variant_id: 'var_1', quantity: 1, unit_price: 45.99 }],
            total_items: 1,
            estimated_total: 45.99,
            can_modify: true
          }
        ],
        paused: [],
        total_count: 1
      }
    }

    const dashboard = mockDashboard
    const nextOrder = dashboard.subscriptions.active[0]
    const daysUntilNextOrder = nextOrder?.days_until_next || 0

    return (
      <div className="space-y-6">
        {/* Demo Notice - Clean Style */}
        <CleanDemoNotice />

        {/* Mobile-Optimized Hero Section - Next Order */}
        {nextOrder && (
          <CleanCard>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">🐕</div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    {dashboard.customer.pets[0]?.name || 'Teie lemmiklooma'} järgmine tellimus
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-4 mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
                      {daysUntilNextOrder} päeva
                    </span>
                    <span className="text-sm text-gray-600">
                      ({format(new Date(nextOrder.next_delivery), 'dd. MMM')})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tarne aeg sõltub lao olukorrast ja tarneviisist
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 sm:flex-row w-full sm:w-auto">
                <MobilePrimaryButton href="/account/subscriptions">
                  Halda tellimust
                </MobilePrimaryButton>
                <MobileSecondaryButton href="/account/orders">
                  Vaata ajalugu
                </MobileSecondaryButton>
              </div>
            </div>
          </CleanCard>
        )}

        {/* Mobile-First Layout */}
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {/* Pet Subscription Cards - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-4">
            <CleanSectionTitle>Lemmikloomade tellimused</CleanSectionTitle>
            
            {dashboard.customer.pets.length > 0 ? (
              <div className="space-y-3">
                {dashboard.customer.pets.map((pet: Pet, index: number) => (
                  <MobilePetSubscriptionCard 
                    key={index} 
                    pet={pet} 
                    subscription={dashboard.subscriptions.active[0]}
                    onPauseSubscription={() => setShowPauseModal(true)}
                  />
                ))}
              </div>
            ) : (
              <CleanCard>
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl mb-2">🐾</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lisage oma esimene lemmikloom</h3>
                  <p className="text-sm text-gray-600 mb-4 px-4">Alustage lemmiklooma toidu tellimusega</p>
                  <MobilePrimaryButton href="/products">Vaata tooteid</MobilePrimaryButton>
                </div>
              </CleanCard>
            )}
          </div>

          {/* Mobile Stats and Actions - Full width on mobile, 1/3 on desktop */}
          <div className="space-y-4">
            {/* Mobile-Optimized Stats */}
            <CleanCard>
              <h3 className="font-semibold text-gray-900 mb-3">Ülevaade</h3>
              <div className="grid grid-cols-3 gap-4 sm:space-y-0 lg:grid-cols-1 lg:space-y-3">
                <div className="text-center lg:flex lg:justify-between lg:text-left">
                  <span className="text-xs sm:text-sm text-gray-600 block lg:inline">Aktiivseid tellimusi</span>
                  <span className="font-semibold text-green-600 text-lg lg:text-base">{dashboard.account_stats.active_subscriptions}</span>
                </div>
                <div className="text-center lg:flex lg:justify-between lg:text-left">
                  <span className="text-xs sm:text-sm text-gray-600 block lg:inline">Tellimusi kokku</span>
                  <span className="font-semibold text-lg lg:text-base">{dashboard.account_stats.total_orders}</span>
                </div>
                <div className="text-center lg:flex lg:justify-between lg:text-left">
                  <span className="text-xs sm:text-sm text-gray-600 block lg:inline">Liige alates</span>
                  <span className="font-semibold text-lg lg:text-base">{format(new Date(dashboard.account_stats.member_since), 'yyyy')}</span>
                </div>
              </div>
            </CleanCard>

            {/* Mobile-Optimized Quick Actions */}
            <CleanCard>
              <h3 className="font-semibold text-gray-900 mb-3">Kiired toimingud</h3>
              <div className="grid grid-cols-2 gap-2 sm:space-y-0 lg:grid-cols-1 lg:space-y-2">
                <MobileActionButton 
                  icon={<Calendar className="h-4 w-4" />}
                  label="Muuda tellimust"
                  href="/account/subscriptions"
                />
                <MobileActionButton 
                  icon={<RefreshCw className="h-4 w-4" />}
                  label="Peata ajutiselt"
                  href="/account/subscriptions"
                />
                <MobileActionButton 
                  icon={<Plus className="h-4 w-4" />}
                  label="Lisa lemmikloom"
                  href="/account/pets"
                />
                <MobileActionButton 
                  icon={<Package className="h-4 w-4" />}
                  label="Tellimuste ajalugu"
                  href="/account/orders"
                />
              </div>
            </CleanCard>
          </div>
        </div>

        {/* Add the modal at the end of the component */}
        <PauseSubscriptionModal
          isOpen={showPauseModal}
          onClose={() => setShowPauseModal(false)}
          onPause={handlePauseSubscription}
        />
      </div>
    )
  }

  const dashboard = dashboardData as DashboardData
  // Use real data with same structure
  return <div>Real data dashboard would follow same UX pattern</div>
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

const MobilePrimaryButton = ({ href, children, onClick }: { 
  href?: string
  children: React.ReactNode
  onClick?: () => void 
}) => {
  const buttonClasses = "w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation"
  
  if (href) {
    return (
      <LocalizedClientLink href={href}>
        <button className={buttonClasses}>
          {children}
        </button>
      </LocalizedClientLink>
    )
  }
  
  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  )
}

const MobileSecondaryButton = ({ href, children, onClick }: { 
  href?: string
  children: React.ReactNode
  onClick?: () => void 
}) => {
  const buttonClasses = "w-full sm:w-auto px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation"
  
  if (href) {
    return (
      <LocalizedClientLink href={href}>
        <button className={buttonClasses}>
          {children}
        </button>
      </LocalizedClientLink>
    )
  }
  
  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  )
}

const MobileActionButton = ({ 
  icon, 
  label, 
  href 
}: { 
  icon: React.ReactNode
  label: string
  href: string 
}) => {
  return (
    <LocalizedClientLink href={href}>
      <button className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors touch-manipulation lg:p-2">
        <div className="text-blue-600 flex-shrink-0">{icon}</div>
        <span className="text-sm text-gray-700 truncate">{label}</span>
      </button>
    </LocalizedClientLink>
  )
}

// Mobile-Optimized Pet Subscription Card
const MobilePetSubscriptionCard = ({ 
  pet, 
  subscription, 
  onPauseSubscription 
}: { 
  pet: Pet
  subscription?: SubscriptionSummary
  onPauseSubscription: () => void
}) => {
  if (!subscription) {
    return (
      <CleanCard>
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐱' : '🐾'}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{pet.name}</h4>
              <p className="text-sm text-gray-600">{pet.breed} • {pet.age} aastat</p>
            </div>
          </div>
          <MobilePrimaryButton href="/products">Lisa tellimus</MobilePrimaryButton>
        </div>
      </CleanCard>
    )
  }

  const nextOrderDate = new Date(subscription.next_delivery)
  const daysUntil = Math.ceil((nextOrderDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <CleanCard>
      <div className="space-y-3">
        {/* Pet Header with Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐱' : '🐾'}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{pet.name}</h4>
              <p className="text-sm text-gray-600">{pet.breed} • {pet.age} aastat</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-green-700">Aktiivne</span>
          </div>
        </div>

        {/* Order Info - Stacked on mobile, grid on larger screens */}
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Järgmine tellimus</p>
            <p className="font-semibold text-gray-900">
              {daysUntil > 0 ? `${daysUntil} päeva` : 'Täna'}
            </p>
            <p className="text-xs text-gray-500">
              {format(nextOrderDate, 'dd. MMM yyyy')}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Summa</p>
            <p className="font-semibold text-gray-900">€{subscription.estimated_total.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{subscription.interval}</p>
          </div>
        </div>

        {/* Action Buttons - Full width on mobile */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <MobilePrimaryButton href={`/account/subscriptions/${subscription.id}`}>
            Halda tellimust
          </MobilePrimaryButton>
          <MobileSecondaryButton 
            onClick={onPauseSubscription}
          >
            Peata ajutiselt
          </MobileSecondaryButton>
        </div>
      </div>
    </CleanCard>
  )
}

// Component: Notification Bar
const NotificationBar = ({ notifications }: { notifications: NotificationData }) => {
  if (notifications.overdue_count > 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Tähelepanu!</p>
              <p className="text-red-700">
                Teil on {notifications.overdue_count} tähtaja ületanud tellimus{notifications.overdue_count > 1 ? 't' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Component: Stats Card
const StatsCard = ({ title, value, icon: Icon, color }: { 
  title: string
  value: string | number
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  }

  return (
    <Container className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Container>
  )
}

// Component: Quick Action Button
const QuickActionButton = ({ action }: { action: QuickAction }) => {
  const getActionLink = (actionType: string) => {
    switch (actionType) {
      case 'manage_subscriptions':
        return '/account/subscriptions'
      case 'view_orders':
        return '/account/orders'
      case 'manage_pets':
        return '/account/pets'
      default:
        return '/account'
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'manage_subscriptions':
        return <RefreshCw className="h-8 w-8" />
      case 'view_orders':
        return <Package className="h-8 w-8" />
      case 'manage_pets':
        return <Heart className="h-8 w-8" />
      default:
        return <Settings className="h-8 w-8" />
    }
  }

  return (
    <LocalizedClientLink href={getActionLink(action.action)}>
      <Container className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="text-center space-y-4">
          <div className="p-4 bg-gray-100 group-hover:bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto transition-colors">
            <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
              {getActionIcon(action.action)}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {action.label}
            </h3>
            {action.count > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {action.count} tk
              </p>
            )}
          </div>
        </div>
      </Container>
    </LocalizedClientLink>
  )
}

// Component: Subscription Card
const SubscriptionCard = ({ subscription }: { subscription: SubscriptionSummary }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            subscription.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="font-medium text-sm">{subscription.status.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Järgmine tellimus:</span>
          <span className={`ml-2 ${subscription.is_overdue ? 'text-red-600 font-medium' : ''}`}>
            {format(new Date(subscription.next_delivery), 'dd.MM.yyyy')}
            {subscription.is_overdue && " (TÄHTAEG ÜLETATUD)"}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Sagedus:</span>
          <span className="ml-2">{subscription.interval}</span>
        </div>
        <div>
          <span className="text-gray-600">Tooteid:</span>
          <span className="ml-2">{subscription.total_items} tk</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">€{subscription.estimated_total.toFixed(2)}</span>
          <LocalizedClientLink href={`/account/subscriptions/${subscription.id}`}>
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Halda →
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

// Component: Dashboard Skeleton
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// Component: Dashboard Error
const DashboardError = () => {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Viga andmete laadimisel
      </h3>
      <p className="text-gray-600">
        Palun proovige hiljem uuesti või võtke meiega ühendust.
      </p>
    </div>
  )
}

// Modal for pausing subscription
const PauseSubscriptionModal = ({ 
  isOpen, 
  onClose, 
  onPause 
}: { 
  isOpen: boolean
  onClose: () => void
  onPause: (weeks: number) => void
}) => {
  const [pauseWeeks, setPauseWeeks] = useState(2)

  if (!isOpen) return null

  const handlePause = () => {
    onPause(pauseWeeks)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Peata tellimus ajutiselt</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Kui kaua soovite tellimust peatada? Saate selle igal ajal jätkata.
            </p>

            <div className="space-y-3">
              {[1, 2, 4, 8].map((weeks) => (
                <label key={weeks} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pauseWeeks"
                    value={weeks}
                    checked={pauseWeeks === weeks}
                    onChange={(e) => setPauseWeeks(Number(e.target.value))}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {weeks} {weeks === 1 ? 'nädal' : 'nädalat'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tellimus jätkub {new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('et-EE')}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Märkus</p>
                  <p className="text-sm text-amber-700">
                    Peatamise ajal ei toimu tellimusi ega arveldust. Saate tellimuse igal ajal taasaktiveerida.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePause}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Peata {pauseWeeks} {pauseWeeks === 1 ? 'nädalaks' : 'nädalaks'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Tühista
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 