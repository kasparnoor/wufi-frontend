/**
 * Helper functions for checkout and VAT guidance
 */

/**
 * Returns guidance text about Estonian VAT law requirements
 * @returns object with VAT guidance
 */
export const getEstonianVATGuidance = () => {
  return {
    legalReference: "Vastavalt Käibemaksuseadus § 37(9), peame koguma ja säilitama tõendid kauba kättetoimetamise kohta Eestis.",
    description: "Selleks on vaja teada, kas tellija on eraisik või ettevõte."
  }
}

/**
 * Determines if the order qualifies for simplified invoice
 * @param cart - The shopping cart
 * @returns boolean indicating if simplified invoice is applicable
 */
export const qualifiesForSimplifiedInvoice = (cart: any) => {
  // Qualify for simplified invoice if total is under 160€ and customer is not business
  const isBusinessCustomer = cart?.shipping_address?.company && cart.shipping_address.company.trim() !== ''
  return !isBusinessCustomer && (cart?.total || 0) <= 160 // 160€
}

/**
 * Determines if full address is required for the order
 * @param cart - The shopping cart
 * @param customerType - Whether customer is business or individual
 * @param shippingMethod - Selected shipping method
 * @returns boolean indicating if full address is required
 */
export const requiresFullAddress = (cart: any, customerType?: string, shippingMethod?: string) => {
  // Always require address for business customers
  if (customerType === 'business') return true
  
  // Require address for orders over 160€
  if ((cart?.total || 0) > 160) return true // 160€
  
  // Require address for courier delivery
  if (shippingMethod && isKulleriga(shippingMethod)) return true
  
  // Don't require address for pakiautomaat if individual customer and under 160€
  return false
}

/**
 * Determines if courier instructions should be shown
 * @param shippingMethodName - Name of the selected shipping method
 * @returns boolean indicating if courier instructions should be shown
 */
export const shouldShowCourierInstructions = (shippingMethodName?: string) => {
  if (!shippingMethodName) return false
  return isKulleriga(shippingMethodName)
}

/**
 * Checks if shipping method is Pakiautomaat
 * @param shippingMethodName - Name of the shipping method
 * @returns boolean indicating if it's Pakiautomaat
 */
export const isPakiautomaat = (shippingMethodName?: string) => {
  if (!shippingMethodName) return false
  return shippingMethodName.toLowerCase().includes('pakiautomaat') || 
         shippingMethodName.toLowerCase().includes('smartpost')
}

/**
 * Checks if shipping method is courier delivery
 * @param shippingMethodName - Name of the shipping method
 * @returns boolean indicating if it's courier delivery
 */
export const isKulleriga = (shippingMethodName?: string) => {
  if (!shippingMethodName) return false
  return shippingMethodName.toLowerCase().includes('kuller') || 
         shippingMethodName.toLowerCase().includes('courier') ||
         shippingMethodName.toLowerCase().includes('tarne')
}

/**
 * Determines if shipping method selection should be shown
 * @param orderTotal - Total amount of the order
 * @param isBusinessCustomer - Whether the customer is a business customer
 * @returns boolean indicating if shipping method selection should be shown
 */
export const shouldShowShippingMethodSelection = (orderTotal: number, isBusinessCustomer: boolean = false) => {
  // Always show for business customers
  if (isBusinessCustomer) return true
  
  // Show for orders over 160€
  return orderTotal > 160
}

/**
 * Returns structured guidance about shipping methods
 * @param orderTotal - Total amount of the order
 * @param isBusinessCustomer - Whether the customer is a business customer
 * @returns object with shipping method guidance
 */
export const getShippingMethodGuidance = (orderTotal: number, isBusinessCustomer: boolean = false) => {
  return {
    pakiautomaat: {
      description: isBusinessCustomer || orderTotal > 160 
        ? "Ärikliendid ja tellimused üle 160€ vajavad täielikku aadressi pakiautomaadi valimiseks"
        : "Mugav ja odav viis oma tellimuse kättesaamiseks",
      requiresAddress: isBusinessCustomer || orderTotal > 160
    },
    kuller: {
      description: "Kohaletoimetamine otse teie ukse taha",
      requiresAddress: true
    },
    pickup: {
      description: "Tasuta kättesaamine meie kauplusest",
      requiresAddress: false
    }
  }
}

/**
 * Determines the customer type from cart data
 * @param cart - The shopping cart
 * @returns 'business' | 'individual' | null
 */
export const getCustomerType = (cart: any): 'business' | 'individual' | null => {
  const metadata = cart?.metadata as any
  return metadata?.customer_type || null
}

/**
 * Determines what step should be shown in checkout based on current state
 * @param cart - The shopping cart
 * @param hasAutoshipItems - Whether cart has autoship eligible items
 * @returns checkout step
 */
export const getNextCheckoutStep = (cart: any, hasAutoshipItems: boolean = false) => {
  // Start with autoship if there are subscription items
  if (hasAutoshipItems && !cart?.items?.some((item: any) => item.metadata?.purchase_type)) {
    return "autoship"
  }
  
  // Check if customer type is selected
  const customerType = getCustomerType(cart)
  if (!customerType) {
    return "customer-type"
  }
  
  // Check if shipping method is selected
  if (!cart?.shipping_methods?.length) {
    return "delivery"
  }
  
  // ALWAYS require address step for contact info and delivery details
  const shippingMethod = cart.shipping_methods?.[0]?.name
  
  // Check if contact info is provided (always needed)
  if (!cart?.email || !cart?.shipping_address?.first_name || !cart?.shipping_address?.last_name || !cart?.shipping_address?.phone) {
    return "address"
  }
  
  // For pakiautomaat, ensure pakiautomaat location is selected (stored in address_1)
  if (isPakiautomaat(shippingMethod) && !cart?.shipping_address?.address_1) {
    return "address"
  }
  
  // For pakiautomaat, also ensure basic contact info and city/postal_code are set
  if (isPakiautomaat(shippingMethod)) {
    const addr = cart?.shipping_address
    if (!addr?.city || !addr?.postal_code) {
      return "address"
    }
  }
  
  // For courier/home delivery, ensure full address is provided
  const needsFullAddress = requiresFullAddress(cart, customerType, shippingMethod)
  if (needsFullAddress && (!cart?.shipping_address?.address_1 || !cart?.shipping_address?.city || !cart?.shipping_address?.postal_code)) {
    return "address"
  }
  
  // Check if payment method is selected
  if (!cart?.payment_collection) {
    return "payment"
  }
  
  return "review"
}

/**
 * Validates if pakiautomaat address data is complete
 * @param cart - The shopping cart
 * @returns boolean indicating if pakiautomaat address is valid
 */
export const isPakiautomaarAddressValid = (cart: any) => {
  if (!cart?.shipping_address) return false
  
  const addr = cart.shipping_address
  const shippingMethod = cart.shipping_methods?.[0]?.name
  
  if (!isPakiautomaat(shippingMethod)) return true // Not a pakiautomaat order
  
  // Check required fields for pakiautomaat
  return !!(
    addr.address_1 && // Pakiautomaat location
    addr.city && // Default city (usually Tallinn)
    addr.postal_code && // Default postal code
    addr.first_name &&
    addr.last_name &&
    addr.phone &&
    cart.email
  )
}

/**
 * Gets a structured pakiautomaat address object
 * @param pakiautomaarName - Name of the selected pakiautomaat
 * @returns structured address object for pakiautomaat
 */
export const getPakiautomaarAddress = (pakiautomaarName: string) => {
  return {
    address_1: pakiautomaarName,
    city: "Tallinn",
    postal_code: "10000",
    country_code: "EE"
  }
} 