"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { ShoppingBag, Spinner } from "@medusajs/icons"
import WufiButton from "@modules/common/components/wufi-button"
import { RadioGroup, Radio } from "@headlessui/react"
import MedusaRadio from "@modules/common/components/radio"
import { getProductPrice } from "@lib/util/get-product-price"

type PurchaseType = "one_time" | "subscription"
type DeliveryFrequency = "2_weeks" | "1_month" | "2_months" | "3_months"

const DELIVERY_OPTIONS = [
  { value: "2_weeks", label: "Iga 2 nädala tagant" },
  { value: "1_month", label: "Iga kuu" },
  { value: "2_months", label: "Iga 2 kuu tagant" },
  { value: "3_months", label: "Iga 3 kuu tagant" },
]

const FIRST_ORDER_DISCOUNT = 30 // 30% off first order
const RECURRING_DISCOUNT = 5 // 5% off recurring orders

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one_time")
  const [deliveryFrequency, setDeliveryFrequency] = useState<DeliveryFrequency>("1_month")
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // Get product price using the utility
  const { variantPrice } = useMemo(() => {
    return getProductPrice({
      product,
      variantId: selectedVariant?.id,
    })
  }, [product, selectedVariant])

  // Calculate subscription prices (30% first order, 5% recurring)
  const prices = useMemo(() => {
    if (!variantPrice?.calculated_price_number) return null
    const basePrice = variantPrice.calculated_price_number
    return {
      regular: basePrice,
      firstOrder: basePrice * (1 - FIRST_ORDER_DISCOUNT / 100),
      recurring: basePrice * (1 - RECURRING_DISCOUNT / 100)
    }
  }, [variantPrice])

  // Format price for display
  const formatPrice = (amount: number) => {
    if (!variantPrice?.currency_code) return "-"
    return new Intl.NumberFormat("et-EE", {
      style: "currency",
      currency: variantPrice.currency_code,
    }).format(amount / 100)
  }

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
      metadata: {
        purchase_type: purchaseType,
        delivery_frequency: purchaseType === "subscription" ? deliveryFrequency : null,
        subscription_discount: purchaseType === "subscription" ? String(FIRST_ORDER_DISCOUNT) : "0",
        is_first_order: "true"
      }
    } as any)

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        {/* Variant Selection */}
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        {/* Purchase Type Selection */}
        <div className="flex flex-col gap-y-4">
          <RadioGroup value={purchaseType} onChange={setPurchaseType}>
            <div className="flex flex-col gap-y-2">
              <Radio
                value="subscription"
                className={clx(
                  "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 hover:shadow-borders-interactive-with-active",
                  {
                    "border-ui-border-interactive": purchaseType === "subscription"
                  }
                )}
              >
                <div className="flex items-center gap-x-4">
                  <MedusaRadio checked={purchaseType === "subscription"} />
                  <div className="flex flex-col">
                    <span className="text-base-regular">Automaattellimus</span>
                    <span className="text-small-regular text-ui-fg-subtle">
                      Säästa {FIRST_ORDER_DISCOUNT}% esimesel tellimusel, seejärel {RECURRING_DISCOUNT}% järgnevatel
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {prices?.firstOrder && (
                    <>
                      <span className="text-ui-fg-base font-semibold">
                        {formatPrice(prices.firstOrder)}
                      </span>
                      <span className="text-small-regular text-ui-fg-subtle">
                        seejärel {formatPrice(prices.recurring)}
                      </span>
                    </>
                  )}
                </div>
              </Radio>

              <Radio
                value="one_time"
                className={clx(
                  "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 hover:shadow-borders-interactive-with-active",
                  {
                    "border-ui-border-interactive": purchaseType === "one_time"
                  }
                )}
              >
                <div className="flex items-center gap-x-4">
                  <MedusaRadio checked={purchaseType === "one_time"} />
                  <span className="text-base-regular">Ühekordne ost</span>
                </div>
                <span className="text-ui-fg-base font-semibold">
                  {prices?.regular ? formatPrice(prices.regular) : "-"}
                </span>
              </Radio>
            </div>
          </RadioGroup>

          {/* Delivery Frequency Selection */}
          {purchaseType === "subscription" && (
            <div className="mt-4">
              <label className="text-base-regular mb-2 block">Tarne sagedus:</label>
              <select 
                value={deliveryFrequency}
                onChange={(e) => setDeliveryFrequency(e.target.value as DeliveryFrequency)}
                className="w-full p-2 border rounded-rounded"
              >
                {DELIVERY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col gap-y-2">
          <div className="text-xl font-semibold">
            {purchaseType === "subscription" 
              ? formatPrice(prices?.firstOrder || 0)
              : formatPrice(prices?.regular || 0)
            }
          </div>
          <p className="text-sm text-gray-500">Tasuta tagastus 30 päeva jooksul</p>
        </div>

        {/* Add to Cart Button */}
        <div className="flex flex-col gap-y-3">
          <WufiButton
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            size="large"
            className="w-full"
          >
            {isAdding ? (
              <>
                <Spinner className="h-5 w-5 animate-spin" />
                Lisame...
              </>
            ) : !selectedVariant ? (
              "Vali variant"
            ) : !inStock ? (
              "Läbi müüdud"
            ) : (
              <>
                Lisa ostukorvi
                <ShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </WufiButton>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
