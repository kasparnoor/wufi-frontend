"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { ShoppingBag, Spinner } from "@medusajs/icons"
import WufiButton from "@modules/common/components/wufi-button"
import { RadioGroup, Radio } from "@headlessui/react"
import MedusaRadio from "@modules/common/components/radio"
import { getProductPrice } from "@lib/util/get-product-price"
import { useToast } from "@modules/common/components/toast"
import { useCartState } from "@modules/common/components/cart-state"

type PurchaseType = "one_time" | "subscription"

const FIRST_ORDER_DISCOUNT = 30 // 30% off first order
const RECURRING_DISCOUNT = 5 // 5% off recurring orders

// Define available autoship intervals
const AUTOSHIP_INTERVALS = [
  { value: "2w", label: "Iga 2 nädala tagant" },
  { value: "4w", label: "Iga 4 nädala tagant" },
  { value: "6w", label: "Iga 6 nädala tagant" },
  { value: "8w", label: "Iga 8 nädala tagant" },
];

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
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("subscription")
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const { showToast } = useToast()
  const { forceUpdate } = useCartState()

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

  // Format a numeric price value (already in major currency units) to a localized currency string
  const formatPrice = (amount: number) => {
    if (!variantPrice?.currency_code) return "-"

    return new Intl.NumberFormat("et-EE", {
      style: "currency",
      currency: variantPrice.currency_code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;

    setIsAdding(true);

    try {
      const metadata: Record<string, any> = {
        purchase_type: purchaseType,
      };

      if (purchaseType === "subscription") {
        metadata.is_first_order = "true";
        metadata.subscription_discount = String(FIRST_ORDER_DISCOUNT);
        metadata.autoship = "true";
      } else {
        metadata.autoship = "false";
      }

      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
        metadata: metadata
      });
      
      // Use same toast message for both purchase types
      showToast(
        "Toode lisatud ostukorvi!",
        "success",
        5000,
        {
          label: "Vaata ostukorvi",
          href: `/${countryCode}/cart`
        }
      );
      
      // Update cart state immediately
      forceUpdate();
      
      // This is no longer needed for cart count but kept for other UI refreshes
      router.refresh();
      
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      showToast("Toote lisamisel ostukorvi tekkis viga.", "error", 5000);
    } finally {
      setIsAdding(false);
    }
  };

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

        {/* Purchase Type Selection - Revamped */}
        <div className="flex flex-col gap-y-3">
          <RadioGroup value={purchaseType} onChange={setPurchaseType}>
            <div className="flex flex-col gap-y-4">
              {/* Subscription Option */}
              <Radio
                value="subscription"
                className={({ checked }) =>
                  clx(
                    "p-6 border rounded-xl cursor-pointer transition-colors duration-200 ease-in-out",
                    {
                      "border-2 border-blue-500 bg-blue-50/70 shadow-lg": checked,
                      "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": !checked,
                    }
                  )
                }
              >
                {({ checked }) => (
                  <div className="flex flex-col md:flex-row justify-between w-full gap-6">
                    <div className="flex items-start gap-x-4">
                      <div className="mt-0.5 transform scale-110">
                        <MedusaRadio checked={checked} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-gray-800 mb-2">Püsitellimus</span>
                        <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg inline-block mb-3">
                          <span className="text-base text-green-700 font-medium">
                            Säästa {FIRST_ORDER_DISCOUNT}% esimesel tellimusel, seejärel {RECURRING_DISCOUNT}%!
                          </span>
                        </div>
                        <ul className="text-base text-gray-700 list-disc list-outside ml-5 space-y-2.5">
                          <li>Regulaarsed tarned sinu graafiku alusel</li>
                          <li>Jäta vahele, muuda või tühista igal ajal</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 text-right pt-2">
                      {prices?.firstOrder && (
                        <>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 mb-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatPrice(prices.firstOrder)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 line-through mb-1">
                            {formatPrice(prices.regular)}
                          </span>
                          <div className="flex items-center gap-x-1.5 text-sm text-gray-700">
                            <span>seejärel</span>
                            <span className="font-medium">{formatPrice(prices.recurring)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Radio>

              {/* One-Time Purchase Option */}
              <Radio
                value="one_time"
                 className={({ checked }) =>
                  clx(
                    "p-6 border rounded-xl cursor-pointer transition-colors duration-200 ease-in-out",
                    {
                      "border-2 border-blue-500 bg-blue-50/70 shadow-lg": checked,
                      "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": !checked,
                    }
                  )
                }
              >
                {({ checked }) => (
                  <div className="flex justify-between items-center w-full gap-x-4">
                    <div className="flex items-center gap-x-4">
                       <div className="transform scale-110">
                         <MedusaRadio checked={checked} />
                       </div>
                      <span className="text-lg font-semibold text-gray-800">Ühekordne ost</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2">
                      <span className="text-2xl font-bold text-gray-800">
                        {prices?.regular ? formatPrice(prices.regular) : "-"}
                      </span>
                    </div>
                  </div>
                 )}
              </Radio>
            </div>
          </RadioGroup>
        </div>

        {/* Price Display (Consider removing if prices are clear in options) */}
        {/* <div className="flex flex-col gap-y-2"> ... </div> */}

        {/* Return Policy */}
        {/* <p className="text-sm text-gray-500 text-center">Tasuta tagastus 30 päeva jooksul</p> */}

        {/* Add to Cart / Setup Autoship Button */}
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
                <ShoppingBag className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
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
