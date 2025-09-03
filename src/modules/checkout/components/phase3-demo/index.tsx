'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@medusajs/ui'
import { useCheckoutStorePhase3, useOnlineStatusPhase3 } from '@/lib/stores/checkout-store-phase3'
import { ContactInfoSkeleton, ShippingSkeleton, StepTransitionSkeleton } from '@/lib/components'
import { CheckCircle, AlertCircle, Wifi, WifiOff, Clock, ArrowRight, Settings } from 'lucide-react'

export default function Phase3Demo() {
  const {
    currentStep,
    formData,
    isLoading,
    error,
    isOnline,
    autoAdvancement,
    pendingOperations,
    setCurrentStep,
    updateFormData,
    setStepValid,
    setLoading,
    createError,
    clearError,
    enableAutoAdvancement,
    disableAutoAdvancement,
    addPendingOperation,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    nextStep,
  } = useCheckoutStorePhase3()

  // Initialize online status monitoring
  useOnlineStatusPhase3()

  const [demoState, setDemoState] = useState({
    showSkeleton: false,
    isSubmitting: false,
    submitAttempts: 0,
  })

  // Simulate form submission with retry logic
  const simulateSubmission = async () => {
    clearError()
    setDemoState(prev => ({ ...prev, isSubmitting: true }))
    setLoading(true)

    // Optimistic update
    const optimisticKey = 'demo-submission'
    addOptimisticUpdate(optimisticKey, { submitted: true })

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))

      // Simulate potential failures for demonstration (30% chance)
      if (Math.random() < 0.3) {
        throw new Error('Network timeout')
      }

      // Success - update form data
      updateFormData({ demo_completed: true, completed_at: new Date().toISOString() })
      removeOptimisticUpdate(optimisticKey)
      
      // Show success and auto-advance if enabled
      if (autoAdvancement.enabled && autoAdvancement.autoAdvanceOnSuccess) {
        setDemoState(prev => ({ ...prev, showSkeleton: true }))
        
        setTimeout(() => {
          setDemoState(prev => ({ ...prev, showSkeleton: false }))
          nextStep()
        }, autoAdvancement.delayMs)
      }

    } catch (error) {
      removeOptimisticUpdate(optimisticKey)
      setDemoState(prev => ({ ...prev, submitAttempts: prev.submitAttempts + 1 }))

      const errorMessage = error instanceof Error ? error.message : 'Tundmatu viga'
      
      if (!isOnline) {
        // Queue operation for when we're back online
        addPendingOperation({
          type: 'setAddresses',
          payload: { demo: true },
          maxRetries: 3,
        })
        
        createError(
          'Internetiühendus puudub',
          'network',
          { 
            suggestedAction: 'Andmed salvestatakse automaatselt, kui ühendus taastub',
            recoverable: true 
          }
        )
      } else {
        createError(
          `Demo viga: ${errorMessage}`,
          'timeout',
          { 
            suggestedAction: 'Palun proovige uuesti - see on demo viga',
            retryable: true 
          }
        )
      }
    } finally {
      setDemoState(prev => ({ ...prev, isSubmitting: false }))
      setLoading(false)
    }
  }

  // Simulate network disconnect for demo
  const simulateNetworkIssue = () => {
    // This would normally be handled by the actual network state
    // For demo purposes, we just create an error
    createError(
      'Simuleeritud võrguprobleem',
      'network',
      { 
        suggestedAction: 'See on demo - vajutage "Proovi uuesti"',
        retryable: true 
      }
    )
  }

  // Handle retry
  const handleRetry = () => {
    if (error?.retryable) {
      simulateSubmission()
    }
  }

  // Show skeleton during transition
  if (demoState.showSkeleton) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Demo õnnestus! Liigume edasi...</span>
          </div>
        </div>
        <StepTransitionSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-900">Phase 3: UX Polish Demo</h2>
        </div>
        <p className="text-blue-700">
          Test auto-advancement, retry logic, skeleton loading, and enhanced error recovery
        </p>
      </div>

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
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {pendingOperations.length} toimingut ootab salvestamist
              </span>
            </div>
          )}

          {/* Current Step */}
          <div className="text-sm text-gray-600">
            Hetke samm: <span className="font-medium">{currentStep}</span>
          </div>
        </div>

        {/* Auto-advancement Toggle */}
        <div className="flex items-center gap-3">
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
              
              <div className="mt-3 flex gap-2">
                {error.retryable && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleRetry}
                    disabled={isLoading}
                  >
                    Proovi uuesti
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  onClick={clearError}
                >
                  Sulge
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Demo */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Form with Enhanced UX</h3>
          
          {/* Show skeleton when loading */}
          {isLoading && currentStep === 'address' ? (
            <ContactInfoSkeleton />
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-medium text-blue-900 mb-4">Demo Address Form</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="teie@email.ee"
                    value={formData.email || ''}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eesnimi
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nimi"
                      value={formData.first_name || ''}
                      onChange={(e) => updateFormData({ first_name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perekonnanimi
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Perenimi"
                      value={formData.last_name || ''}
                      onChange={(e) => updateFormData({ last_name: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadress
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tänavannimi ja number"
                    value={formData.address_1 || ''}
                    onChange={(e) => updateFormData({ address_1: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Auto-advancement Status */}
          {autoAdvancement.enabled && formData.email && formData.first_name && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Vorm on osaliselt täidetud!</span>
              </div>
              <p className="mt-1 text-sm text-blue-700">
                Automaatne edasiliikumine toimub pärast "Demo Submit" nupule vajutamist.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Shipping Demo */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Shipping with Loading States</h3>
          
          {isLoading && currentStep === 'delivery' ? (
            <ShippingSkeleton />
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              <h4 className="font-medium text-purple-900 mb-4">Demo Shipping Options</h4>
              
              <div className="space-y-3">
                {['Omniva pakiautomaat - 2.90€', 'DPD kuller - 4.90€', 'SmartPOST - 3.50€'].map((option, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors cursor-pointer"
                    onClick={() => updateFormData({ shipping_method: option })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-4 h-4 rounded-full border-2
                          ${formData.shipping_method === option 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300'
                          }
                        `}>
                          {formData.shipping_method === option && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        <span className="font-medium">{option.split(' - ')[0]}</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        {option.split(' - ')[1]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl">
        <Button
          onClick={simulateSubmission}
          disabled={isLoading}
          isLoading={demoState.isSubmitting}
          className="flex items-center gap-2"
        >
          {demoState.isSubmitting ? 'Salvestame...' : 'Demo Submit'}
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          onClick={simulateNetworkIssue}
          disabled={isLoading}
        >
          Simuleeri võrguprobleemi
        </Button>

        <Button
          variant="secondary"
          onClick={() => setCurrentStep('address')}
          disabled={isLoading}
        >
          Reset Step
        </Button>

        <Button
          variant="secondary"
          onClick={clearError}
          disabled={!error}
        >
          Clear Error
        </Button>
      </div>

      {/* Demo Information */}
      <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-xl">
        <p className="font-medium mb-2">Demo Features:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Auto-advancement toggle (try checking/unchecking the box above)</li>
          <li>Skeleton loading during transitions and API calls</li>
          <li>Network retry logic with exponential backoff</li>
          <li>Optimistic updates with rollback on failure</li>
          <li>Estonian error messages with actionable suggestions</li>
          <li>Offline operation queuing (simulated)</li>
          <li>Real-time form state synchronization</li>
        </ul>
      </div>
    </div>
  )
} 