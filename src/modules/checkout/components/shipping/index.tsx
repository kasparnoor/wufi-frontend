"use client"

import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { LoaderCircle, Clock, Truck, MapPin, CheckCircle, Shield, Info, ArrowRight } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { ErrorMessage, KrapsButton } from "@lib/components"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  isPakiautomaat,
  isKulleriga,
  getEstonianVATGuidance,
  getShippingMethodGuidance,
  getCustomerType,
  requiresFullAddress
} from "@lib/util/checkout-helpers"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

// Helper function to get estimated delivery date
const getEstimatedDeliveryDate = (shippingOption: any): string => {
  const shippingName = shippingOption?.name?.toLowerCase() || ""
  
  if (shippingName.includes("pakiautomaat") || shippingName.includes("smartpost")) {
    return "1-2 tööpäevaga"
  } else if (shippingName.includes("kuller") || shippingName.includes("courier") || shippingName.includes("tarne")) {
    return "1-3 tööpäevaga"
  } else if (shippingName.includes("kättesaamine") || shippingName.includes("pickup")) {
    return "täna või homme"
  }
  
  return "1-3 tööpäevaga"
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [showPickupOptions, setShowPickupOptions] = useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // Get customer type and cart total
  const customerType = getCustomerType(cart)
  const cartTotal = cart?.total || 0
  
  // Get shipping method guidance
  const shippingGuidance = getShippingMethodGuidance(cartTotal, customerType === 'business')
  const vatGuidance = getEstonianVATGuidance()

  // Filter shipping methods
  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => !((sm as any).service_zone?.fulfillment_set?.type === "pickup")
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => {
              const shippingOption = p.value as HttpTypes.StoreCartShippingOption | null
              if (shippingOption && shippingOption.id && shippingOption.amount) {
                pricesMap[shippingOption.id] = shippingOption.amount
              }
            })

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        }).catch((error) => {
          console.error("Error loading shipping prices:", error)
          setIsLoadingPrices(false)
        })
      } else {
        setIsLoadingPrices(false)
      }
    } else {
      setIsLoadingPrices(false)
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods, _shippingMethods, _pickupMethods, shippingMethodId, cart.id])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
    } catch (err: any) {
      setShippingMethodId(currentId)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const selectedShippingMethod = availableShippingMethods?.find(
    method => method.id === shippingMethodId
  )

  // If not open, show selected shipping method summary
  if (!isOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedShippingMethod?.name || "Tarneviis valimata"}
              </p>
              <p className="text-xs text-gray-600">Tarneviis</p>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="text-sm text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
          >
            Muuda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Valige tarneviis
        </h3>
        {cart.shipping_address?.address_1 ? (
          <p className="text-sm text-gray-600 mb-6">
            Saadame teie tellimuse järgmise aadressile: {cart.shipping_address?.address_1}, {cart.shipping_address?.city}
          </p>
        ) : customerType === 'individual' && cartTotal <= 160 ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Tarneviisi juhend
                </h4>
                <p className="text-sm text-blue-800">
                  {vatGuidance.description} Valitud tarneviisi põhjal määrame, millised andmed on vajalikud.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {error && <ErrorMessage error={error} />}

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <LoaderCircle className="h-5 w-5 animate-spin text-yellow-600" />
          <span className="ml-2 text-sm text-gray-600">Tarneviisi seadistamine...</span>
        </div>
      )}

      {isLoadingPrices ? (
        <div className="flex items-center justify-center py-8">
          <LoaderCircle className="h-6 w-6 animate-spin text-yellow-600" />
          <span className="ml-2 text-gray-600">Tarneviise hindade arvutamine...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pickup Options */}
          {hasPickupOptions && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Poe kättesaamine
              </h4>
              {_pickupMethods?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={clx(
                    "border rounded-xl p-4 cursor-pointer transition-all duration-200 w-full text-left",
                    shippingMethodId === option.id 
                      ? "border-yellow-500 bg-yellow-50 shadow-md" 
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  )}
                  onClick={() => handleSetShippingMethod(option.id, "pickup")}
                  disabled={isLoading}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className={clx(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                          shippingMethodId === option.id 
                            ? "border-yellow-500 bg-yellow-500" 
                            : "border-gray-300"
                        )}>
                          {shippingMethodId === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{option.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {shippingGuidance.pickup.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            Saadaval järgmisel tööpäeval
                          </span>
                        </div>
                        {!shippingGuidance.pickup.requiresAddress && (
                          <div className="flex items-center gap-2 mt-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700">
                              Aadressi pole vaja
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">Tasuta</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Shipping Options */}
          {_shippingMethods && _shippingMethods.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Kohaletoimetamine
              </h4>
              {_shippingMethods.map((option) => {
                const isDisabled =
                  option.price_type === "calculated" &&
                  !isLoadingPrices &&
                  typeof calculatedPricesMap[option.id] !== "number"

                const price = option.price_type === "calculated" 
                  ? calculatedPricesMap[option.id] 
                  : option.amount

                const estimatedDelivery = getEstimatedDeliveryDate(option)
                const isFree = !price || price === 0
                const isPakiOption = isPakiautomaat(option.name)
                const isKullerOption = isKulleriga(option.name)

                const guidanceKey = isPakiOption ? 'pakiautomaat' : isKullerOption ? 'kuller' : 'pickup'
                const optionGuidance = shippingGuidance[guidanceKey as keyof typeof shippingGuidance]

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={clx(
                      "border rounded-xl p-4 cursor-pointer transition-all duration-200 w-full text-left",
                      isDisabled 
                        ? "border-gray-200 opacity-50 cursor-not-allowed" 
                        : shippingMethodId === option.id 
                          ? "border-yellow-500 bg-yellow-50 shadow-md" 
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                    onClick={() => !isDisabled && !isLoading && handleSetShippingMethod(option.id, "shipping")}
                    disabled={isDisabled || isLoading}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className={clx(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            isDisabled 
                              ? "border-gray-300 bg-gray-100"
                              : shippingMethodId === option.id 
                                ? "border-yellow-500 bg-yellow-500" 
                                : "border-gray-300"
                          )}>
                            {shippingMethodId === option.id && !isDisabled && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{option.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {optionGuidance.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700 font-medium">
                              Kohale {estimatedDelivery}
                            </span>
                          </div>
                          {shippingMethodId === option.id && (
                            <div className="flex items-center gap-2 mt-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">Valitud</span>
                            </div>
                          )}
                          {!optionGuidance.requiresAddress && customerType === 'individual' && cartTotal <= 160 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-700">
                                Aadressi pole vaja
                              </span>
                            </div>
                          )}
                          {isKullerOption && (
                            <div className="flex items-center gap-2 mt-2">
                              <Info className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-blue-700">
                                Saate lisada juhiseid kullerile
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {typeof price === "number" ? (
                          <div className={clx("text-lg font-bold", {
                            "text-green-600": isFree,
                            "text-gray-900": !isFree
                          })}>
                            {isFree 
                              ? "Tasuta" 
                              : convertToLocale({ 
                                  amount: price, 
                                  currency_code: cart.currency_code || "EUR" 
                                })
                            }
                          </div>
                        ) : isDisabled ? (
                          <div className="text-sm text-gray-500">Pole saadaval</div>
                        ) : (
                          <div className="text-sm text-gray-500">Hind arvutatakse</div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
              )}

        {/* Next Button */}
        <div className="mt-8 flex justify-end">
          <KrapsButton
            onClick={() => {
              const shippingMethodName = availableShippingMethods?.find(m => m.id === shippingMethodId)?.name
              const needsAddress = requiresFullAddress(cart, customerType || undefined, shippingMethodName)
              
              if (needsAddress) {
                router.push(pathname + "?step=address", { scroll: false })
              } else {
                router.push(pathname + "?step=payment", { scroll: false })
              }
            }}
            disabled={!shippingMethodId || isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ootame...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Jätka
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </KrapsButton>
        </div>
    </div>
  )
}

export default Shipping
