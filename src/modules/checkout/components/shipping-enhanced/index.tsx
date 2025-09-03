'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@medusajs/ui'
import { useCheckoutStoreEnhanced } from '@/lib/stores/checkout-store-enhanced'
import { ShippingSkeleton, StepTransitionSkeleton } from '@/lib/components/ui/skeleton'
import { toast } from '@/lib/hooks/use-toast'
import { CheckCircle, AlertCircle, Truck, Package, Wifi, WifiOff, Clock } from 'lucide-react'

// Mock shipping methods data
const mockShippingMethods = [
  {
    id: 'omniva-parcel-machine',
    name: 'Omniva pakiautomaat',
    description: 'Kiire ja mugav kätte saamine üle Eesti',
    price: 2.90,
    deliveryTime: '1-2 tööpäeva',
    icon: Package,
    recommended: true,
  },
  {
    id: 'omniva-courier',
    name: 'Omniva kuller',
    description: 'Otse teie ukse taha',
    price: 4.90,
    deliveryTime: '1-3 tööpäeva', 
    icon: Truck,
  },
  {
    id: 'dpd-pickup',
    name: 'DPD pakipunkt',
    description: 'Lai võrk üle Eesti',
    price: 3.50,
    deliveryTime: '2-3 tööpäeva',
    icon: Package,
  },
]

