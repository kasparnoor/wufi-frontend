"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  const url = `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/orders/${id}?fields=*payment_collections.payments,*items,+items.metadata,*items.variant,*items.product,*shipping_address,*billing_address`
  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      next,
    })
    if (!res.ok) throw new Error(res.statusText)
    const data = (await res.json()) as HttpTypes.StoreOrderResponse
    return data.order
  } catch (err) {
    return medusaError(err)
  }
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  const qs = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    order: "-created_at",
    fields: "*items,+items.metadata,*items.variant,*items.product",
    ...Object.fromEntries(Object.entries(filters || {}).map(([k, v]) => [k, String(v)])),
  }).toString()
  const base = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  try {
    const res = await fetch(`${base}/store/orders?${qs}`, {
      method: "GET",
      headers,
      cache: "no-store",
      next,
    })
    if (!res.ok) throw new Error(res.statusText)
    const data = (await res.json()) as HttpTypes.StoreOrderListResponse
    return data.orders
  } catch (err) {
    return medusaError(err)
  }
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
