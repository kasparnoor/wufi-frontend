"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import logger from "@lib/util/logger"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

// Base API URL from config
const API_BASE_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

// ===== TYPES =====

interface ApiRequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
}

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



interface CustomerCheckResult {
  exists: boolean
  has_account?: boolean
  first_name?: string
}

// ===== UTILITIES =====

/**
 * Enhanced API request function with proper error handling and security
 */
const apiRequest = async (
  endpoint: string,
  options: ApiRequestOptions = {}
) => {
  const { 
    method = "GET", 
    body, 
    headers = {}, 
    requireAuth = true 
  } = options

  // Create timeout controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout for customer API calls

  try {
    // Get authentication headers
    const authHeaders = requireAuth ? await getAuthHeaders() : {}
    
    // Check if auth is required but not available
    if (requireAuth && !('authorization' in authHeaders)) {
      clearTimeout(timeoutId)
      throw new Error("Authentication required")
    }

    // Prepare headers
    const requestHeaders = {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      ...authHeaders,
      ...headers,
    }

    // Make the request with timeout
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      cache: method === "GET" ? "force-cache" : "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    
    // Enhanced error logging for debugging
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn(`API Request timed out: ${method} ${endpoint}`)
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    
    logger.error(`API Request failed: ${method} ${endpoint}`, {
      error: error instanceof Error ? error.message : error,
      requireAuth,
      endpoint
    })
    throw error
  }
}

