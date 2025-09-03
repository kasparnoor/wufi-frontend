import { Dialog, Transition } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"
import { ShoppingBag, LoaderCircle } from "lucide-react"
import { KrapsButton } from "@lib/components"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
  // New props to sync state with main actions
  purchaseType?: "one_time" | "subscription"
  onPurchaseTypeChange?: (type: "one_time" | "subscription") => void
  prices?: {
    regular: number
    firstOrder: number
    recurring: number
    actualDiscount: number
  }
  availableIntervals?: { value: string; label: string }[]
  selectedInterval?: string
  onIntervalChange?: (val: string) => void
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
  purchaseType,
  onPurchaseTypeChange,
  prices,
  availableIntervals,
  selectedInterval,
  onIntervalChange,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-40", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-white flex flex-col gap-y-3 md:gap-y-4 justify-center items-center p-3 md:p-4 w-full border-t border-gray-200 shadow-lg rounded-t-2xl"
            data-testid="mobile-actions"
          >
            <div className="w-full flex items-center justify-between gap-3">
              {/* Left: Variant chooser (if not simple) and purchase type toggle */}
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {!isSimple && (
                  <KrapsButton
                    onClick={open}
                    variant="secondary"
                    className="text-gray-700 min-h-[40px] text-sm"
                    data-testid="mobile-actions-button"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[120px]">
                        {variant ? Object.values(options).join(" / ") : "Vali variant"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </KrapsButton>
                )}

                {/* Purchase type toggle with interval label below */}
                {onPurchaseTypeChange && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => onPurchaseTypeChange("one_time")}
                        className={clx(
                          "px-2 py-1 text-xs rounded-md",
                          purchaseType === "one_time" ? "bg-white shadow font-semibold" : "text-gray-600"
                        )}
                        aria-pressed={purchaseType === "one_time"}
                      >
                        Ühekordne
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPurchaseTypeChange("subscription")
                          // Open interval picker immediately when choosing subscription
                          if (availableIntervals && availableIntervals.length > 0 && onIntervalChange) {
                            open()
                          }
                        }}
                        className={clx(
                          "px-2 py-1 text-xs rounded-md",
                          purchaseType === "subscription" ? "bg-white shadow font-semibold" : "text-gray-600"
                        )}
                        aria-pressed={purchaseType === "subscription"}
                      >
                        Püsitellimus
                      </button>
                    </div>

                    {purchaseType === "subscription" && availableIntervals && onIntervalChange && (
                      <button
                        type="button"
                        onClick={open}
                        className="text-[11px] text-gray-600 underline underline-offset-2 text-left"
                      >
                        {availableIntervals.find(i => i.value === (selectedInterval || ""))?.label || "Vali sagedus"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Price and Add to cart */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {purchaseType === "subscription" && prices ? (
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-bold text-blue-600">
                        {selectedPrice?.currency_code ? new Intl.NumberFormat("et-EE", { style: "currency", currency: selectedPrice.currency_code }).format(prices.firstOrder) : selectedPrice?.calculated_price}
                      </span>
                      <div className="text-[11px] text-gray-500">
                        <span className="line-through mr-1">
                          {selectedPrice?.currency_code ? new Intl.NumberFormat("et-EE", { style: "currency", currency: selectedPrice.currency_code }).format(prices.regular) : undefined}
                        </span>
                        <span>→ {selectedPrice?.currency_code ? new Intl.NumberFormat("et-EE", { style: "currency", currency: selectedPrice.currency_code }).format(prices.recurring) : undefined}</span>
                      </div>
                    </div>
                  ) : (
                    selectedPrice && (
                      <span className="text-sm font-semibold">{selectedPrice.calculated_price}</span>
                    )
                  )}
                </div>
                <KrapsButton
                  onClick={handleAddToCart}
                  disabled={!inStock || !variant}
                  className="min-h-[40px] text-sm"
                  data-testid="mobile-cart-button"
                >
                  {isAdding ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 mr-2" />
                  )}
                  {!variant
                    ? "Vali variant"
                    : !inStock
                    ? "Läbi müüdud"
                    : isAdding
                    ? "Lisatakse..."
                    : "Lisa"}
                </KrapsButton>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="bg-white w-12 h-12 rounded-full text-ui-fg-base flex justify-center items-center"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-white px-6 py-12">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {/* Interval selection for subscription */}
                    {purchaseType === "subscription" && availableIntervals && onIntervalChange && (
                      <div className="mt-8">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Vali tarne sagedus</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableIntervals.map((intv) => (
                            <button
                              key={intv.value}
                              type="button"
                              onClick={() => { onIntervalChange(intv.value); close(); }}
                              className={clx(
                                "w-full text-left px-3 py-2 rounded-lg border",
                                selectedInterval === intv.value
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                                  : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                              )}
                              aria-pressed={selectedInterval === intv.value}
                            >
                              {intv.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
