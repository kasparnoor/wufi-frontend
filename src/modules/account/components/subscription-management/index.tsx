"use client"

import { useState } from "react"
import { Container } from "@medusajs/ui"
import { 
  Calendar, 
  Pause, 
  Play, 
  Edit3, 
  Package,
  Info,
  Plus,
  Settings,
  X,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns"
import { LocalizedClientLink } from "@lib/components"
import { SubscriptionSummary } from "../../../../types/customer"

interface SubscriptionManagementProps {
  customer: any
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

// Simple demo modal for features not yet implemented
const SimpleDemoModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message 
}: { 
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-700">{message}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Selge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SubscriptionManagement = ({ customer }: SubscriptionManagementProps) => {
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionSummary | null>(null)

  // Simplified mock data focused on order placement
  const [subscriptions, setSubscriptions] = useState<SubscriptionSummary[]>([
    {
      id: 'sub_1',
      status: 'active',
      interval: 'Iga 4 nädala tagant',
      next_delivery: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      days_until_next: 25,
      is_overdue: false,
      items: [
        { variant_id: 'var_1', quantity: 1, unit_price: 45.99, product_title: 'Premium Adult Dog Food' }
      ],
      total_items: 1,
      estimated_total: 45.99,
      can_modify: true
    }
  ])

  const activeSubs = subscriptions.filter(sub => sub.status === 'active')
  const pausedSubs = subscriptions.filter(sub => sub.status === 'paused')

  const handlePauseSubscription = (weeks: number) => {
    if (selectedSubscription) {
      setSubscriptions(prev => prev.map(sub => 
        sub.id === selectedSubscription.id 
          ? { ...sub, status: 'paused' }
          : sub
      ))
      console.log(`Pausing subscription ${selectedSubscription.id} for ${weeks} weeks`)
      alert(`Tellimus peatatud ${weeks} ${weeks === 1 ? 'nädalaks' : 'nädalaks'}`)
    }
  }

  const handleResumeSubscription = (subscriptionId: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, status: 'active' }
        : sub
    ))
    console.log(`Resuming subscription ${subscriptionId}`)
    alert('Tellimus taasaktiveeritud!')
  }

  const handleChangeDateAction = () => {
    setShowDateModal(true)
  }

  const handleQuantityAction = () => {
    setShowQuantityModal(true)
  }

  const handlePauseAction = () => {
    if (activeSubs.length > 0) {
      setSelectedSubscription(activeSubs[0])
      setShowPauseModal(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Demo Notice - Clean Style */}
      <CleanDemoNotice />

      {/* Header with context */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Max'i püsitellimused 🐕
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Hallake oma lemmikloomade toidu püsitellimusi
        </p>
      </div>

      {/* Active Subscriptions - Pet Focused */}
      {activeSubs.length > 0 && (
        <div className="space-y-4">
          <CleanSectionTitle>Aktiivsed püsitellimused</CleanSectionTitle>
          
          <div className="space-y-4">
            {activeSubs.map((subscription) => (
              <MobileSubscriptionCard 
                key={subscription.id} 
                subscription={subscription}
                onPause={() => {
                  setSelectedSubscription(subscription)
                  setShowPauseModal(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <CleanSectionTitle>Kiired toimingud</CleanSectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <MobileActionTile 
            icon={<Calendar className="h-5 w-5" />}
            label="Muuda tellimuse kuupäeva"
            onClick={handleChangeDateAction}
          />
          <MobileActionTile 
            icon={<Package className="h-5 w-5" />}
            label="Muuda toote kogust"
            onClick={handleQuantityAction}
          />
          <MobileActionTile 
            icon={<Pause className="h-5 w-5" />}
            label="Peata tellimus ajutiselt"
            onClick={handlePauseAction}
          />
        </div>
      </div>

      {/* Paused Subscriptions */}
      {pausedSubs.length > 0 && (
        <div className="space-y-4">
          <CleanSectionTitle>Peatatud püsitellimused</CleanSectionTitle>
          
          <div className="space-y-4">
            {pausedSubs.map((subscription) => (
              <PausedSubscriptionCard 
                key={subscription.id} 
                subscription={subscription}
                onResume={() => handleResumeSubscription(subscription.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No subscriptions state */}
      {activeSubs.length === 0 && pausedSubs.length === 0 && (
        <EmptySubscriptionsState />
      )}

      {/* Modals */}
      {showPauseModal && (
        <PauseSubscriptionModal
          isOpen={showPauseModal}
          onClose={() => {
            setShowPauseModal(false)
            setSelectedSubscription(null)
          }}
          onPause={handlePauseSubscription}
        />
      )}

      {showDateModal && (
        <SimpleDemoModal
          isOpen={showDateModal}
          onClose={() => setShowDateModal(false)}
          title="Muuda tellimuse kuupäeva"
          message="Demo funktsionaalsus - kuupäeva muutmine tuleb peagi!"
        />
      )}

      {showQuantityModal && (
        <SimpleDemoModal
          isOpen={showQuantityModal}
          onClose={() => setShowQuantityModal(false)}
          title="Muuda toote kogust"
          message="Demo funktsionaalsus - koguse muutmine tuleb peagi!"
        />
      )}
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

const MobilePrimaryButton = ({ href, children, onClick }: { 
  href?: string
  children: React.ReactNode
  onClick?: () => void 
}) => {
  const buttonClasses = "w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-manipulation"
  
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
  const buttonClasses = "w-full sm:w-auto px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-manipulation"
  
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

const MobileWarningButton = ({ children, onClick }: { 
  children: React.ReactNode
  onClick?: () => void 
}) => (
  <button 
    onClick={onClick}
    className="w-full sm:w-auto px-4 py-3 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg text-sm hover:bg-yellow-100 transition-colors flex items-center justify-center gap-2 touch-manipulation"
  >
    {children}
  </button>
)

const MobileSuccessButton = ({ children, onClick }: { 
  children: React.ReactNode
  onClick?: () => void 
}) => (
  <button 
    onClick={onClick}
    className="w-full sm:w-auto px-4 py-3 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 touch-manipulation"
  >
    {children}
  </button>
)

// Mobile-optimized subscription management card
const MobileSubscriptionCard = ({ subscription, onPause }: { subscription: SubscriptionSummary, onPause: () => void }) => {
  const nextOrderDate = new Date(subscription.next_delivery)
  const daysUntil = Math.ceil((nextOrderDate.getTime() - Date.now()) / (1000 * 60 * 60 * 1000))

  return (
    <CleanCard>
      <div className="space-y-4">
        {/* Header with pet context */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl">🐕</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Max'i premium toit</h3>
              <p className="text-gray-600 text-sm sm:text-base">{subscription.items[0]?.product_title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-green-700">Aktiivne</span>
          </div>
        </div>

        {/* Order Status - Mobile optimized */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <p className="font-medium text-gray-900">
                Järgmine tellimus: {format(nextOrderDate, 'dd. MMMM yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {daysUntil > 0 ? `${daysUntil} päeva • ` : 'Täna • '}{subscription.interval}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tellimus esitatakse automaatselt - tarne toimub vastavalt lao olukorrale
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-lg font-semibold text-gray-900">
                €{subscription.estimated_total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">{subscription.total_items} toode{subscription.total_items > 1 ? 't' : ''}</p>
            </div>
          </div>
        </div>

        {/* Actions - Mobile optimized */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <MobilePrimaryButton href={`/account/subscriptions/${subscription.id}`}>
            <Edit3 className="h-4 w-4" />
            Muuda tellimust
          </MobilePrimaryButton>
          <MobileSecondaryButton onClick={onPause}>
            <Pause className="h-4 w-4" />
            Peata ajutiselt
          </MobileSecondaryButton>
        </div>
      </div>
    </CleanCard>
  )
}

// Component: Mobile Action Tile
const MobileActionTile = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => {
  return (
    <CleanCard className="hover:shadow-md transition-shadow cursor-pointer touch-manipulation">
      <button 
        onClick={onClick}
        className="w-full text-left p-4 flex items-center gap-3 group"
      >
        <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
          {label}
        </span>
      </button>
    </CleanCard>
  )
}

// Component: Paused Subscription Card
const PausedSubscriptionCard = ({ subscription, onResume }: { subscription: SubscriptionSummary, onResume: () => void }) => {
  return (
    <CleanCard className="opacity-75">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="text-3xl opacity-50">🐕</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Max'i premium toit</h3>
              <p className="text-gray-600">{subscription.items[0]?.product_title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm font-medium text-yellow-800">Peatatud</span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            See püsitellimus on ajutiselt peatatud. Aktiveerige uuesti, et jätkata regulaarseid tellimusi.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <MobileSuccessButton onClick={onResume}>
            <Play className="h-4 w-4" />
            Aktiveeri uuesti
          </MobileSuccessButton>
          <MobileSecondaryButton href={`/account/subscriptions/${subscription.id}`}>
            <Settings className="h-4 w-4" />
            Muuda seadeid
          </MobileSecondaryButton>
        </div>
      </div>
    </CleanCard>
  )
}

// Component: Empty Subscriptions State
const EmptySubscriptionsState = () => {
  return (
    <CleanCard>
      <div className="text-center py-8 sm:py-12">
        <div className="text-4xl sm:text-6xl mb-4">📦</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Püsitellimused puuduvad
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Alustage oma esimese lemmiklooma toidu püsitellimusega ja saage regulaarseid tarneid
        </p>
        <LocalizedClientLink href="/products">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Alusta püsitellimust
          </button>
        </LocalizedClientLink>
      </div>
    </CleanCard>
  )
}

export default SubscriptionManagement 