// Try to exchange a bare login token for a full token that includes actor_id.
const refreshAuthTokenIfPossible = async (tokenStr: string | null | undefined): Promise<string | null> => {
  if (!tokenStr) return null
  // Try /auth/refresh-token then /auth/refresh
  const endpoints = ["/auth/refresh-token", "/auth/refresh"]
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_BASE_URL}${ep}`, {
        method: "POST",
        headers: { authorization: `Bearer ${tokenStr}`, accept: "application/json" },
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({} as any))
        if (data?.token && typeof data.token === "string") {
          return data.token
        }
      }
    } catch {}
  }
  return tokenStr
}

/**
 * Build query string from parameters object
 */
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Revalidate customer-related cache tags
 */
const revalidateCustomerCache = async () => {
  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)
}

// ===== AUTHENTICATION =====

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders || !('authorization' in authHeaders)) {
      logger.debug("[AUTH] No auth headers found in retrieveCustomer")
      return null
    }

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    // Debug: decode JWT to verify actor type
    try {
      const raw = (authHeaders as any).authorization?.toString() || ""
      const jwt = raw.startsWith("Bearer ") ? raw.slice(7) : raw
      const parts = jwt.split(".")
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"))
        logger.debug("[AUTH] JWT payload:", {
          actor_type: payload?.actor_type || payload?.typ,
          actor_id: payload?.actor_id || payload?.sub,
          exp: payload?.exp,
        })
      }
    } catch {}

    try {
      // Retrieve current customer using the standard endpoint
      const url = `${API_BASE_URL}/store/customers/me`
      const res = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(headers as Record<string, string>),
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        cache: "no-store",
        next,
      })
      if (!res.ok) {
        let msg = res.statusText || `HTTP ${res.status}`
        try {
          const t = await res.text()
          msg = t || msg
        } catch {}
        throw new Error(msg)
      }
      const data = (await res.json()) as { customer: HttpTypes.StoreCustomer }
      logger.debug("[AUTH] Customer retrieved successfully")
      return data.customer
    } catch (error) {
      logger.warn("[AUTH] Failed to retrieve customer", error)
      return null
    }
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  await revalidateCustomerCache()
  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    // 1) Check if a customer already exists for this email and whether they have an account
    let existsResult: { exists: boolean; has_account?: boolean } = { exists: false }
    try {
      existsResult = await (async () => {
        const res = await apiRequest(`/store/customers/check-exists?email=${encodeURIComponent(customerForm.email)}`, {
          method: "GET",
          requireAuth: false,
        })
        return res
      })()
    } catch {
      // Ignore and assume doesn't exist if the endpoint is unavailable
      existsResult = { exists: false }
    }

    // 2) If the email already has an active account, try logging in directly
    if (existsResult.exists && existsResult.has_account) {
      try {
        const token = await sdk.auth.login("customer", "emailpass", {
          email: customerForm.email,
          password,
        })
        let tokenStr = typeof token === "string" ? token : (token as any)?.token || (token as any)?.access_token
        // Attempt to refresh to ensure actor_id is embedded
        try {
          const refreshed = await sdk.client.fetch<{ token: string }>(`/auth/refresh-token`, {
            method: "POST",
            headers: { authorization: `Bearer ${tokenStr}` },
            cache: "no-store",
          })
          if (refreshed?.token) tokenStr = refreshed.token
        } catch {}
        if (!tokenStr) {
          return "Login failed"
        }
        await setAuthToken(tokenStr)
        await revalidateCustomerCache()
        await transferCart()
        const customer = await retrieveCustomer()
        return customer
      } catch (e: any) {
        // Wrong password – guide user to login/forgot password
        return "Selle e-postiga konto juba eksisteerib. Palun logige sisse või lähtestage parool."
      }
    }

    // 3) If the email exists but no account yet, send account setup email instead of registering
    if (existsResult.exists && !existsResult.has_account) {
      try {
        await apiRequest("/store/customers/account-setup", {
          method: "PUT",
          body: { email: customerForm.email },
          requireAuth: false,
        })
        return "Leidsime varasema tellimuse selle e-postiga. Saatsime konto aktiveerimise lingi teie e-postile. Palun avage link oma konto loomiseks."
      } catch (e: any) {
        // Fall through to try regular registration below if setup email fails
      }
    }

    // 4) Proceed with standard registration for brand-new emails
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })
    {
      let tokenStr = typeof token === "string" ? token : (token as any)?.token || (token as any)?.access_token
      tokenStr = await refreshAuthTokenIfPossible(tokenStr)
      if (tokenStr) {
        await setAuthToken(tokenStr)
      }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })
    {
      let tokenStr = typeof loginToken === "string" ? loginToken : (loginToken as any)?.token || (loginToken as any)?.access_token
      tokenStr = await refreshAuthTokenIfPossible(tokenStr)
      if (!tokenStr) {
        return "Login failed"
      }
      await setAuthToken(tokenStr)
    }
    await revalidateCustomerCache()
    await transferCart()

    return createdCustomer
  } catch (error: any) {
    // If registration fails because identity already exists, try the graceful fallbacks
    const message = String(error)
    if (message.toLowerCase().includes("identity") && message.toLowerCase().includes("exists")) {
      try {
        // Attempt login with provided password
        const token = await sdk.auth.login("customer", "emailpass", {
          email: (formData.get("email") as string) || "",
          password: (formData.get("password") as string) || "",
        })
        let tokenStr = typeof token === "string" ? token : (token as any)?.token || (token as any)?.access_token
        tokenStr = await refreshAuthTokenIfPossible(tokenStr)
        if (!tokenStr) {
          return "Login failed"
        }
        await setAuthToken(tokenStr)
        await revalidateCustomerCache()
        await transferCart()
        const customer = await retrieveCustomer()
        return customer
      } catch {
        // If login fails, send account setup email
        try {
          await apiRequest("/store/customers/account-setup", {
            method: "PUT",
            body: { email: formData.get("email") as string },
            requireAuth: false,
          })
          return "Selle e-postiga konto võib juba eksisteerida. Saatsime konto taastamise/aktiveerimise lingi teie e-postile."
        } catch {
          return "Selle e-postiga on juba identiteet olemas. Palun logige sisse või lähtestage parool."
        }
      }
    }
    return message
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const countryCode = (formData.get("country_code") as string) || "ee"

  try {
    // Prefer backend endpoint that mints a token with actor_id
    let tokenStr: string | null = null
    try {
      const resp = await fetch(`${API_BASE_URL}/store/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      })
      if (resp.ok) {
        const data = await resp.json()
        tokenStr = data?.token || null
      }
    } catch {}
    if (!tokenStr) {
      // fallback to SDK auth
      const token = await sdk.auth.login("customer", "emailpass", { email, password })
      tokenStr = typeof token === "string" ? token : (token as any)?.token || (token as any)?.access_token
      tokenStr = await refreshAuthTokenIfPossible(tokenStr)
    }
    if (!tokenStr) {
      return "Invalid email or password"
    }
    
    // Set the token in cookies for server-side operations
    await setAuthToken(tokenStr)
    
    // Clear any cached data that might have stale auth state
    await revalidateCustomerCache()
    
    // Also clear cart cache to ensure fresh state
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    // Don't transfer cart immediately - let the client handle that after redirect
    
    // Return success and let the client navigate; avoids NEXT_REDIRECT surfacing in UI.
    return { success: true, countryCode }
  } catch (error: any) {
    return error.message || "Login failed"
  }
}

