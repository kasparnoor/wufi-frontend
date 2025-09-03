"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { TimeoutHandler, checkoutTimeouts } from "@lib/util/timeout-handler"
import logger from "@lib/util/logger"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, signal?: AbortSignal) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.variant, *items.variant.product, +items.variant.product.metadata, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
      },
      headers,
      next,
      cache: "force-cache",
      signal,
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

// Secure auto-restore: if user is authenticated and cookie cart is missing, try to reuse their latest open cart
export async function retrieveOrRestoreCart(countryCode: string) {
  let cart = await retrieveCart()
  if (cart) return cart

  // Only attempt restore for authenticated users
  const auth = await getAuthHeaders()
  if (!('authorization' in auth)) return null

  try {
    // Query latest incomplete carts for the current customer
    const res = await sdk.client.fetch<{ carts: any[] }>(`/store/customers/me/carts`, {
      method: 'GET',
      headers: { ...(auth as any) },
      cache: 'no-store',
      query: {
        limit: 1,
        status: 'open',
      },
    })
    const candidate = res?.carts?.[0]
    if (!candidate) return null

    // Revalidate basics: items present
    if (!candidate.items || candidate.items.length === 0) return null

    // Re-set cookie and return
    await setCartId(candidate.id)
    return await retrieveCart(candidate.id)
  } catch {
    return null
  }
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    // Get the default sales channel if available from backend
    const cartData: any = { region_id: region.id }
    
    // Try to add a default sales channel if backend requires it
    try {
      const cartResp = await sdk.store.cart.create(
        cartData,
        {},
        headers
      )
      cart = cartResp.cart
    } catch (error: any) {
      // If sales_channel_id is required, try with a default one
      if (error.message?.includes('sales_channel_id')) {
        logger.warn('Backend requires sales_channel_id, trying with default...')
        // You may need to hardcode or fetch the sales channel ID
        // Replace 'sc_default' with your actual default sales channel ID
        cartData.sales_channel_id = process.env.NEXT_PUBLIC_DEFAULT_SALES_CHANNEL_ID || 'sc_default'
        const cartResp = await sdk.store.cart.create(
          cartData,
          {},
          headers
        )
        cart = cartResp.cart
      } else {
        throw error
      }
    }

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
  metadata,
}: {
  variantId: string
  quantity: number
  countryCode: string
  metadata?: Record<string, any>
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  // Fast path: try to reuse existing cart ID from cookies to avoid region lookup
  const existingCartId = await getCartId()
  let cartId = existingCartId

  // If no existing cart, create the minimal cart with region to avoid extra fetches
  if (!cartId) {
    const region = await getRegion(countryCode)
    if (!region) {
      throw new Error(`Region not found for country code: ${countryCode}`)
    }

    const headersCreate = {
      ...(await getAuthHeaders()),
    }

    const cartResp = await sdk.store.cart.create({ region_id: region.id }, {}, headersCreate)
    cartId = cartResp.cart.id
    await setCartId(cartId)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Use a timeout wrapper to cap perceived latency
  await checkoutTimeouts.cartOperation(
    (_signal) => sdk.store.cart
    .createLineItem(
      cartId!,
      {
        variant_id: variantId,
        quantity,
        metadata,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError),
    "Adding item to cart"
  )
}

export async function updateLineItem({
  lineId,
  quantity,
  metadata,
}: {
  lineId: string
  quantity?: number
  metadata?: Record<string, any>
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const body: any = {}
  if (typeof quantity === "number") {
    body.quantity = quantity
  }
  if (metadata) {
    body.metadata = metadata
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, body, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function updateLineItemMetadata({
  lineId,
  metadata,
  quantity,
}: {
  lineId: string
  metadata: Record<string, any>
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item metadata")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item metadata")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Only update metadata, but quantity is required by the API
  await sdk.store.cart
    .updateLineItem(cartId, lineId, { metadata, quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    return await checkoutTimeouts.cartOperation(
      (_signal) => sdk.store.cart
        .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
        .then(async () => {
          const cartCacheTag = await getCacheTag("carts")
          revalidateTag(cartCacheTag)
        }),
      "Setting shipping method"
    )
  } catch (error) {
    logger.error("Error setting shipping method:", error)
    medusaError(error)
  }
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    return await checkoutTimeouts.paymentOperation(
      (_signal) => sdk.store.payment
        .initiatePaymentSession(cart, data, {}, headers)
        .then(async (resp) => {
          const cartCacheTag = await getCacheTag("carts")
          revalidateTag(cartCacheTag)
          return resp
        }),
      "Initializing payment session"
    )
  } catch (error) {
    logger.error("Error initiating payment session:", error)
    medusaError(error)
  }
}

/**
 * Authorizes a payment session after successful Stripe payment
 * This approach may not be necessary for Stripe as the authorization might happen automatically
 * @param paymentCollectionId - The payment collection ID containing the payment session
 * @param paymentSessionId - The payment session ID to authorize
 * @returns The authorized payment session
 */
export async function authorizePaymentSession(paymentCollectionId: string, paymentSessionId: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  logger.debug('Authorizing payment session:', { paymentCollectionId, paymentSessionId })

  // For Stripe payments, the authorization might happen automatically via webhooks
  // Let's try multiple endpoint structures to find the correct one
  const endpoints = [
    `/store/payment-collections/${paymentCollectionId}/sessions/${paymentSessionId}/authorize`,
    `/store/payment-collections/${paymentCollectionId}/payment-sessions/${paymentSessionId}/authorize`,
    `/store/payment-collections/${paymentCollectionId}/sessions/batch/authorize` // Batch endpoint with single session
  ]
  
  for (const endpoint of endpoints) {
    try {
      logger.debug(`Trying endpoint: ${endpoint}`)
      
      let requestBody = {}
      if (endpoint.includes('batch')) {
        // For batch endpoint, we need to send session_ids array
        requestBody = { session_ids: [paymentSessionId] }
      }
      
      const result = await sdk.client
        .fetch(endpoint, {
          method: "POST",
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
        })
      
      logger.debug('Payment session authorized successfully:', result)
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return result
    } catch (endpointError: any) {
      logger.warn(`Endpoint ${endpoint} failed:`, endpointError)
      
      // If this is a 404, try the next endpoint
      if (endpointError.status === 404) {
        continue
      } else {
        // If it's not a 404, it might be a different issue - throw it
        throw medusaError(endpointError)
      }
    }
  }
  
  // If all endpoints failed with 404, this might not be the right approach for Stripe
  logger.warn('All authorization endpoints failed - Stripe payments might authorize automatically')
  throw new Error('Payment session authorization endpoints not found - this might be expected for Stripe payments that authorize automatically')
}

/**
 * Completes the full Stripe payment flow with proper Medusa integration
 * 1. Stripe payment confirmation
 * 2. Payment session authorization (MISSING STEP)  
 * 3. Cart completion
 * @param cartId - The cart ID
 * @param paymentIntentId - The Stripe payment intent ID
 * @returns boolean indicating if the flow completed successfully
 */
export async function completeStripePaymentFlow(cartId: string, paymentIntentId: string) {
  try {
    logger.debug("Starting complete Stripe payment flow:", { cartId, paymentIntentId });

    // Always attempt an explicit authorization first – it's a no-op if the
    // session is already authorized via Stripe webhook.

    const cart = await retrieveCart(cartId);
    if (!cart?.payment_collection) {
      throw new Error("No payment collection found on cart");
    }

    const stripeSession = cart.payment_collection.payment_sessions?.find(
      (session) => session.provider_id === "pp_stripe_stripe" && session.status === "pending"
    );

    if (stripeSession) {
      try {
        await authorizePaymentSession(cart.payment_collection.id, stripeSession.id);
      } catch (e) {
        // Most of the time Stripe webhooks will authorize automatically. Log and continue.
        logger.warn("Explicit session authorization failed or not needed:", (e as any)?.message || e);
      }
    }

    // Wait (with back-off) for Medusa to mark the collection as authorised. This
    // relies on Stripe webhooks or the explicit call above.
    const isAuthorized = await waitForPaymentCollectionAuthorization(cartId, paymentIntentId);

    logger.debug("Stripe payment flow completed. Authorized:", isAuthorized);

    return isAuthorized;
  } catch (error: any) {
    logger.error("completeStripePaymentFlow failed:", error);
    throw error;
  }
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      return "No form data found when setting addresses"
    }
    const cartId = getCartId()
    if (!cartId) {
      return "No existing cart found when setting addresses"
    }

    const deliveryType = formData.get("delivery_type")
    const isPakiautomaat = deliveryType === "pakiautomaat"
    
    // For pakiautomaat, ensure we have proper address data
    let city = formData.get("shipping_address.city") || ""
    let postalCode = formData.get("shipping_address.postal_code") || ""
    
    if (isPakiautomaat) {
      // Ensure pakiautomaat deliveries have default city and postal code
      city = city || "Tallinn"
      postalCode = postalCode || "10000"
    }

    // Extract shipping address metadata from FormData
    const shippingMetadata: Record<string, any> = {}
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (key.startsWith('shipping_address.metadata.')) {
        const metadataKey = key.replace('shipping_address.metadata.', '')
        shippingMetadata[metadataKey] = value
      }
    })

    // Extract billing address metadata from FormData
    const billingMetadata: Record<string, any> = {}
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (key.startsWith('billing_address.metadata.')) {
        const metadataKey = key.replace('billing_address.metadata.', '')
        billingMetadata[metadataKey] = value
      }
    })

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name") || "",
        last_name: formData.get("shipping_address.last_name") || "",
        address_1: formData.get("shipping_address.address_1") || "",
        address_2: formData.get("shipping_address.address_2") || "",
        company: formData.get("shipping_address.company") || "",
        postal_code: postalCode,
        city: city,
        country_code: formData.get("shipping_address.country_code") || "",
        province: formData.get("shipping_address.province") || "",
        phone: formData.get("shipping_address.phone") || "",
        // Include metadata in shipping address where backend expects it
        metadata: {
          ...shippingMetadata,
          // Fallback metadata for pakiautomaat if not provided in FormData
          ...(isPakiautomaat && !shippingMetadata.delivery_type && {
            delivery_type: "pakiautomaat",
            pakiautomaat_location: formData.get("shipping_address.address_1") || "",
            is_pakiautomaat: "true"
          })
        }
      },
      email: formData.get("email") || "",
      // Keep cart-level metadata for courier instructions
      metadata: {
        courier_instructions: formData.get("courier_instructions") || "",
        delivery_type: deliveryType || "",
      },
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") {
      data.billing_address = {
        ...data.shipping_address,
        // Use separate billing metadata if provided, otherwise use shipping metadata
        metadata: Object.keys(billingMetadata).length > 0 ? billingMetadata : data.shipping_address.metadata
      }
    } else {
      data.billing_address = {
        first_name: formData.get("billing_address.first_name") || "",
        last_name: formData.get("billing_address.last_name") || "",
        address_1: formData.get("billing_address.address_1") || "",
        address_2: formData.get("billing_address.address_2") || "",
        company: formData.get("billing_address.company") || "",
        postal_code: formData.get("billing_address.postal_code") || "",
        city: formData.get("billing_address.city") || "",
        country_code: formData.get("billing_address.country_code") || "",
        province: formData.get("billing_address.province") || "",
        phone: formData.get("billing_address.phone") || "",
        // Include billing metadata
        metadata: billingMetadata
      }
    }
    
    await updateCart(data)
    
    // Return null for success - let the client handle navigation
    return null
  } catch (e: any) {
    logger.error("Error in setAddresses:", e)
    return e.message || "An error occurred while saving addresses"
  }
}

