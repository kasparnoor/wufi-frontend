'use client'

import React, { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@medusajs/ui'
import { contactInfoSchema, addressInfoSchema, CheckoutFormData } from '@/lib/schemas/checkout'
import { ContactInfoSection, AddressInfoSection } from '@/lib/components/forms/checkout-form-fields'
import { useCheckoutStoreEnhanced } from '@/lib/stores/checkout-store-enhanced'
import { ContactInfoSkeleton, AddressInfoSkeleton } from '@/lib/components/ui/skeleton'
import { toast } from '@/lib/hooks/use-toast'
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react'

// Combined validation schema
const addressFormSchema = contactInfoSchema.merge(addressInfoSchema)

type AddressFormData = CheckoutFormData

export default function AddressesEnhanced() {
  const {
    currentStep,
    formData,
    customerType,
    isLoading,
    error,
    isOnline,
    autoAdvancement,
    updateFormData,
    setStepValid,
    setLoading,
    createError,
    clearError,
    addPendingOperation,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    nextStep,
  } = useCheckoutStoreEnhanced()

  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [showSkeletonTransition, setShowSkeletonTransition] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    // Initialize from persisted store so refresh/return restores input values
    defaultValues: formData,
    mode: 'onChange',
  })

  const { handleSubmit, watch, formState: { isValid, errors }, setError } = methods

  // Watch all form values for auto-save
  const watchedValues = watch()

  // Auto-save form data to store
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFormData(watchedValues)
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [watchedValues, updateFormData])

  // On first mount, ensure form resets to persisted values if they change post-hydration
  useEffect(() => {
    methods.reset(formData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update step validation when form validity changes
  useEffect(() => {
    setStepValid('address', isValid && !error)
  }, [isValid, error, setStepValid])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter' && isValid && !isLoading) {
          e.preventDefault()
          handleSubmit(onSubmit)()
        }
      }
      
      if (e.key === 'Escape') {
        e.preventDefault()
        // Go back to previous step or close form
        console.log('Escape pressed - could go to previous step')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isValid, isLoading, handleSubmit])

  // Enhanced submit with retry logic and optimistic updates
  const onSubmit = async (data: AddressFormData) => {
    clearError()
    setIsSubmitting(true)
    setLoading(true)

    // Optimistic update
    const optimisticKey = 'address-submission'
    addOptimisticUpdate(optimisticKey, data)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Simulate potential failures for demonstration
      if (submitAttempts === 0 && Math.random() < 0.3) {
        throw new Error('Network timeout')
      }

      // Success - save data
      updateFormData(data)
      removeOptimisticUpdate(optimisticKey)
      
      // Show success feedback
      toast({
        title: "Aadress salvestatud! ✅",
        description: "Teie kontakt- ja tarneandmed on edukalt salvestatud.",
        duration: 2000,
      })

      // Show transition skeleton if auto-advancement is enabled
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
          type: 'setAddresses',
          payload: data,
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
          `Viga andmete salvestamisel: ${errorMessage}`,
          'server',
          { 
            suggestedAction: 'Palun kontrollige andmeid ja proovige uuesti',
            retryable: true 
          }
        )
      }

      // Show error in form
      toast({
        title: "Salvestamisel tekkis viga",
        description: error?.suggestedAction || "Palun proovige uuesti",
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
      handleSubmit(onSubmit)()
    }
  }

  // Don't render if not current step
  if (currentStep !== 'address') {
    return null
  }

  // Show skeleton during transition
  if (showSkeletonTransition) {
    return (
      <div className="space-y-6">
        <ContactInfoSkeleton />
        <AddressInfoSkeleton showCompany={customerType === 'business'} />
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Andmed salvestatud! Liigume edasi...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 text-amber-800">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Internetiühendus puudub</span>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            Andmed salvestatakse automaatselt, kui ühendus taastub.
          </p>
        </div>
      )}

      {/* Error Display with Enhanced Recovery */}
      {error && (
        <div className="mb-6 p-4 border rounded-xl bg-red-50 border-red-200">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Info Section */}
        <ContactInfoSection />

        {/* Address Info Section */}
        <AddressInfoSection showCompany={customerType === 'business'} />

        {/* Auto-advancement Status */}
        {autoAdvancement.enabled && isValid && !error && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Vorm on valmis!</span>
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
              type="submit"
              disabled={!isValid || isLoading}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Salvestame...' : 'Jätka tarneviisiga'}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Kiirklahvid: Ctrl/Cmd + Enter (jätka), Esc (tagasi)</p>
        </div>
      </form>
    </FormProvider>
  )
} 