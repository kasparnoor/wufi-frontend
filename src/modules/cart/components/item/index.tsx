"use client"

import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import { 
  DeleteButton,
  LineItemOptions,
  LineItemPrice,
  LineItemUnitPrice,
  LocalizedClientLink,
  Separator,
  ModernTooltip
} from "@lib/components"
import Thumbnail from "@modules/products/components/thumbnail"
import { Trash2 } from "lucide-react"
import { useActionState, useState } from "react"

// Simple ErrorMessage component since it's not exported
const ErrorMessage = ({ error, ...props }: { error: string | null, [key: string]: any }) => {
  if (!error) return null
  return <div className="text-red-500 text-sm" {...props}>{error}</div>
}

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview" | "card"
  currencyCode: string
  "data-testid"?: string
  updateItemAction?: (prevState: any, formData: FormData) => Promise<any>
  deleteItemAction?: (id: string) => Promise<void>
}

export default function Item({ 
  item, 
  type = "full", 
  currencyCode, 
  updateItemAction,
  deleteItemAction,
  "data-testid": dataTestId 
}: ItemProps) {
  const [message, formAction] = useActionState(updateItemAction || (() => Promise.resolve(null)), null)

  const handleDelete = async (id: string) => {
    if (deleteItemAction) {
      await deleteItemAction(id)
    } else {
      console.warn("No deleteItemAction provided to cart item")
    }
  }

  return (
    <div
      className="grid grid-cols-[122px_1fr] gap-x-4 group/item"
      data-testid={dataTestId}
    >
      <div className="w-24">
        <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" />
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <div>
              <LocalizedClientLink
                href={`/products/${item.variant?.product?.handle}`}
                className="text-base font-medium text-ui-fg-base hover:text-ui-fg-base"
                data-testid="product-link"
              >
                {item.title}
              </LocalizedClientLink>
              <LineItemOptions variant={item.variant} data-testid="cart-item-variant" />
            </div>
            <div className="text-right">
              <LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} />
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <ModernTooltip content="Remove item">
                <DeleteButton 
                  id={item.id} 
                  onDelete={handleDelete}
                  data-testid="cart-item-remove-button"
                >
                  <Trash2 className="h-4 w-4" />
                </DeleteButton>
              </ModernTooltip>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center">
              <CartItemSelect 
                value={item.quantity}
                onChange={() => {}}
                data-testid="cart-item-select"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </CartItemSelect>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end">
          {updateItemAction && (
            <form action={formAction}>
              <input type="hidden" name="lineId" value={item.id} />
              <input type="hidden" name="quantity" value={item.quantity} />
              <ErrorMessage error={message} data-testid="cart-item-error-message" />
            </form>
          )}
          <div className="text-right">
            <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
          </div>
        </div>
      </div>
    </div>
  )
}