/**
 * Waits for payment collection to be authorized after successful Stripe payment
 * This is the proper approach according to Medusa documentation
 * @param cartId - The cart ID containing the payment collection
 * @param paymentIntentId - The Stripe payment intent ID (for logging)
 * @returns boolean indicating if the payment collection was authorized
 */
export async function waitForPaymentCollectionAuthorization(cartId: string, paymentIntentId: string) {
  logger.debug('Waiting for payment collection to be authorized:', {
    cartId,
    paymentIntentId
  })
  
  try {
    return await checkoutTimeouts.paymentOperation(
      async (_signal) => {
        const maxRetries = 4  // Reduced from 5
        const baseDelay = 1500  // Reduced from 2000ms
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            logger.debug(`Checking payment collection status (attempt ${attempt}/${maxRetries})...`)
            
            const cart = await retrieveCart(cartId, _signal)
            if (!cart?.payment_collection) {
              logger.warn('No payment collection found in cart')
              continue
            }
            
            logger.debug(`Payment collection status: ${cart.payment_collection.status}`)
            
            // Check if payment collection is authorized
            if (cart.payment_collection.status === 'authorized') {
              logger.debug('Payment collection verified as authorized!')
              return true
            }
            
            // For Stripe, also check if we have any authorized payment sessions as fallback
            const authorizedSession = cart.payment_collection.payment_sessions?.find(
              (s: any) => s.status === 'authorized' && s.provider_id === "pp_stripe_stripe"
            )
            
            if (authorizedSession) {
              logger.debug('Found authorized Stripe payment session as fallback')
              return true
            }
            
            // Wait with shorter, fixed delays (1.5s each instead of increasing)
            if (attempt < maxRetries) {
              const delay = baseDelay  // Fixed delay instead of increasing
              logger.debug(`Waiting ${delay}ms before next attempt...`)
              await new Promise(resolve => setTimeout(resolve, delay))
            }
            
          } catch (error) {
            logger.error(`Payment collection check attempt ${attempt} failed:`, error)
            
            if (attempt < maxRetries) {
              const delay = baseDelay
              await new Promise(resolve => setTimeout(resolve, delay))
            }
          }
        }
        
        logger.warn('Payment collection authorization timeout after maximum retries')
        return false
      },
      "Waiting for payment collection authorization"
    )
  } catch (error) {
    if (TimeoutHandler.isTimeoutError(error)) {
      logger.warn('Payment collection authorization timed out, but this may be expected')
      return false
    }
    throw error
  }
}

