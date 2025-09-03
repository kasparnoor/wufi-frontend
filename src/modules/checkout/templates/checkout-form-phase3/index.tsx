'use client'

import React, { useEffect } from 'react'
import { useCheckoutStoreEnhanced, useOnlineStatus } from '@/lib/stores/checkout-store-enhanced'
import { StepTransitionSkeleton, ProgressSkeleton } from '@/lib/components/ui/skeleton'
import AddressesEnhanced from '../../components/addresses-enhanced'
import ShippingEnhanced from '../../components/shipping-enhanced'
import { Progress } from '@medusajs/ui'
import { 
  ShoppingCart, 
  User, 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle,
  Settings,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react'

// Step configuration
const CHECKOUT_STEPS = [
  {
    id: 'autoship',
    title: 'Autoship',
    description: 'Tellimuste sagedus',
    icon: ShoppingCart,
    required: true,
  },
  {
    id: 'customer-type',
    title: 'Klient',
    description: 'Kliendi tüüp',
    icon: User,
    required: true,
  },
  {
    id: 'address',
    title: 'Aadress',
    description: 'Kontakt ja tarne',
    icon: MapPin,
    required: true,
  },
  {
    id: 'delivery',
    title: 'Tarneviis',
    description: 'Kuidas toimetame',
    icon: Truck,
    required: true,
  },
  {
    id: 'payment',
    title: 'Makse',
    description: 'Maksevahend',
    icon: CreditCard,
    required: true,
  },
  {
    id: 'review',
    title: 'Ülevaade',
    description: 'Tellimuse kinnitamine',
    icon: CheckCircle,
    required: true,
  },
] as const

export default function CheckoutFormPhase3() {
  const {
    currentStep,
    stepValidation,
    autoAdvancement,
    isOnline,
    pendingOperations,
    error,
    isLoading,
    enableAutoAdvancement,
    disableAutoAdvancement,
    setCurrentStep,
    clearError,
    retryPendingOperations,
  } = useCheckoutStoreEnhanced()

  // Initialize online status monitoring
  useOnlineStatus()

  // Calculate progress
  const currentStepIndex = CHECKOUT_STEPS.findIndex(step => step.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / CHECKOUT_STEPS.length) * 100

  // Auto-retry pending operations when coming back online
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      console.log(`Retrying ${pendingOperations.length} pending operations...`)
      retryPendingOperations()
    }
  }, [isOnline, pendingOperations.length, retryPendingOperations])

  // Keyboard shortcuts for step navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + number keys to jump to steps
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault()
        const stepIndex = parseInt(e.key) - 1
        const targetStep = CHECKOUT_STEPS[stepIndex]
        if (targetStep) {
          setCurrentStep(targetStep.id)
        }
      }
      
      // Ctrl/Cmd + A to toggle auto-advancement
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        if (autoAdvancement.enabled) {
          disableAutoAdvancement()
        } else {
          enableAutoAdvancement()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [autoAdvancement.enabled, enableAutoAdvancement, disableAutoAdvancement, setCurrentStep])

  // Show loading skeleton during step transitions
  if (isLoading && currentStepIndex === -1) {
    return (
      <div className="max-w-4xl mx-auto">
        <ProgressSkeleton />
        <div className="mt-8">
          <StepTransitionSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Global Status Bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center gap-4">
          {/* Online Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Ühendus olemas</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Ühenduseta</span>
              </>
            )}
          </div>

          {/* Pending Operations */}
          {pendingOperations.length > 0 && (
            <div className="flex items-center gap-2 text-blue-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                {pendingOperations.length} toimingut ootab salvestamist
              </span>
            </div>
          )}
        </div>

        {/* Auto-advancement Toggle */}
        <div className="flex items-center gap-3">
          <Settings className="w-4 h-4 text-gray-500" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoAdvancement.enabled}
              onChange={(e) => {
                if (e.target.checked) {
                  enableAutoAdvancement()
                } else {
                  disableAutoAdvancement()
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="text-gray-700">Automaatne edasiliikumine</span>
          </label>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="relative">
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="relative flex justify-between mt-4">
          {CHECKOUT_STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = stepValidation[step.id]
            const isCurrent = currentStep === step.id
            const isUpcoming = index > currentStepIndex
            
            return (
              <div 
                key={step.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-200
                  ${isCompleted 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : isCurrent 
                    ? 'bg-blue-500 text-white shadow-lg scale-110' 
                    : isUpcoming
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gray-300 text-gray-500'
                  }
                  group-hover:scale-105
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                <div className="text-center">
                  <div className={`
                    text-sm font-medium
                    ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Global Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">{error.message}</h3>
              {error.suggestedAction && (
                <p className="mt-1 text-sm text-red-700">{error.suggestedAction}</p>
              )}
              
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Sulge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[600px]">
        {/* Autoship Step */}
        {currentStep === 'autoship' && (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Autoship seadistamine</h2>
            <p className="text-gray-600 mb-8">Määrake tellimuste sagedus</p>
            <button 
              onClick={() => setCurrentStep('customer-type')}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Jätka kliendi tüübiga
            </button>
          </div>
        )}

        {/* Customer Type Step */}
        {currentStep === 'customer-type' && (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Kliendi tüüp</h2>
            <p className="text-gray-600 mb-8">Kas olete eraisik või ettevõte?</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setCurrentStep('address')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Eraisik
              </button>
              <button 
                onClick={() => setCurrentStep('address')}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Ettevõte
              </button>
            </div>
          </div>
        )}

        {/* Address Step - Enhanced Component */}
        <AddressesEnhanced />

        {/* Delivery Step - Enhanced Component */}
        <ShippingEnhanced />

        {/* Payment Step */}
        {currentStep === 'payment' && (
          <div className="text-center py-20">
            <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Makse</h2>
            <p className="text-gray-600 mb-8">Valige sobiv maksevahend</p>
            <button 
              onClick={() => setCurrentStep('review')}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Jätka ülevaatega
            </button>
          </div>
        )}

        {/* Review Step */}
        {currentStep === 'review' && (
          <div className="text-center py-20">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Tellimuse ülevaade</h2>
            <p className="text-gray-600 mb-8">Kontrollige andmeid ja kinnitage tellimus</p>
            <button className="px-8 py-4 bg-green-500 text-white text-lg rounded-xl hover:bg-green-600 transition-colors">
              Kinnita tellimus
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-xl">
        <p className="font-medium mb-2">Kiirklahvid:</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <span>Alt + 1-6 (hüppa sammule)</span>
          <span>Ctrl/Cmd + A (automaatne edasiliikumine)</span>
          <span>Ctrl/Cmd + Enter (jätka)</span>
          <span>Esc (tagasi)</span>
        </div>
      </div>
    </div>
  )
} 