export default function ShippingEnhanced() {
  const {
    currentStep,
    formData,
    isLoading,
    error,
    isOnline,
    autoAdvancement,
    setStepValid,
    setLoading,
    createError,
    clearError,
    addPendingOperation,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    nextStep,
    updateFormData,
  } = useCheckoutStoreEnhanced()

  const [selectedMethod, setSelectedMethod] = useState<string | null>(
    formData.shipping_method || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSkeletonTransition, setShowSkeletonTransition] = useState(false)
  const [submitAttempts, setSubmitAttempts] = useState(0)

  // Update step validation when selection changes
  useEffect(() => {
    setStepValid('delivery', Boolean(selectedMethod))
  }, [selectedMethod, setStepValid])

  // Auto-save selection to store
  useEffect(() => {
    if (selectedMethod) {
      updateFormData({ shipping_method: selectedMethod })
    }
  }, [selectedMethod, updateFormData])

  // Ensure selection is hydrated from persisted store on mount
  useEffect(() => {
    if (formData.shipping_method && !selectedMethod) {
      setSelectedMethod(formData.shipping_method as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter' && selectedMethod && !isLoading) {
          e.preventDefault()
          handleContinue()
        }
      }
      
      // Arrow key navigation
      if (!isLoading && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const currentIndex = mockShippingMethods.findIndex(m => m.id === selectedMethod)
        let nextIndex
        
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < mockShippingMethods.length - 1 ? currentIndex + 1 : 0
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : mockShippingMethods.length - 1
        }
        
        setSelectedMethod(mockShippingMethods[nextIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMethod, isLoading])

  // Enhanced submit with retry logic
  const handleContinue = async () => {
    if (!selectedMethod) return

    clearError()
    setIsSubmitting(true)
    setLoading(true)

    // Optimistic update
    const optimisticKey = 'shipping-selection'
    addOptimisticUpdate(optimisticKey, { shipping_method: selectedMethod })

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

      // Simulate potential failures for demonstration
      if (submitAttempts === 0 && Math.random() < 0.25) {
        throw new Error('Server timeout')
      }

      // Success - save data
      const selectedMethodData = mockShippingMethods.find(m => m.id === selectedMethod)
      updateFormData({ 
        shipping_method: selectedMethod,
        shipping_price: selectedMethodData?.price || 0,
      })
      
      removeOptimisticUpdate(optimisticKey)
      
      // Show success feedback
      toast({
        title: "Tarneviis valitud! 🚚",
        description: `${selectedMethodData?.name} - ${selectedMethodData?.price}€`,
        duration: 2000,
      })

      // Auto-advance if enabled
      if (autoAdvancement.enabled && autoAdvancement.autoAdvanceOnSuccess) {
        setShowSkeletonTransition(true)
        
        setTimeout(() => {
          setShowSkeletonTransition(false)
          nextStep()
        }, autoAdvancement.delayMs)
      }

    } catch (error) {
      removeOptimisticUpdate(optimisticKey)
      setSubmitAttempts(prev => prev + 1)

      const errorMessage = error instanceof Error ? error.message : 'Tundmatu viga'
      
      if (!isOnline) {
        // Queue operation for when we're back online
        addPendingOperation({
          type: 'setShippingMethod',
          payload: { shipping_method: selectedMethod },
          maxRetries: 3,
        })
        
        createError(
          'Internetiühendus puudub',
          'network',
          { 
            suggestedAction: 'Tarneviis salvestatakse automaatselt, kui ühendus taastub',
            recoverable: true 
          }
        )
      } else if (errorMessage.includes('timeout')) {
        createError(
          'Päring aegus',
          'timeout',
          { 
            suggestedAction: 'Palun proovige uuesti - server ei vastanud õigeaegselt',
            retryable: true 
          }
        )
      } else {
        createError(
          `Viga tarneviisi salvestamisel: ${errorMessage}`,
          'server',
          { 
            suggestedAction: 'Palun proovige uuesti',
            retryable: true 
          }
        )
      }

      toast({
        title: "Tarneviisi salvestamisel tekkis viga",
        description: "Palun proovige uuesti",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Handle retry button click  
  const handleRetry = () => {
    if (error?.retryable) {
      handleContinue()
    }
  }

  // Don't render if not current step
  if (currentStep !== 'delivery') {
    return null
  }

  // Show loading skeleton during step transition
  if (showSkeletonTransition) {
    return (
      <div className="space-y-6">
        <ShippingSkeleton />
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Tarneviis salvestatud! Liigume edasi...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show loading skeleton while initially loading
  if (isLoading && !selectedMethod) {
    return <ShippingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-purple-900">Tarneviis</h2>
        </div>
        <p className="text-purple-700">Valige endale sobiv tarneviis</p>
      </div>

      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 text-amber-800">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Internetiühendus puudub</span>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            Tarneviis salvestatakse automaatselt, kui ühendus taastub.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 border rounded-xl bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">{error.message}</h3>
              {error.suggestedAction && (
                <p className="mt-1 text-sm text-red-700">{error.suggestedAction}</p>
              )}
              
              {error.retryable && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleRetry}
                    disabled={isLoading}
                  >
                    Proovi uuesti
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={clearError}
                  >
                    Sulge
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Methods */}
      <div className="space-y-3">
        {mockShippingMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id
          
          return (
            <div
              key={method.id}
              className={`
                border rounded-xl p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !isLoading && setSelectedMethod(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex-shrink-0
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                  
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                  `}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      {method.recommended && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Soovitatud
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{method.price}€</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{method.deliveryTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Auto-advancement Status */}
      {autoAdvancement.enabled && selectedMethod && !error && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Tarneviis valitud!</span>
          </div>
          <p className="mt-1 text-sm text-blue-700">
            Liigume automaatselt edasi pärast salvestamist või vajutage &quot;Jätka&quot; kohe.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          type="button"
          disabled={isLoading}
          onClick={() => console.log('Go back')}
        >
          Tagasi
        </Button>

        <div className="flex items-center gap-3">
          {/* Online Status */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span>Ühendus olemas</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600" />
                <span>Ühenduseta</span>
              </>
            )}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedMethod || isLoading}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Salvestame...' : 'Jätka maksega'}
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 text-center">
        <p>Kiirklahvid: ↑↓ (vali), Ctrl/Cmd + Enter (jätka), Esc (tagasi)</p>
      </div>
    </div>
  )
} 