/**
 * @deprecated Use waitForPaymentCollectionAuthorization instead
 * Waits for Stripe payment session to be authorized after successful payment
 * This handles the timing gap between Stripe confirmation and Medusa session update
 * @param cartId - The cart ID containing the payment session
 * @param paymentIntentId - The Stripe payment intent ID (for logging)
 * @returns boolean indicating if the session was authorized
 */
export async function waitForStripePaymentAuthorization(cartId: string, paymentIntentId: string) {
  logger.debug('Using deprecated waitForStripePaymentAuthorization, consider using waitForPaymentCollectionAuthorization')
  return waitForPaymentCollectionAuthorization(cartId, paymentIntentId)
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @param bypassPaymentValidation - optional - Skip payment validation for confirmed payments
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string, bypassPaymentValidation?: boolean) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  // Skip validation if explicitly bypassed (for confirmed Stripe payments)
  if (!bypassPaymentValidation) {
    // Validate payment sessions before attempting order completion with retry logic
    const maxRetries = 3  // Reduced from 5 to 3
    let isPaymentValid = false
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      logger.debug(`Validating payment session (attempt ${attempt}/${maxRetries})...`)
      
      try {
        isPaymentValid = await validatePaymentSessionsBeforeOrder(id)
        if (isPaymentValid) {
          logger.debug('Payment session validation successful')
          break
        }
      } catch (error) {
        logger.warn(`Payment validation attempt ${attempt} failed:`, error)
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        logger.debug('Waiting before retry...')
        await new Promise(resolve => setTimeout(resolve, 1000))  // Reduced from 2000 to 1000ms
      }
    }
    
    if (!isPaymentValid) {
      throw new Error("Payment session validation failed after multiple attempts. The payment may still be processing. Please check your order status or try again.")
    }
  } else {
    logger.debug('Bypassing payment validation for confirmed payment')
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  logger.debug('Attempting to complete cart:', { cartId: id, bypassValidation: bypassPaymentValidation })
  
  const cartRes = await checkoutTimeouts.paymentOperation(
    (_signal) => sdk.store.cart
      .complete(id, {}, headers)
      .then(async (cartRes) => {
        logger.debug('Cart completion response received:', { type: cartRes.type })
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)
        return cartRes
      })
      .catch(async (error) => {
        logger.error("Cart completion failed:", error)
        logger.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        // Enhanced error handling for payment authorization issues
        if (error.message?.includes('payment session') && error.message?.includes('not authorized')) {
          
          // Try one more time after a short delay - sometimes Stripe needs extra time
          logger.debug('Payment authorization failed, attempting one retry after delay...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          try {
            // Retry cart completion once
            const retryResult = await sdk.store.cart.complete(id, {}, headers)
            logger.debug('Cart completion retry succeeded')
            
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)
            return retryResult
            
          } catch (retryError) {
            logger.error('Cart completion retry also failed:', retryError)
            throw new Error("Payment authorization failed. Your payment method was not charged. Please try again with a different payment method or contact support.")
          }
        }

        // If we hit a timeout on the completion call, but payment is likely authorized, attempt a limited retry
        if (TimeoutHandler.isTimeoutError(error)) {
          logger.warn('Completion timed out, checking payment authorization status before final failure...')
          try {
            const authorized = await waitForPaymentCollectionAuthorization(id, '')
            if (authorized) {
              logger.debug('Payment appears authorized after timeout; retrying completion once...')
              return await sdk.store.cart.complete(id, {}, headers)
            }
          } catch (statusErr) {
            logger.warn('Authorization status check after timeout failed:', (statusErr as any)?.message || statusErr)
          }
        }
        
        // Re-throw the original error with enhanced context
        medusaError(error)
      }),
    "Completing cart order"
  )

  // Handle the response based on Medusa's API structure
  if (cartRes?.type === "order") {
    // Success case - order was created
    const countryCode =
      cartRes.order?.shipping_address?.country_code?.toLowerCase() || 'ee'  // Default to 'ee' if missing

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    
    // Ensure order ID exists before redirecting
    // From logs, we see the structure { type: 'order', id: 'order_123' } 
    // BUT TypeScript expects { type: 'order', order: { id: '...' } }
    // Let's handle both cases for robustness
    const orderId = cartRes.order?.id || (cartRes as any).id
    if (orderId) {
      logger.debug('Order completed successfully:', orderId)
      redirect(`/${countryCode}/order/${orderId}/confirmed`)
    } else {
      logger.error('Order created but missing order ID:', cartRes)
      throw new Error('Order creation incomplete. Please check your order status or contact support.')
    }
  } else if (cartRes?.type === "cart") {
    // Error case - cart completion failed
    logger.error('Cart completion failed with error:', (cartRes as any).error)
    const errorMessage = (cartRes as any).error?.message || 'Order completion failed'
    throw new Error(errorMessage)
  } else {
    // Unexpected response structure
    logger.error('Unexpected cart completion response:', cartRes)
    throw new Error('Unexpected response from order completion. Please try again.')
  }

  // This line should never be reached due to the logic above, but TypeScript requires a return
  return null
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}

