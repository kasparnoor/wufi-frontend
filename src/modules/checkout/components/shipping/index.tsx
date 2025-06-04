"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { LoaderCircle, Clock, Truck, MapPin, CheckCircle } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import { ErrorMessage } from "@lib/components"
import { RadioGroup as MedusaRadio, RadioGroupItem } from "@lib/components"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

// Helper function to get estimated delivery date
const getEstimatedDeliveryDate = (shippingOption: any): string => {
  const now = new Date()
  let deliveryDate = new Date(now)
  
  // Based on shipping method name, estimate delivery time
  const methodName = shippingOption.name?.toLowerCase() || ''
  
  if (methodName.includes('express') || methodName.includes('kiire')) {
    deliveryDate.setDate(now.getDate() + 1) // Next day
  } else if (methodName.includes('standard') || methodName.includes('tavaline')) {
    deliveryDate.setDate(now.getDate() + 3) // 3 days
  } else {
    deliveryDate.setDate(now.getDate() + 2) // Default 2 days
  }
  
  // Skip weekends
  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
    deliveryDate.setDate(deliveryDate.getDate() + 1)
  }
  
  return deliveryDate.toLocaleDateString('et-EE', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  })
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // Note: these properties are custom extensions to the Medusa types
  // When service_zone doesn't exist, fallback to standard filtering
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
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
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

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const selectedShippingMethod = availableShippingMethods?.find(
    method => method.id === shippingMethodId
  )

  return (
    <div className="space-y-6">
      {isOpen ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Valige tarneviis
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Saadame teie tellimuse järgmise aadressile: {cart.shipping_address?.address_1}, {cart.shipping_address?.city}
            </p>
          </div>

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
                    <div
                      key={option.id}
                      className={clx(
                        "border rounded-xl p-4 cursor-pointer transition-all duration-200",
                        shippingMethodId === option.id 
                          ? "border-yellow-500 bg-yellow-50 shadow-md" 
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      )}
                      onClick={() => handleSetShippingMethod(option.id, "pickup")}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <MedusaRadio checked={shippingMethodId === option.id} />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{option.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Kättesaamine meie kauplusest
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">
                                Saadaval järgmisel tööpäeval
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">Tasuta</div>
                        </div>
                      </div>
                    </div>
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

                    return (
                      <div
                        key={option.id}
                        className={clx(
                          "border rounded-xl p-4 transition-all duration-200",
                          {
                            "border-yellow-500 bg-yellow-50 shadow-md": shippingMethodId === option.id,
                            "border-gray-200 hover:border-gray-300 hover:shadow-sm": shippingMethodId !== option.id,
                            "opacity-50 cursor-not-allowed": isDisabled,
                            "cursor-pointer": !isDisabled
                          }
                        )}
                        onClick={() => !isDisabled && handleSetShippingMethod(option.id, "shipping")}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <MedusaRadio 
                                checked={shippingMethodId === option.id} 
                                disabled={isDisabled}
                              />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{option.name}</h5>
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
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {cart && selectedShippingMethod ? (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedShippingMethod.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      Kohale {getEstimatedDeliveryDate(selectedShippingMethod)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedShippingMethod.amount === 0 
                      ? "Tasuta" 
                      : convertToLocale({ 
                          amount: selectedShippingMethod.amount || 0, 
                          currency_code: cart.currency_code || "EUR" 
                        })
                    }
                  </span>
                  <button
                    onClick={handleEdit}
                    className="text-sm text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
                  >
                    Muuda
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">Tarneviis pole veel valitud</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Shipping
