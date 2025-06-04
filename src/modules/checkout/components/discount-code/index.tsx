"use client"

import React, { useActionState } from "react";
import { Tag } from "lucide-react"
import { HttpTypes } from "@medusajs/types"

import { ModernInput as Input } from "@lib/components"
import { applyPromotions, submitPromotionForm } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import ErrorMessage from "../error-message"
import { WufiButton } from "@lib/components"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [codeValue, setCodeValue] = React.useState("")

  const { promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code === undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    const code = formData.get("code")
    if (!code) {
      return
    }
    const codes = promotions
      .filter((p) => p.code === undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    await applyPromotions(codes)
    setCodeValue("")
  }

  const [message, formAction] = useActionState(submitPromotionForm, null)

  return (
    <div className="w-full">
      <form action={(a) => addPromotionCode(a)} className="w-full mb-4">
        {!isOpen ? (
          <WufiButton
            variant="secondary"
            onClick={() => setIsOpen(true)}
            type="button"
            className="w-full flex items-center justify-center gap-x-2 text-gray-700 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 transition-colors duration-200"
            size="medium"
            data-testid="add-discount-button"
          >
            <Tag className="h-5 w-5 text-yellow-800" />
            Lisa sooduskood(id)
          </WufiButton>
        ) : (
          <>
            <div className="flex flex-col w-full gap-2">
              <Input
                id="promotion-input"
                name="code"
                label="Sooduskood"
                value={codeValue}
                onChange={(e) => setCodeValue(e.target.value)}
                type="text"
                icon={Tag}
                data-testid="discount-input"
              />
              <div className="flex gap-2">
                <WufiButton
                  variant="secondary"
                  onClick={() => {
                    setIsOpen(false)
                    setCodeValue("")
                  }}
                  type="button"
                  className="flex-1 bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
                  size="small"
                >
                  Tühista
                </WufiButton>
                <WufiButton
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  size="small"
                  data-testid="discount-apply-button"
                >
                  Lisa
                </WufiButton>
              </div>
            </div>

            <ErrorMessage
              error={message}
              data-testid="discount-error-message"
            />
          </>
        )}
      </form>

      {promotions.length > 0 && (
        <div className="w-full bg-gray-50 p-4 rounded-xl">
          <div className="font-medium text-gray-700 mb-3">
            Rakendatud soodustused:
          </div>

          <div className="space-y-2">
            {promotions.map((promotion) => {
              // Ensure value is a number for convertToLocale
              const value = promotion.application_method?.value;
              const numericValue = typeof value === 'string' ? parseFloat(value) : (value || 0);

              return (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between w-full bg-white p-2 rounded-lg"
                  data-testid="discount-row"
                >
                  <div className="flex items-baseline gap-x-1 w-4/5 pr-1 text-gray-700">
                    <div className="truncate" data-testid="discount-code">
                      <div className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${promotion.is_automatic ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {promotion.code}
                      </div>{" "}
                      (
                      {promotion.application_method?.value !== undefined &&
                        promotion.application_method.currency_code !==
                          undefined && (
                          <>
                            {promotion.application_method.type ===
                            "percentage"
                              ? `${promotion.application_method.value}%`
                              : convertToLocale({
                                  amount: numericValue,
                                  currency_code:
                                    promotion.application_method
                                      .currency_code,
                                })}
                          </>
                        )}
                      )
                    </div>
                  </div>
                  {!promotion.is_automatic && (
                    <button
                      className="flex items-center text-gray-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-gray-100"
                      onClick={() => {
                        if (!promotion.code) {
                          return
                        }

                        removePromotionCode(promotion.code)
                      }}
                      data-testid="remove-discount-button"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span className="sr-only">
                        Eemalda sooduskood tellimusest
                      </span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscountCode
