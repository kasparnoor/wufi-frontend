"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { Loader, Clock } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address: any) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
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
      }
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods, _shippingMethods, _pickupMethods, shippingMethodId, cart.id])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
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

  return (
    <div className={`${isOpen ? '' : 'opacity-75'} space-y-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOpen ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="font-medium text-lg text-gray-900">Tarnimine</h3>
        </div>
        
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <button
              onClick={handleEdit}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
              data-testid="edit-delivery-button"
            >
              Muuda
            </button>
          )}
      </div>
      
      {isOpen ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-6">
          <span className="text-sm text-gray-700">Valige oma tellimuse tarneviis</span>
          <div data-testid="delivery-options-container">
            <div className="space-y-3">
              {hasPickupOptions && (
                <RadioGroup
                  value={showPickupOptions}
                  onChange={(value) => {
                    const id = _pickupMethods?.find(
                      (option) => !option.insufficient_inventory
                    )?.id

                    if (id) {
                      handleSetShippingMethod(id, "pickup")
                    }
                  }}
                >
                  <Radio
                    value={PICKUP_OPTION_ON}
                    data-testid="delivery-option-radio"
                    className={clx(
                      "flex items-center justify-between cursor-pointer py-4 px-5 rounded-lg border transition-colors",
                      {
                        "border-yellow-500 bg-yellow-50": showPickupOptions === PICKUP_OPTION_ON,
                        "border-gray-200 hover:border-gray-300": showPickupOptions !== PICKUP_OPTION_ON,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-3">
                      <MedusaRadio
                        checked={showPickupOptions === PICKUP_OPTION_ON}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Poe püüdmine
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      Tasuta
                    </span>
                  </Radio>
                </RadioGroup>
              )}
              <RadioGroup
                value={shippingMethodId || ""}
                onChange={(v) => handleSetShippingMethod(v, "shipping")}
              >
                {_shippingMethods?.map((option) => {
                  const isDisabled =
                    option.price_type === "calculated" &&
                    !isLoadingPrices &&
                    typeof calculatedPricesMap[option.id] !== "number"

                  return (
                    <Radio
                      key={option.id}
                      value={option.id}
                      data-testid="delivery-option-radio"
                      disabled={isDisabled}
                      className={clx(
                        "flex items-center justify-between cursor-pointer py-4 px-5 rounded-lg border transition-colors",
                        {
                          "border-yellow-500 bg-yellow-50": shippingMethodId === option.id,
                          "border-gray-200 hover:border-gray-300": shippingMethodId !== option.id,
                          "opacity-50 cursor-not-allowed": isDisabled
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-3">
                        <MedusaRadio checked={shippingMethodId === option.id} />
                        <span className="text-sm font-medium text-gray-900">
                          {option.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700">
                        {option.amount !== undefined &&
                        option.price_type !== "calculated"
                          ? convertToLocale({
                              amount: option.amount,
                              currency_code: cart.region?.currency_code || "",
                            })
                          : isLoadingPrices
                          ? "Calculating..."
                          : typeof calculatedPricesMap[option.id] === "number"
                          ? convertToLocale({
                              amount: calculatedPricesMap[option.id],
                              currency_code: cart.region?.currency_code || "",
                            })
                          : "N/A"}
                      </span>
                    </Radio>
                  )
                })}
              </RadioGroup>
            </div>
            <ErrorMessage error={error} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {!isLoading && cart?.shipping_methods?.[0]?.shipping_option_id && (
            <>
              <p className="text-sm font-medium text-gray-500">Valitud tarneviis</p>
              <p className="text-sm text-gray-900">
                {cart.shipping_methods[0].shipping_option_id} (
                {convertToLocale({
                  amount: cart.shipping_methods[0].amount || 0,
                  currency_code: cart.region?.currency_code || "",
                })}
                )
              </p>
              {cart.shipping_address && (
                <p className="text-sm text-gray-700">
                  {formatAddress(cart.shipping_address)}
                </p>
              )}
            </>
          )}
          {!cart?.shipping_methods?.length && (
            <div className="flex items-center justify-center gap-x-2">
              <Loader className="animate-spin" />
              <p className="text-sm text-gray-700">Laeb tarnimismeetodeid...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Shipping
