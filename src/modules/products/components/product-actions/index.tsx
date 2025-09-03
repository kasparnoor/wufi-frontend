"use client"

import { useIntersection, useScrolledPast } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import { Separator as Divider } from "@lib/components"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { ShoppingBag, LoaderCircle, CheckCircle, ArrowRight } from "lucide-react"
import { KrapsButton } from "@lib/components"
import { RadioGroup, Radio } from "@headlessui/react"
import { RadioGroup as MedusaRadio, RadioGroupItem } from "@lib/components"
import { getProductPrice } from "@lib/util/get-product-price"
import { useToast } from "@modules/common/components/toast"
import { useCartState } from "@lib/components"
import { getAvailableIntervals } from "@lib/util/subscription-intervals"
import { motion, AnimatePresence } from "framer-motion"
import { trackAddToCart, convertProductToMetaPixel } from "@lib/util/meta-pixel"

type PurchaseType = "one_time" | "subscription"

const FIRST_ORDER_DISCOUNT = 30 // 30% off first order
const RECURRING_DISCOUNT = 5 // 5% off recurring orders

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  onAddToCart?: (params: {
    variantId: string
    quantity: number
    countryCode: string
    metadata: Record<string, any>
  }) => Promise<void>
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
  onAddToCart,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [showAddedMessage, setShowAddedMessage] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("subscription")
  
  // Get available intervals for this product
  const availableIntervals = useMemo(() => {
    const productIntervals = product.metadata?.available_intervals as string[] | undefined
    const intervals = getAvailableIntervals(productIntervals)
    return intervals
  }, [product.metadata?.available_intervals])
  
  // Set default interval to the first available - use useEffect to properly initialize
  const [selectedInterval, setSelectedInterval] = useState("daily")
  
  // Update selected interval when available intervals change
  useEffect(() => {
    if (availableIntervals.length > 0 && !availableIntervals.some(i => i.value === selectedInterval)) {
      setSelectedInterval(availableIntervals[0].value)
    }
  }, [availableIntervals, selectedInterval])
  
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

  // Consider in view when any part is visible; compute fully scrolled past separately
  const [inView, ready] = useIntersection(actionsRef, "0px", 0)
  // Show a bit sooner: trigger once the bottom of the block is ~96px above viewport top
  const scrolledPast = useScrolledPast(actionsRef, -96)

  // Get product price using the utility
  const { variantPrice } = useMemo(() => {
    return getProductPrice({
      product,
      variantId: selectedVariant?.id,
    })
  }, [product, selectedVariant])

  // Calculate subscription prices (30% first order capped at 20€ savings, 5% recurring)
  const prices = useMemo(() => {
    if (!variantPrice?.calculated_price_number) return null
    const basePrice = variantPrice.calculated_price_number
    
    // Calculate 30% discount but cap the savings at 20€
    const maxSavings = 20 // Maximum savings in euros
    const discountAmount = Math.min(basePrice * (FIRST_ORDER_DISCOUNT / 100), maxSavings)
    const firstOrderPrice = basePrice - discountAmount
    
    return {
      regular: basePrice,
      firstOrder: firstOrderPrice,
      recurring: basePrice * (1 - RECURRING_DISCOUNT / 100),
      actualDiscount: Math.round((discountAmount / basePrice) * 100) // Calculate actual discount percentage
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

    if (!onAddToCart) {
      console.warn("No onAddToCart handler provided to ProductActions");
      showToast("Toote lisamisel ostukorvi tekkis viga.", "error", 5000);
      return;
    }

    setIsAdding(true);

    try {
      const metadata: Record<string, any> = {
        purchase_type: purchaseType,
      };

      if (purchaseType === "subscription") {
        metadata.is_first_order = "true";
        metadata.subscription_discount = String(FIRST_ORDER_DISCOUNT);
        metadata.autoship = "true";
        metadata.interval = selectedInterval;
      } else {
        metadata.autoship = "false";
      }

      await onAddToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
        metadata: metadata
      });

      // Show success state only after successful API response
      setShowAddedMessage(true)
      setJustAdded(true)
      forceUpdate()

      setTimeout(() => setShowAddedMessage(false), 4000)
      setTimeout(() => setJustAdded(false), 8000)
      
      // Track the add to cart event
      const metaPixelProduct = convertProductToMetaPixel(product);
      trackAddToCart({
        content_ids: [product.id],
        contents: [metaPixelProduct],
        currency: 'EUR',
        value: metaPixelProduct.value || 0
      });
      
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      showToast("Toote lisamisel ostukorvi tekkis viga.", "error", 5000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-y-2 md:gap-y-4" ref={actionsRef}>
        {/* Variant Selection */}
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-2 md:gap-y-3">
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

        {/* Purchase Type Selection - Compact */}
        <div className="flex flex-col gap-y-2 md:gap-y-3">
          <RadioGroup value={purchaseType} onChange={setPurchaseType}>
            <div className="flex flex-col gap-y-2 md:gap-y-3">
              {/* Subscription Option - More Compact */}
              <Radio
                value="subscription"
                className={({ checked }) =>
                  clx(
                    "p-3 md:p-4 border rounded-xl cursor-pointer transition-colors duration-200 ease-in-out",
                    {
                      "border-2 border-blue-500 bg-blue-50/70 shadow-lg": checked,
                      "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": !checked,
                    }
                  )
                }
              >
                {({ checked }) => (
                  <div className="flex flex-col gap-2 md:gap-3">
                    <div className="flex items-start gap-x-2 md:gap-x-3">
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm md:text-base font-semibold text-gray-800 mb-1">Püsitellimus</span>
                        <div className="px-2 py-1 bg-green-50 border border-green-100 rounded-lg inline-block mb-2">
                          <span className="text-xs md:text-sm text-green-700 font-medium">
                            Säästa kuni {FIRST_ORDER_DISCOUNT}% esimesel (max 20€), {RECURRING_DISCOUNT}% edaspidi!
                          </span>
                        </div>
                        <ul className="text-xs md:text-sm text-gray-700 list-disc list-outside ml-3 space-y-1">
                          <li>Regulaarsed tarned</li>
                          <li>Muuda või tühista igal ajal</li>
                        </ul>
                        
                        {/* Compact Interval Selection */}
                        {checked && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <label htmlFor="interval-select-product" className="block text-xs font-medium text-gray-700 mb-1">
                              Vali kui sageli toimetame toote sinuni:
                            </label>
                            <select
                              id="interval-select-product"
                              name="interval"
                              value={selectedInterval}
                              onChange={(e) => setSelectedInterval(e.target.value)}
                              disabled={isAdding}
                              className="block w-full pl-2 pr-6 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                            >
                              {availableIntervals.map(interval => (
                                <option key={interval.value} value={interval.value}>
                                  {interval.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Compact Price Display */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      {prices?.firstOrder && (
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
                            <span className="text-lg md:text-xl font-bold text-blue-600">
                              {formatPrice(prices.firstOrder)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="line-through">{formatPrice(prices.regular)}</span>
                            <span>→</span>
                            <span className="font-medium text-gray-700">{formatPrice(prices.recurring)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Radio>

              {/* One-Time Purchase Option - Compact */}
              <Radio
                value="one_time"
                 className={({ checked }) =>
                  clx(
                    "p-3 md:p-4 border rounded-xl cursor-pointer transition-colors duration-200 ease-in-out",
                    {
                      "border-2 border-blue-500 bg-blue-50/70 shadow-lg": checked,
                      "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": !checked,
                    }
                  )
                }
              >
                {({ checked }) => (
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-x-2 md:gap-x-3">
                       <div>
                         <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                           {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                         </div>
                       </div>
                      <span className="text-sm md:text-base font-semibold text-gray-800">Ühekordne ost</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1">
                      <span className="text-lg md:text-xl font-bold text-gray-800">
                        {prices?.regular ? formatPrice(prices.regular) : "-"}
                      </span>
                    </div>
                  </div>
                 )}
              </Radio>
            </div>
          </RadioGroup>
        </div>

        {/* Add to Cart Button & Success Message */}
        <div className="relative w-full">
          <AnimatePresence>
            {showAddedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.9,
                  transition: { duration: 0.2, ease: "easeIn" },
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="absolute bottom-full left-0 w-full mb-2 z-10"
              >
                <div className="relative bg-green-500 border border-green-600/50 text-white rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center shadow-2xl shadow-green-500/20">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Edukalt lisatud ostukorvi!</span>
                  {/* Speech bubble pointer */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-t-[8px] border-t-green-500 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <KrapsButton
            onClick={justAdded ? () => router.push(`/${countryCode}/cart`) : handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding || !isValidVariant}
            variant={justAdded ? "secondary" : "primary"}
            size="large"
            className="w-full min-h-[44px] text-sm md:text-base transition-all duration-300 ease-in-out overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={justAdded ? "view-cart" : isAdding ? "adding" : "add-to-cart"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {isAdding ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Lisame...</span>
                  </>
                ) : justAdded ? (
                  <>
                    <span>Vaata ostukorvi</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                ) : !selectedVariant ? (
                  "Vali variant"
                ) : !inStock ? (
                  "Läbi müüdud"
                ) : (
                  <>
                    <span>Lisa ostukorvi</span>
                    <ShoppingBag className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </KrapsButton>
        </div>

        {ready && (
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={scrolledPast}
          optionsDisabled={!!disabled || isAdding}
          // Sync purchase selection and interval with main actions
          purchaseType={purchaseType}
          onPurchaseTypeChange={setPurchaseType}
          prices={prices || undefined}
          availableIntervals={availableIntervals}
          selectedInterval={selectedInterval}
          onIntervalChange={setSelectedInterval}
        />)}
      </div>
    </>
  )
}