/**
 * Bypasses payment session validation when we have confirmed payment from Stripe
 * Used as a fallback when the normal authorization flow fails
 * @param cartId - The cart ID containing the payment session
 * @param paymentIntentId - The Stripe payment intent ID (for logging)
 * @returns boolean indicating if we should proceed with order completion
 */
export async function bypassPaymentValidationForStripe(cartId: string, paymentIntentId: string) {
  logger.debug('Bypassing payment validation for confirmed Stripe payment:', {
    cartId,
    paymentIntentId
  })
  
  // Since Stripe has confirmed the payment on the frontend,
  // we'll allow the order to proceed even if the payment session
  // isn't showing as "authorized" in Medusa yet
  return true
}

/**
 * Validates that payment sessions are properly authorized before placing an order
 * @param cartId - The cart ID to validate
 * @returns boolean indicating if payment sessions are valid
 */
export async function validatePaymentSessionsBeforeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  
  if (!id) {
    throw new Error("No cart ID provided for payment validation")
  }

  try {
    const cart = await retrieveCart(id)
    
    if (!cart) {
      throw new Error("Cart not found for payment validation")
    }

    const paymentCollection = cart.payment_collection
    
    if (!paymentCollection) {
      throw new Error("No payment collection found on cart")
    }

    // Look for authorized session first, then pending as fallback
    const authorizedSession = paymentCollection.payment_sessions?.find(
      (session) => session.status === "authorized"
    )

    if (authorizedSession) {
      logger.debug("Found authorized payment session:", authorizedSession.id)
      return true
    }

    const pendingSession = paymentCollection.payment_sessions?.find(
      (session) => session.status === "pending"
    )

    if (!pendingSession) {
      logger.warn("No pending or authorized payment session found", {
        sessions: paymentCollection.payment_sessions?.map(s => ({ id: s.id, status: s.status, provider: s.provider_id }))
      })
      throw new Error("No payment session found")
    }

    // For Stripe, check if we have a client_secret (indicates proper initialization)
    if (pendingSession.provider_id.startsWith("pp_stripe_")) {
      const clientSecret = pendingSession.data?.client_secret
      if (!clientSecret) {
        logger.warn("Stripe payment session missing client_secret", pendingSession)
        return false
      }
    }

    // If we have pending session but not authorized, return false to trigger retry
    logger.debug("Payment session still pending, not yet authorized:", pendingSession.id)
    return false
  } catch (error) {
    logger.error("Payment session validation failed:", error)
    return false
  }
}
