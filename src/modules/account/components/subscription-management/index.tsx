"use client"

import { useState, ReactNode } from "react"
import { Container } from "@medusajs/ui"
import { 
  Heart, 
  Plus, 
  Calendar, 
  Package, 
  Pause, 
  Play,
  Edit3, 
  Info,
  Settings,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  MapPin,
  Clock,
  Truck
} from "lucide-react"
import { format } from "date-fns"
import { LocalizedClientLink, QuickActions, KrapsButton } from "@lib/components"
import { useCustomerDashboardData } from "@lib/hooks/use-customer-dashboard"
import { SubscriptionSummary, Pet } from "../../../../types/customer"
import { getEstonianVATGuidance } from "@lib/util/checkout-helpers"
import OrderManagementModal from "../order-management-modal"

interface SubscriptionManagementProps {
  customer: any
}

const PauseSubscriptionModal = ({ 
  isOpen, 
  onClose, 
  onPause 
}: { 
  isOpen: boolean
  onClose: () => void
  onPause: (weeks: number) => void
}) => {
  const [selectedWeeks, setSelectedWeeks] = useState(2)

  const handlePause = () => {
    onPause(selectedWeeks)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-yellow-900">Peata püsitellimus</h3>
          <button onClick={onClose} className="text-yellow-600 hover:text-yellow-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-yellow-700">
          Kui kauaks soovite tellimuse peatada?
        </p>
        
        <div className="space-y-3">
          {[1, 2, 4, 8].map((weeks) => (
            <label key={weeks} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="pause-duration"
                value={weeks}
                checked={selectedWeeks === weeks}
                onChange={() => setSelectedWeeks(weeks)}
                className="text-yellow-600 focus:ring-yellow-400"
              />
              <span className="text-yellow-800">
                {weeks} {weeks === 1 ? 'nädal' : 'nädalat'}
                {weeks === 8 && ' (võimalik pikendada)'}
              </span>
            </label>
          ))}
        </div>
        
        <div className="flex gap-3 pt-4">
          <KrapsButton variant="secondary" onClick={onClose} className="flex-1">
            Loobu
          </KrapsButton>
          <KrapsButton variant="primary" onClick={handlePause} className="flex-1">
            Peata tellimus
          </KrapsButton>
        </div>
      </div>
    </div>
  )
}

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-yellow-900">{title}</h3>
          <button onClick={onClose} className="text-yellow-600 hover:text-yellow-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-yellow-700">{message}</p>
        
        <KrapsButton variant="primary" onClick={onClose} className="w-full">
          Sulge
        </KrapsButton>
      </div>
    </div>
  )
}

