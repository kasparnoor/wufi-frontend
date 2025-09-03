"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  retrieveCustomerDashboard,
  retrieveCustomerProfile,
  updateCustomerProfile,
  retrieveCustomerPets,
  updateCustomerPets,
  deleteCustomerPets,
  retrieveCustomerSubscriptions,
  retrieveCustomerSubscription,
  updateCustomerSubscription,
  quickSubscriptionAction,
  retrieveCustomerOrder,
  retrieveCustomerNotifications,
  updateCustomerNotifications,
  checkCustomerExists
} from "@lib/data/customer"
import { toast } from "react-hot-toast"
import { useCallback } from "react"

// ===== TYPES =====

interface Pet {
  name: string
  type: string
  breed?: string
  age?: number
  weight?: number
  notes?: string
}

interface SubscriptionUpdateData {
  action: 'pause' | 'resume' | 'change_date' | 'update_items' | 'cancel'
  reason?: string
  next_delivery_date?: string
  items?: Array<{ variant_id: string, quantity: number }>
}

interface QuickActionData {
  action?: 'skip' | 'pause' | 'resume' | 'cancel'
  interval?: string
  payment_method?: { stripe_payment_method_id: string }
  reason?: string
}

interface OrdersParams {
  limit?: number
  offset?: number
  status?: string
  start_date?: string
  end_date?: string
}

interface NotificationUpdateData {
  action: 'mark_read' | 'mark_unread' | 'mark_all_read'
  notification_ids?: string[]
}

// ===== CONSTANTS =====

const QUERY_KEYS = {
  DASHBOARD: ['customer-dashboard'],
  PROFILE: ['customer-profile'],
  PETS: ['customer-pets'],
  SUBSCRIPTIONS: ['customer-subscriptions'],
  SUBSCRIPTION: (id: string) => ['customer-subscription', id],
  ORDER: (id: string) => ['customer-order', id],
  NOTIFICATIONS: ['customer-notifications'],
} as const

const STALE_TIMES = {
  DASHBOARD: 5 * 60 * 1000, // 5 minutes
  PROFILE: 10 * 60 * 1000, // 10 minutes
  PETS: 15 * 60 * 1000, // 15 minutes (pets don't change often)
  SUBSCRIPTIONS: 5 * 60 * 1000, // 5 minutes
  SUBSCRIPTION: 2 * 60 * 1000, // 2 minutes
  ORDERS: 5 * 60 * 1000, // 5 minutes
  ORDER: 10 * 60 * 1000, // 10 minutes (orders don't change often)
  NOTIFICATIONS: 1 * 60 * 1000, // 1 minute (notifications should be fresh)
} as const

const REFETCH_INTERVALS = {
  DASHBOARD: 10 * 60 * 1000, // 10 minutes
  NOTIFICATIONS: 2 * 60 * 1000, // 2 minutes
} as const

// ===== UTILITY FUNCTIONS =====

const createRetryFunction = (maxRetries = 3) => {
  return (failureCount: number, error: Error) => {
    // Don't retry on auth errors
    if (error.message?.includes('Authentication required')) {
      return false
    }
    return failureCount < maxRetries
  }
}

const invalidateRelatedQueries = (queryClient: any, keys: readonly (readonly string[])[]) => {
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key })
  })
}

// ===== DASHBOARD HOOK =====

export const useDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: retrieveCustomerDashboard,
    staleTime: STALE_TIMES.DASHBOARD,
    refetchOnWindowFocus: true,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
    retry: createRetryFunction()
  })
}

// ===== CUSTOMER PROFILE HOOKS =====

export const useCustomerProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: retrieveCustomerProfile,
    staleTime: STALE_TIMES.PROFILE,
    retry: createRetryFunction()
  })
}

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient()
  
  const invalidateProfileQueries = useCallback(() => {
    invalidateRelatedQueries(queryClient, [
      QUERY_KEYS.PROFILE,
      QUERY_KEYS.DASHBOARD
    ])
  }, [queryClient])
  
  return useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: () => {
      invalidateProfileQueries()
      toast.success('Profiil edukalt uuendatud')
    },
    onError: (error: Error) => {
      console.error('Profile update failed:', error)
      toast.error('Profiili uuendamine ebaõnnestus: ' + error.message)
    }
  })
}

// ===== PET MANAGEMENT HOOKS =====