export async function signout(countryCode: string) {
  try {
    // Logout from backend
    await apiRequest("/auth/customer/session", {
      method: "DELETE",
      requireAuth: true,
    })
  } catch (error) {
    console.warn("Failed to logout from backend:", error)
  }

  await sdk.auth.logout()
  await removeAuthToken()
  await revalidateCustomerCache()
  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

// ===== PASSWORD MANAGEMENT =====

export async function requestPasswordReset(email: string) {
  try {
    await apiRequest("/store/auth/password/forgot", {
      method: "POST",
      body: { email },
      requireAuth: false,
    })
    return { success: true }
  } catch (e) {
    // Always normalize
    return { success: true }
  }
}

export async function resetPassword(payload: { email: string; token: string; new_password: string }) {
  const res = await apiRequest("/store/auth/password/reset", {
    method: "POST",
    body: payload,
    requireAuth: false,
  })
  return res
}

export async function changeMyPassword(formData: FormData) {
  const old_password = formData.get("old_password") as string
  const new_password = formData.get("new_password") as string
  const confirm_password = formData.get("confirm_password") as string
  if (!old_password || !new_password || new_password !== confirm_password) {
    return "Kontrolli sisestatud paroole"
  }
  try {
    await apiRequest("/store/customers/me/password", {
      method: "POST",
      body: { old_password, new_password },
    })
    return { success: true }
  } catch (e: any) {
    return e?.message || "Parooli muutmine ebaõnnestus"
  }
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

// ===== DASHBOARD =====

/**
 * Get complete customer dashboard data from backend
 */
export const retrieveCustomerDashboard = async () => {
  try {
    const response = await apiRequest("/store/customers/me/dashboard")
    return response.dashboard
  } catch (error) {
    logger.error("Failed to retrieve dashboard:", error)
    return null
  }
}

// ===== CUSTOMER PROFILE =====

/**
 * Get customer profile with enhanced data
 */
export const retrieveCustomerProfile = async () => {
  try {
    // Use the standard endpoint for the current customer
    const response = await apiRequest("/store/customers/me")
    return response.customer
  } catch (error) {
    logger.error("Failed to retrieve customer profile:", error)
    return null
  }
}

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (profileData: {
  first_name?: string
  last_name?: string
  phone?: string
}) => {
  try {
    const response = await apiRequest("/store/customers/me", {
      method: "PATCH",
      body: profileData,
    })
    
    await revalidateCustomerCache()
    return response.customer
  } catch (error) {
    console.error("Failed to update customer profile:", error)
    throw error
  }
}

// ===== PET MANAGEMENT =====

/**
 * Get customer pets
 */
export const retrieveCustomerPets = async () => {
  try {
    const response = await apiRequest("/store/customers/me/pets")
    return response
  } catch (error) {
    logger.error("Failed to retrieve pets:", error)
    return { pets: [], count: 0 }
  }
}

/**
 * Update customer pets
 */
export const updateCustomerPets = async (pets: Pet[]) => {
  try {
    const response = await apiRequest("/store/customers/me/pets", {
      method: "POST",
      body: { pets },
    })
    
    await revalidateCustomerCache()
    return response
  } catch (error) {
    logger.error("Failed to update pets:", error)
    throw error
  }
}

/**
 * Delete all customer pets
 */
export const deleteCustomerPets = async () => {
  try {
    const response = await apiRequest("/store/customers/me/pets", {
      method: "DELETE",
    })
    
    await revalidateCustomerCache()
    return response
  } catch (error) {
    logger.error("Failed to delete pets:", error)
    throw error
  }
}

// ===== SUBSCRIPTION MANAGEMENT =====

/**
 * List customer subscriptions
 */
export const retrieveCustomerSubscriptions = async () => {
  try {
    const response = await apiRequest("/store/subscriptions")
    return response
  } catch (error) {
    logger.error("Failed to retrieve subscriptions:", error)
    return { subscriptions: [] }
  }
}

/**
 * Get detailed subscription information
 */
export const retrieveCustomerSubscription = async (subscriptionId: string) => {
  try {
    const response = await apiRequest(`/store/customers/me/subscriptions/${subscriptionId}`)
    return response.subscription
  } catch (error) {
    logger.error("Failed to retrieve subscription:", error)
    return null
  }
}

/**
 * Modify subscription (comprehensive endpoint)
 */
export const updateCustomerSubscription = async (
  subscriptionId: string,
  updateData: SubscriptionUpdateData
) => {
  try {
    const response = await apiRequest(`/store/customers/me/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: updateData,
    })
    
    await revalidateCustomerCache()
    return response
  } catch (error) {
    logger.error("Failed to update subscription:", error)
    throw error
  }
}

/**
 * Quick subscription actions
 */
export const quickSubscriptionAction = async (
  subscriptionId: string,
  actionData: QuickActionData
) => {
  try {
    const response = await apiRequest(`/store/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: actionData,
    })
    
    await revalidateCustomerCache()
    return response
  } catch (error) {
    logger.error("Failed to perform subscription action:", error)
    throw error
  }
}

// ===== ORDER MANAGEMENT =====

/**
 * List customer orders with filtering
 */
export const retrieveCustomerOrders = async (params: OrdersParams = {}) => {
  try {
    const queryString = buildQueryString(params)
    const response = await apiRequest(`/store/customers/me/orders${queryString}`)
    return response
  } catch (error) {
    logger.error("Failed to retrieve orders:", error)
    return { orders: [], count: 0 }
  }
}

/**
 * Get detailed order information
 */
export const retrieveCustomerOrder = async (orderId: string) => {
  try {
    const response = await apiRequest(`/store/customers/me/orders/${orderId}`)
    return response.order
  } catch (error) {
    logger.error("Failed to retrieve order:", error)
    return null
  }
}

// ===== NOTIFICATIONS =====

/**
 * List customer notifications
 */
export const retrieveCustomerNotifications = async () => {
  try {
    const response = await apiRequest("/store/customers/me/notifications")
    return response
  } catch (error) {
    logger.error("Failed to retrieve notifications:", error)
    return { notifications: [], unread_count: 0, urgent_count: 0 }
  }
}

/**
 * Update notifications (mark as read/unread)
 */
export const updateCustomerNotifications = async (updateData: NotificationUpdateData) => {
  try {
    const response = await apiRequest("/store/customers/me/notifications", {
      method: "PATCH",
      body: updateData,
    })
    
    await revalidateCustomerCache()
    return response
  } catch (error) {
    logger.error("Failed to update notifications:", error)
    throw error
  }
}

// ===== CUSTOMER MANAGEMENT =====

/**
 * Check if customer exists and get basic info
 */
export const checkCustomerExists = async (email: string): Promise<CustomerCheckResult> => {
  try {
    // First try the dedicated check endpoint using POST method
    const response = await apiRequest("/store/customers/check-exists", {
      method: "POST",
      body: { email },
      requireAuth: false,
    })
    return response
  } catch (error) {
    // If POST method fails for any reason, try GET method with query parameter
    logger.debug("POST check endpoint failed, trying GET method")

    try {
      const getResponse = await apiRequest(`/store/customers/check-exists?email=${encodeURIComponent(email)}`, {
        method: "GET",
        requireAuth: false,
      })
      return getResponse
    } catch (getError) {
      logger.warn("GET check endpoint also failed:", getError)
      
      // Final fallback: try to search customers
      try {
        const searchResponse = await apiRequest(`/store/customers?email=${encodeURIComponent(email)}`, {
          method: "GET",
          requireAuth: false,
        })
        
        const exists = searchResponse.customers && searchResponse.customers.length > 0
        return {
          exists,
          has_account: false,
          first_name: exists ? searchResponse.customers[0]?.first_name : undefined
        }
      } catch (searchError) {
        logger.warn("Customer search alternative also failed:", searchError)
        // Graceful fallback - assume customer doesn't exist
        return { exists: false, has_account: false }
      }
    }
  }
}

// ===== ADDRESS MANAGEMENT =====

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const customer = await retrieveCustomer()

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      await revalidateCustomerCache()
      return customer
    })
    .catch(medusaError)
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<any> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      await revalidateCustomerCache()
      return { success: true }
    })
    .catch(medusaError)
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId = formData.get("address_id") as string

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async ({ customer }) => {
      await revalidateCustomerCache()
      return customer
    })
    .catch(medusaError)
}
