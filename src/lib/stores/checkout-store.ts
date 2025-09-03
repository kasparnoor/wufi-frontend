import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { HttpTypes } from '@medusajs/types'
import { CheckoutFormData } from '../schemas/checkout'

export type CheckoutStep = 'autoship' | 'customer-type' | 'address' | 'delivery' | 'payment' | 'review'
export type CustomerType = 'individual' | 'business'

interface CheckoutState {
  // Current checkout state
  currentStep: CheckoutStep
  formData: Partial<CheckoutFormData>
  customerType: CustomerType | null
  isLoading: boolean
  error: string | null
  
  // Step validation
  stepValidation: Record<CheckoutStep, boolean>
  
  // Actions
  setCurrentStep: (step: CheckoutStep) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: Partial<CheckoutFormData>) => void
  setCustomerType: (type: CustomerType) => void
  setStepValid: (step: CheckoutStep, isValid: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
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
}

const stepOrder: CheckoutStep[] = ['autoship', 'customer-type', 'address', 'delivery', 'payment', 'review']

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentStep: (step: CheckoutStep) => {
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
        set((state) => ({
          stepValidation: { ...state.stepValidation, [step]: isValid }
        }))
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setError: (error: string | null) => {
        set({ error })
      },
      
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'wufi-checkout-store',
      partialize: (state) => ({
        formData: state.formData,
        customerType: state.customerType,
        currentStep: state.currentStep,
      }),
    }
  )
) 