export const useCustomerPets = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PETS,
    queryFn: retrieveCustomerPets,
    staleTime: STALE_TIMES.PETS,
    retry: createRetryFunction()
  })
}

export const useUpdateCustomerPets = () => {
  const queryClient = useQueryClient()
  
  const invalidatePetQueries = useCallback(() => {
    invalidateRelatedQueries(queryClient, [
      QUERY_KEYS.PETS,
      QUERY_KEYS.DASHBOARD
    ])
  }, [queryClient])
  
  return useMutation({
    mutationFn: updateCustomerPets,
    onSuccess: () => {
      invalidatePetQueries()
      toast.success('Lemmikloomade andmed edukalt uuendatud')
    },
    onError: (error: Error) => {
      console.error('Pet update failed:', error)
      toast.error('Lemmikloomade andmete uuendamine ebaõnnestus: ' + error.message)
    }
  })
}

export const useDeleteCustomerPets = () => {
  const queryClient = useQueryClient()
  
  const invalidatePetQueries = useCallback(() => {
    invalidateRelatedQueries(queryClient, [
      QUERY_KEYS.PETS,
      QUERY_KEYS.DASHBOARD
    ])
  }, [queryClient])
  
  return useMutation({
    mutationFn: deleteCustomerPets,
    onSuccess: () => {
      invalidatePetQueries()
      toast.success('Kõik lemmikloomad eemaldatud')
    },
    onError: (error: Error) => {
      console.error('Pet deletion failed:', error)
      toast.error('Lemmikloomade eemaldamine ebaõnnestus: ' + error.message)
    }
  })
}

// ===== SUBSCRIPTION MANAGEMENT HOOKS =====

export const useCustomerSubscriptions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS,
    queryFn: retrieveCustomerSubscriptions,
    staleTime: STALE_TIMES.SUBSCRIPTIONS,
    refetchOnWindowFocus: true,
    retry: createRetryFunction()
  })
}

export const useCustomerSubscription = (subscriptionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTION(subscriptionId),
    queryFn: () => retrieveCustomerSubscription(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: STALE_TIMES.SUBSCRIPTION,
    retry: createRetryFunction()
  })
}

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ subscriptionId, updateData }: {
      subscriptionId: string
      updateData: SubscriptionUpdateData
    }) => updateCustomerSubscription(subscriptionId, updateData),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      invalidateRelatedQueries(queryClient, [
        QUERY_KEYS.SUBSCRIPTIONS,
        QUERY_KEYS.SUBSCRIPTION(variables.subscriptionId),
        QUERY_KEYS.DASHBOARD
      ])
      
      // Show success message based on action
      const actionMessages: Record<string, string> = {
        pause: 'Tellimus edukalt peatatud',
        resume: 'Tellimus edukalt taasaktiveeritud',
        change_date: 'Tarneaeg edukalt muudetud',
        update_items: 'Tellimuse sisu edukalt uuendatud',
        cancel: 'Tellimus edukalt tühistatud'
      }
      
      const message = actionMessages[variables.updateData.action] || 'Tellimus edukalt uuendatud'
      toast.success(message)
    },
    onError: (error: Error) => {
      console.error('Subscription update failed:', error)
      toast.error('Tellimuse uuendamine ebaõnnestus: ' + error.message)
    }
  })
}