const SubscriptionManagement = ({ customer }: SubscriptionManagementProps) => {
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionSummary | null>(null)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  
  // Get guidance messages
  const guidance = getEstonianVATGuidance()

  // Load live dashboard data (includes subscription summaries and pets)
  const { dashboard, updateSubscription, quickAction } = useCustomerDashboardData()

  const activeSubscriptions: SubscriptionSummary[] = (dashboard?.subscriptions?.active as SubscriptionSummary[]) || []
  const pausedSubscriptions: SubscriptionSummary[] = (dashboard?.subscriptions?.paused as SubscriptionSummary[]) || []
  const pets: Pet[] = (dashboard?.customer?.pets as Pet[]) || []

  const handlePauseSubscription = async (weeks: number) => {
    if (!selectedSubscription) return
    const reason = `Peatatud ${weeks} nädalaks`
    quickAction.mutate({
      subscriptionId: selectedSubscription.id,
      actionData: { action: 'pause', reason }
    })
    setSelectedSubscription(null)
  }

  const handleManageSubscription = (subscription: SubscriptionSummary) => {
    setSelectedSubscription(subscription)
    setShowOrderModal(true)
  }

  const handleOrderUpdate = async (action: string, data: any) => {
    if (!selectedSubscription) return
    const subscriptionId = selectedSubscription.id

    try {
      switch (action) {
        case 'modify': {
          // Change next delivery date if provided
          if (data?.date) {
            await (updateSubscription as any).mutateAsync({
              subscriptionId,
              updateData: { action: 'change_date', next_delivery_date: data.date }
            })
          }
          // Update items (use first item as baseline if present)
          if (selectedSubscription.items?.[0] && typeof data?.quantity === 'number') {
            await (updateSubscription as any).mutateAsync({
              subscriptionId,
              updateData: {
                action: 'update_items',
                items: [
                  {
                    variant_id: selectedSubscription.items[0].variant_id,
                    quantity: Math.max(1, data.quantity),
                  },
                ],
              },
            })
          }
          // Optionally change interval if provided (handled by quick action endpoint)
          if (data?.interval) {
            const intervalCode = data.interval === 'biweekly' ? '2w' : data.interval
            quickAction.mutate({ subscriptionId, actionData: { interval: intervalCode } })
          }
          break
        }
        case 'skip':
          quickAction.mutate({ subscriptionId, actionData: { action: 'skip' } })
          break
        case 'pause':
          quickAction.mutate({ subscriptionId, actionData: { action: 'pause', reason: data?.pause_duration } })
          break
        case 'cancel':
          quickAction.mutate({ subscriptionId, actionData: { action: 'cancel', reason: data?.reason } })
          break
      }
    } finally {
      setShowOrderModal(false)
      setSelectedSubscription(null)
    }
  }

  const handleResumeSubscription = (subscriptionId: string) => {
    quickAction.mutate({ subscriptionId, actionData: { action: 'resume' } })
  }

  const handleChangeDateAction = () => {
    setShowDateModal(true)
  }

  const handleQuantityAction = () => {
    setShowQuantityModal(true)
  }

  const handlePauseAction = () => {
    setShowPauseModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Kraps Styling */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 rounded-lg p-6 border border-yellow-200/50">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-2">
          Püsitellimused
        </h1>
        <p className="text-yellow-800">
          Hallake oma lemmikloomade püsitellimusi - muutke kuupäevi, koguseid või peatage vajaduse korral
        </p>
      </div>

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <KrapsSectionTitle>Aktiivsed tellimused ({activeSubscriptions.length})</KrapsSectionTitle>
          <div className="space-y-4">
            {activeSubscriptions.map((subscription) => {
              const pet = pets.find(p => (p as any).id === subscription.pet_id || p.name === (subscription as any).pet_name)
              return (
                <KrapsSubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription} 
                  pet={pet}
                  onPause={() => {
                    setSelectedSubscription(subscription)
                    setShowPauseModal(true)
                  }}
                  onManage={() => handleManageSubscription(subscription)}
                  guidance={guidance}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Paused Subscriptions */}
      {pausedSubscriptions.length > 0 && (
        <div className="space-y-4">
          <KrapsSectionTitle>Peatatud tellimused ({pausedSubscriptions.length})</KrapsSectionTitle>
          <div className="space-y-4">
            {pausedSubscriptions.map((subscription) => {
              const pet = pets.find(p => (p as any).id === subscription.pet_id || p.name === (subscription as any).pet_name)
              return (
                <KrapsPausedSubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription} 
                  pet={pet}
                  onResume={() => handleResumeSubscription(subscription.id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Removed: Kiired toimingud */}

      {/* No subscriptions state */}
      {(activeSubscriptions.length + pausedSubscriptions.length === 0) && (
        <KrapsCard>
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4">🐾</div>
            <h3 className="text-lg sm:text-xl font-semibold text-yellow-900 mb-2">
              Püsitellimused puuduvad
            </h3>
            <p className="text-yellow-700 mb-6 max-w-md mx-auto">
              Teil pole veel ühtegi püsitellimust. Looge püsitellimus, et hoida oma lemmikloom hästi toitumisel!
            </p>
                          <LocalizedClientLink href="/pood">
              <KrapsButton variant="primary">
                Sirvi tooteid
              </KrapsButton>
            </LocalizedClientLink>
          </div>
        </KrapsCard>
      )}

      {/* No pets state */}
      {pets.length === 0 && (
        <KrapsCard>
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4">🐾</div>
            <h3 className="text-lg sm:text-xl font-semibold text-yellow-900 mb-2">
              Lemmikloomad puuduvad
            </h3>
            <p className="text-yellow-700 mb-6 max-w-md mx-auto">
              Lisage oma lemmikloomad, et hallata nende püsitellimusi
            </p>
            <LocalizedClientLink href="/konto/lemmikloomad">
              <KrapsButton variant="primary">
                Lisa lemmikloom
              </KrapsButton>
            </LocalizedClientLink>
          </div>
        </KrapsCard>
      )}

      {/* Modals */}
      {showPauseModal && selectedSubscription && (
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

      {/* Order Management Modal */}
      {showOrderModal && selectedSubscription && (
        <OrderManagementModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false)
            setSelectedSubscription(null)
          }}
          subscription={{
            id: selectedSubscription.id,
            pet_id: selectedSubscription.pet_id || '',
            product_name: selectedSubscription.items[0]?.product_title || '',
            quantity: selectedSubscription.items[0]?.quantity || 1,
            interval: selectedSubscription.interval,
            next_delivery: selectedSubscription.next_delivery,
            price: selectedSubscription.items[0]?.unit_price || 0,
            status: selectedSubscription.status
          }}
          pet={(function(){
            const found = pets.find(p => (p as any).id === selectedSubscription.pet_id || p.name === (selectedSubscription as any).pet_name)
            if (found) {
              return { ...(found as any), id: selectedSubscription.pet_id || (found as any).id || 'pet_unknown' }
            }
            return { id: selectedSubscription.pet_id || 'pet_unknown', name: 'Lemmikloom', type: 'dog' as any }
          })()}
          onUpdate={handleOrderUpdate}
        />
      )}
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

// Mobile-optimized subscription management card
const KrapsSubscriptionCard = ({ 
  subscription, 
  pet, 
  onPause, 
  onManage,
  guidance 
}: { 
  subscription: SubscriptionSummary, 
  pet?: Pet, 
  onPause: () => void,
  onManage: () => void,
  guidance: ReturnType<typeof getEstonianVATGuidance>
}) => {
  const nextOrderDate = new Date(subscription.next_delivery)
  const daysUntil = Math.ceil((nextOrderDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <KrapsCard className="hover:border-yellow-300">
      <div className="space-y-4">
        {/* Header with pet context */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl">{pet?.type === 'dog' ? '🐕' : '🐱'}</div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">{subscription.items[0]?.product_title}</h3>
              <p className="text-yellow-700 text-sm sm:text-base">{pet?.name || 'Lemmikloom'} • {subscription.interval}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-green-700">Aktiivne</span>
          </div>
        </div>

        {/* Order Status - Mobile optimized */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <p className="font-medium text-yellow-900">
                Järgmine tellimus: {format(nextOrderDate, 'dd. MMMM yyyy')}
              </p>
              <p className="text-sm text-yellow-700">
                {daysUntil > 0 ? `${daysUntil} päeva • ` : 'Täna • '}{subscription.interval}
              </p>
            </div>
            <div className="flex gap-2">
              <KrapsButton variant="secondary" size="small" onClick={onManage}>
                <Settings className="h-4 w-4 mr-1" />
                Halda
              </KrapsButton>
            </div>
          </div>
        </div>

        {/* Removed: Address Requirements Info per request */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <KrapsButton variant="secondary" onClick={onPause} className="flex-1">
            <Pause className="h-4 w-4 mr-2" />
            Peata ajutiselt
          </KrapsButton>
        </div>
      </div>
    </KrapsCard>
  )
}

const KrapsPausedSubscriptionCard = ({ subscription, pet, onResume }: { subscription: SubscriptionSummary, pet?: Pet, onResume: () => void }) => {
  // Calculate resume date (for demo purposes, 14 days from now for paused subscriptions)
  const resumeDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const daysUntilResume = Math.ceil((resumeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <KrapsCard className="border-orange-200 bg-orange-50/30">
      <div className="space-y-4">
        {/* Header with pet context */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl opacity-60">{pet?.type === 'dog' ? '🐕' : '🐱'}</div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900">{subscription.items[0]?.product_title}</h3>
              <p className="text-orange-700 text-sm sm:text-base">{pet?.name || 'Lemmikloom'} • {subscription.interval}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium text-orange-700">Peatatud</span>
          </div>
        </div>

        {/* Pause Status */}
        <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <p className="font-medium text-orange-900">
                Jätkub: {format(resumeDate, 'dd. MMMM yyyy')}
              </p>
              <p className="text-sm text-orange-700">
                {daysUntilResume > 0 ? `${daysUntilResume} päeva pärast` : 'Täna'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <KrapsButton variant="primary" onClick={onResume} className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            Jätka kohe
          </KrapsButton>
          <LocalizedClientLink href={`/konto/subscriptions/${subscription.id}`} className="flex-1">
            <KrapsButton variant="secondary" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Muuda seadeid
            </KrapsButton>
          </LocalizedClientLink>
        </div>
      </div>
    </KrapsCard>
  )
}

export default SubscriptionManagement 