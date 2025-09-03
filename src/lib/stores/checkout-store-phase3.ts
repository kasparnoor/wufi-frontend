import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import React from 'react'

// Use a simple form data interface that works with existing code
export interface CheckoutFormData {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  address_1?: string
  address_2?: string
  city?: string
  postal_code?: string
  province?: string
  country_code?: string
  shipping_method?: string
  shipping_price?: number
  [key: string]: any
}

export type CheckoutStep = 'autoship' | 'customer-type' | 'address' | 'delivery' | 'payment' | 'review'
export type CustomerType = 'individual' | 'business'

// Enhanced error types with recovery suggestions
export interface CheckoutError {
  message: string
  type: 'network' | 'validation' | 'timeout' | 'server' | 'unknown'
  recoverable: boolean
  retryable: boolean
  suggestedAction?: string
  originalError?: any
}

// Operation types for retry logic
export interface PendingOperation {
  id: string
  type: 'setAddresses' | 'setShippingMethod' | 'setPaymentMethod'
  payload: any
  timestamp: number
  retryCount: number
  maxRetries: number
}

// Auto-advancement settings
export interface AutoAdvancementSettings {
  enabled: boolean
  delayMs: number
  skipOptionalSteps: boolean
  autoAdvanceOnSuccess: boolean
}

// Enhanced state interface
interface CheckoutState {
  // Current checkout state
  currentStep: CheckoutStep
  formData: Partial<CheckoutFormData>
  customerType: CustomerType | null
  isLoading: boolean
  error: CheckoutError | null
  
  // Step validation
  stepValidation: Record<CheckoutStep, boolean>
  
  // Auto-advancement
  autoAdvancement: AutoAdvancementSettings
  _autoAdvanceTimeout?: NodeJS.Timeout // For cleanup
  
  // Network and retry logic
  isOnline: boolean
  pendingOperations: PendingOperation[]
  retryOperation: (operationId: string) => Promise<void>
  
  // Optimistic updates
  optimisticUpdates: Record<string, any>
  
  // Enhanced actions
  setCurrentStep: (step: CheckoutStep) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: Partial<CheckoutFormData>) => void
  setCustomerType: (type: CustomerType) => void
  setStepValid: (step: CheckoutStep, isValid: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: CheckoutError | null) => void
  
  // Auto-advancement actions
  enableAutoAdvancement: (settings?: Partial<AutoAdvancementSettings>) => void
  disableAutoAdvancement: () => void
  autoAdvanceIfReady: () => void
  clearAutoAdvanceTimeout: () => void
  
  // Network and retry actions
  setOnlineStatus: (isOnline: boolean) => void
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => void
  removePendingOperation: (operationId: string) => void
  retryPendingOperations: () => Promise<void>
  
  // Optimistic updates
  addOptimisticUpdate: (key: string, value: any) => void
  removeOptimisticUpdate: (key: string) => void
  
  // Enhanced error handling
  createError: (message: string, type: CheckoutError['type'], options?: Partial<CheckoutError>) => CheckoutError
  clearError: () => void
  
  // Utility actions
  reset: () => void
  canProceedToStep: (step: CheckoutStep) => boolean
  getNextStep: () => CheckoutStep | null
  getPrevStep: () => CheckoutStep | null
}

const initialState = {
  currentStep: 'address' as CheckoutStep,
  formData: {} as Partial<CheckoutFormData>,
  customerType: null,
  isLoading: false,
  error: null,
  stepValidation: {
    autoship: true,
    'customer-type': false,
    address: false,
    delivery: false,
    payment: false,
    review: false,
  },
  autoAdvancement: {
    enabled: true,
    delayMs: 1500,
    skipOptionalSteps: true,
    autoAdvanceOnSuccess: true,
  },
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingOperations: [],
  optimisticUpdates: {},
}

const stepOrder: CheckoutStep[] = ['autoship', 'customer-type', 'address', 'delivery', 'payment', 'review']

