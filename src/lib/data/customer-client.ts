// Client-safe data accessors that call Next.js API routes under /api/me/*

export const apiGet = async <T = any>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store", credentials: "same-origin" })
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "")
    throw new Error(errTxt || res.statusText)
  }
  return res.json()
}

export const apiMutate = async <T = any>(url: string, method: string, body?: any): Promise<T> => {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials: "same-origin",
  })
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "")
    throw new Error(errTxt || res.statusText)
  }
  return res.json()
}

// Dashboard bundle
export const getDashboard = async () => apiGet<{ dashboard: any }>("/api/me/dashboard").then(d => d.dashboard)

// Profile
export const getProfile = async () => apiGet<{ customer: any }>("/api/me/profile").then(d => d.customer)
export const patchProfile = async (payload: any) => apiMutate<{ customer: any }>("/api/me/profile", "PATCH", payload)

// Pets
export const getPets = async () => apiGet("/api/me/pets")
export const postPets = async (payload: any) => apiMutate("/api/me/pets", "POST", payload)
export const deletePets = async () => apiMutate("/api/me/pets", "DELETE")

// Subscriptions
export const getSubscriptions = async () => apiGet("/api/me/subscriptions")
export const getSubscription = async (id: string) => apiGet<{ subscription: any }>(`/api/me/subscriptions/${id}`).then(d => d.subscription)
export const patchSubscription = async (id: string, payload: any) => apiMutate(`/api/me/subscriptions/${id}`, "PATCH", payload)
export const patchQuickAction = async (id: string, payload: any) => apiMutate(`/api/me/subscriptions/${id}/quick`, "PATCH", payload)

// Orders
export const getOrders = async (qs = "") => apiGet(`/api/me/orders${qs}`)
export const getOrder = async (id: string) => apiGet<{ order: any }>(`/api/me/orders/${id}`).then(d => d.order)

// Notifications
export const getNotifications = async () => apiGet("/api/me/notifications")
export const patchNotifications = async (payload: any) => apiMutate("/api/me/notifications", "PATCH", payload)

// Customer existence (public)
export const postCheckExists = async (email: string) => apiMutate("/api/me/check-exists", "POST", { email })