// Link subscription to a pet by updating metadata via Next API route
export const useUpdateSubscriptionPet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ subscriptionId, petId, petName }: { subscriptionId: string, petId?: string, petName?: string }) => {
      const res = await fetch(`/api/me/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pet_id: petId, pet_name: petName })
      })
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
      return res.json()
    },
    onSuccess: () => {
      invalidateRelatedQueries(queryClient, [
        QUERY_KEYS.SUBSCRIPTIONS,
        QUERY_KEYS.DASHBOARD
      ])
      toast.success('Seos lemmikloomaga uuendatud')
    },
    onError: (e: Error) => {
      console.error('Failed to update subscription pet:', e)
      toast.error('Lemmikloomaga seostamine ebaõnnestus: ' + e.message)
    }
  })
}

export const useQuickSubscriptionAction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ subscriptionId, actionData }: {
      subscriptionId: string
      actionData: QuickActionData
    }) => quickSubscriptionAction(subscriptionId, actionData),
    onSuccess: (data, variables) => {
      invalidateRelatedQueries(queryClient, [
        QUERY_KEYS.SUBSCRIPTIONS,
        QUERY_KEYS.SUBSCRIPTION(variables.subscriptionId),
        QUERY_KEYS.DASHBOARD
      ])
      
      const actionMessages: Record<string, string> = {
        skip: 'Järgmine tarne edukalt vahele jäetud',
        pause: 'Tellimus edukalt peatatud',
        resume: 'Tellimus edukalt taasaktiveeritud',
        cancel: 'Tellimus edukalt tühistatud'
      }
      
      const action = variables.actionData.action
      if (action && actionMessages[action]) {
        toast.success(actionMessages[action])
      } else if (variables.actionData.interval) {
        toast.success('Tarnesagedus edukalt muudetud')
      } else if (variables.actionData.payment_method) {
        toast.success('Maksemeetod edukalt uuendatud')
      } else {
        toast.success('Tellimus edukalt uuendatud')
      }
    },
    onError: (error: Error) => {
      console.error('Quick subscription action failed:', error)
      toast.error('Toimingu teostamine ebaõnnestus: ' + error.message)
    }
  })
}

// ===== ORDER MANAGEMENT HOOKS =====

// Removed list endpoint from dashboard bundle to reduce duplicate fetching on dashboard

export const useCustomerOrder = (orderId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(orderId),
    queryFn: () => retrieveCustomerOrder(orderId),
    enabled: !!orderId,
    staleTime: STALE_TIMES.ORDER,
    retry: createRetryFunction()
  })
}

// ===== NOTIFICATION HOOKS =====

export const useCustomerNotifications = () => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: retrieveCustomerNotifications,
    staleTime: STALE_TIMES.NOTIFICATIONS,
    refetchOnWindowFocus: true,
    refetchInterval: REFETCH_INTERVALS.NOTIFICATIONS,
    retry: createRetryFunction()
  })
}

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient()
  
  const invalidateNotificationQueries = useCallback(() => {
    invalidateRelatedQueries(queryClient, [
      QUERY_KEYS.NOTIFICATIONS,
      QUERY_KEYS.DASHBOARD
    ])
  }, [queryClient])
  
  return useMutation({
    mutationFn: updateCustomerNotifications,
    onSuccess: () => {
      invalidateNotificationQueries()
    },
    onError: (error: Error) => {
      console.error('Notification update failed:', error)
      toast.error('Teatiste uuendamine ebaõnnestus: ' + error.message)
    }
  })
}



// ===== UTILITY HOOKS =====

export const useCheckCustomerExists = () => {
  return useMutation({
    mutationFn: checkCustomerExists,
    onError: (error: Error) => {
      console.error('Customer check failed:', error)
    }
  })
}

// ===== COMPOSITE HOOKS =====

/**
 * Hook that provides all dashboard-related data and mutations
 * This is the main hook for the customer dashboard component
 */
export const useCustomerDashboardData = () => {
  const dashboard = useDashboard()
  const profile = useCustomerProfile()
  const pets = useCustomerPets()
  const subscriptions = useCustomerSubscriptions()
  const notifications = useCustomerNotifications()
  // Recent orders are already included in dashboard payload; avoid duplicate fetches here
  
  const updateProfile = useUpdateCustomerProfile()
  const updatePets = useUpdateCustomerPets()
  const updateSubscription = useUpdateSubscription()
  const quickAction = useQuickSubscriptionAction()
  const updateNotifications = useUpdateNotifications()
  
  // Memoized refetch functions to prevent unnecessary re-renders
  const refetchFunctions = {
    refetchDashboard: dashboard.refetch,
    refetchProfile: profile.refetch,
    refetchPets: pets.refetch,
    refetchSubscriptions: subscriptions.refetch,
    refetchNotifications: notifications.refetch,
  }
  
  return {
    // Data
    dashboard: dashboard.data,
    profile: profile.data,
    pets: pets.data,
    subscriptions: subscriptions.data,
    notifications: notifications.data,
    
    // Loading states
    isLoading: dashboard.isLoading || profile.isLoading,
    isLoadingPets: pets.isLoading,
    isLoadingSubscriptions: subscriptions.isLoading,
    isLoadingNotifications: notifications.isLoading,
    
    // Error states
    error: dashboard.error || profile.error,
    petsError: pets.error,
    subscriptionsError: subscriptions.error,
    notificationsError: notifications.error,
    ordersError: undefined,
    
    // Mutations
    updateProfile,
    updatePets,
    updateSubscription,
    quickAction,
    updateNotifications,
    
    // Refetch functions
    ...refetchFunctions,
  }
} 