// Exponential backoff calculation
const calculateBackoffDelay = (retryCount: number): number => {
  return Math.min(1000 * Math.pow(2, retryCount), 30000) // Max 30 seconds
}

// Generate unique operation ID
const generateOperationId = (): string => {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const useCheckoutStorePhase3 = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentStep: (step: CheckoutStep) => {
        // Clear any pending auto-advancement when manually setting step
        get().clearAutoAdvanceTimeout()
        set({ currentStep: step })
      },
      
      nextStep: () => {
        const { currentStep } = get()
        const currentIndex = stepOrder.indexOf(currentStep)
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] })
        }
      },
      
      prevStep: () => {
        const { currentStep } = get()
        const currentIndex = stepOrder.indexOf(currentStep)
        if (currentIndex > 0) {
          set({ currentStep: stepOrder[currentIndex - 1] })
        }
      },
      
      updateFormData: (data: Partial<CheckoutFormData>) => {
        set((state) => ({
          formData: { ...state.formData, ...data }
        }))
      },
      
      setCustomerType: (type: CustomerType) => {
        set({ customerType: type })
      },
      
      setStepValid: (step: CheckoutStep, isValid: boolean) => {
        set((state) => {
          const newValidation = { ...state.stepValidation, [step]: isValid }
          
          // Clear any existing timeout to prevent conflicts
          if (state._autoAdvanceTimeout) {
            clearTimeout(state._autoAdvanceTimeout)
          }
          
          // Auto-advance if enabled and step just became valid
          // Add safeguards to prevent conflicts with manual navigation
          if (isValid && 
              state.autoAdvancement.enabled && 
              state.autoAdvancement.autoAdvanceOnSuccess &&
              state.currentStep === step && // Only auto-advance if this is the current step
              !state.isLoading) { // Don't auto-advance during loading states
            
            // Use a longer delay to avoid conflicts with user actions
            const timeoutId = setTimeout(() => {
              const currentState = get()
              
              // Double-check conditions are still valid and no navigation has occurred
              if (currentState.currentStep === step && 
                  currentState.stepValidation[step] &&
                  currentState.autoAdvancement.enabled &&
                  !currentState.isLoading &&
                  currentState._autoAdvanceTimeout === timeoutId) { // Ensure this is still the active timeout
                    
                console.log(`Auto-advancing from step ${step}`)
                currentState.autoAdvanceIfReady()
                
                // Clear the timeout ID after successful advancement
                set({ _autoAdvanceTimeout: undefined })
              }
            }, Math.max(state.autoAdvancement.delayMs, 2000)) // Minimum 2 second delay
            
            // Store timeout ID for cleanup if needed
            return { 
              stepValidation: newValidation,
              _autoAdvanceTimeout: timeoutId
            }
          }
          
          return { stepValidation: newValidation, _autoAdvanceTimeout: undefined }
        })
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setError: (error: CheckoutError | null) => {
        set({ error })
      },
      
      // Auto-advancement methods
      enableAutoAdvancement: (settings = {}) => {
        set((state) => ({
          autoAdvancement: { ...state.autoAdvancement, enabled: true, ...settings }
        }))
      },
      
      disableAutoAdvancement: () => {
        set((state) => ({
          autoAdvancement: { ...state.autoAdvancement, enabled: false }
        }))
      },
      
      autoAdvanceIfReady: () => {
        const { currentStep, stepValidation, autoAdvancement } = get()
        
        if (!autoAdvancement.enabled || !stepValidation[currentStep]) {
          return
        }
        
        const nextStep = get().getNextStep()
        if (nextStep) {
          get().setCurrentStep(nextStep)
        }
      },
      
      // Network and retry methods
      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline })
        
        // If we're back online, retry pending operations
        if (isOnline) {
          setTimeout(() => {
            get().retryPendingOperations()
          }, 1000)
        }
      },
      
      addPendingOperation: (operation) => {
        const operationWithId = {
          ...operation,
          id: generateOperationId(),
          timestamp: Date.now(),
          retryCount: 0,
        }
        
        set((state) => ({
          pendingOperations: [...state.pendingOperations, operationWithId]
        }))
        
        return operationWithId.id
      },
      
      removePendingOperation: (operationId: string) => {
        set((state) => ({
          pendingOperations: state.pendingOperations.filter(op => op.id !== operationId)
        }))
      },
      
      retryOperation: async (operationId: string) => {
        const { pendingOperations } = get()
        const operation = pendingOperations.find(op => op.id === operationId)
        
        if (!operation || operation.retryCount >= operation.maxRetries) {
          get().removePendingOperation(operationId)
          return
        }
        
        // Update retry count
        set((state) => ({
          pendingOperations: state.pendingOperations.map(op =>
            op.id === operationId
              ? { ...op, retryCount: op.retryCount + 1 }
              : op
          )
        }))
        
        // Wait for exponential backoff
        const delay = calculateBackoffDelay(operation.retryCount)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        try {
          // This would be implemented by the components using the store
          // For now, we just remove the operation
          get().removePendingOperation(operationId)
        } catch (error) {
          // If still failing, keep in queue for next retry
          console.warn(`Retry ${operation.retryCount + 1} failed for operation ${operationId}:`, error)
        }
      },
      
      retryPendingOperations: async () => {
        const { pendingOperations } = get()
        
        for (const operation of pendingOperations) {
          if (operation.retryCount < operation.maxRetries) {
            get().retryOperation(operation.id)
          } else {
            get().removePendingOperation(operation.id)
          }
        }
      },
      
      // Optimistic updates
      addOptimisticUpdate: (key: string, value: any) => {
        set((state) => ({
          optimisticUpdates: { ...state.optimisticUpdates, [key]: value }
        }))
      },
      
      removeOptimisticUpdate: (key: string) => {
        set((state) => {
          const { [key]: removed, ...rest } = state.optimisticUpdates
          return { optimisticUpdates: rest }
        })
      },
      
      // Enhanced error handling
      createError: (message: string, type: CheckoutError['type'], options = {}) => {
        const error: CheckoutError = {
          message,
          type,
          recoverable: type === 'network' || type === 'timeout',
          retryable: type === 'network' || type === 'timeout' || type === 'server',
          suggestedAction: type === 'network' 
            ? 'Kontrollige internetiühendust ja proovige uuesti'
            : type === 'timeout'
            ? 'Palun proovige uuesti - server ei vastanud õigeaegselt'
            : type === 'validation'
            ? 'Palun kontrollige sisestatud andmeid'
            : 'Palun proovige uuesti või võtke ühendust kasutajatoega',
          ...options,
        }
        
        get().setError(error)
        return error
      },
      
      clearError: () => {
        set({ error: null })
      },
      
      // Utility methods
      canProceedToStep: (step: CheckoutStep) => {
        const { stepValidation } = get()
        return stepValidation[step]
      },
      
      getNextStep: () => {
        const { currentStep } = get()
        const currentIndex = stepOrder.indexOf(currentStep)
        return currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null
      },
      
      getPrevStep: () => {
        const { currentStep } = get()
        const currentIndex = stepOrder.indexOf(currentStep)
        return currentIndex > 0 ? stepOrder[currentIndex - 1] : null
      },
      
      reset: () => {
        set(initialState)
      },
      
      clearAutoAdvanceTimeout: () => {
        const { _autoAdvanceTimeout } = get()
        if (_autoAdvanceTimeout) {
          clearTimeout(_autoAdvanceTimeout)
          set({ _autoAdvanceTimeout: undefined })
        }
      },
    }),
    {
      name: 'wufi-checkout-store-phase3',
      partialize: (state) => ({
        formData: state.formData,
        customerType: state.customerType,
        currentStep: state.currentStep,
        autoAdvancement: state.autoAdvancement,
      }),
    }
  )
)

// Hook for online status detection
export const useOnlineStatusPhase3 = () => {
  const setOnlineStatus = useCheckoutStorePhase3(state => state.setOnlineStatus)
  
  React.useEffect(() => {
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnlineStatus])
} 