"use client"

import { HttpTypes } from "@medusajs/types"
import SubscribeToggle from "@modules/checkout/components/subscribe-toggle"
import { 
  DeleteButton,
  LineItemOptions,
  LineItemPrice,
  LocalizedClientLink,
  Separator,
  ModernTooltip
} from "@lib/components"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState, useTransition } from "react"
import { Minus, Plus } from "lucide-react"

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
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string): Promise<void> => {
    if (deleteItemAction) {
      try {
        await deleteItemAction(id)
      } catch (error) {
        console.error("Error deleting item:", error)
        setError("Failed to delete item")
      }
    } else {
      console.warn("No deleteItemAction provided to cart item")
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (!updateItemAction || newQuantity === item.quantity || newQuantity < 1) return
    
    startTransition(() => {
      const formData = new FormData()
      formData.append("lineId", item.id)
      formData.append("quantity", newQuantity.toString())
      
      updateItemAction(null, formData).then((result) => {
        if (result) {
          setError(result)
        } else {
          setError(null)
        }
      }).catch((error) => {
        console.error("Error updating quantity:", error)
        setError("Failed to update quantity")
      })
    })
  }

  const incrementQuantity = () => {
    if (item.quantity < 10) {
      handleQuantityChange(item.quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1)
    }
  }

  // Check if product supports subscriptions - check for subscription_enabled metadata
  const productMetadata = (item.variant?.product as any)?.metadata
  const supportsSubscription = productMetadata?.subscription_enabled === true

  return (
    <div
      className="py-4 border-b border-gray-100 last:border-b-0"
      data-testid={dataTestId}
    >
      <div className="grid grid-cols-[100px_1fr] gap-x-4">
        <div className="w-24 h-24 flex-shrink-0">
          <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" />
        </div>
        <div className="flex flex-col gap-y-3">
          {/* Product Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <LocalizedClientLink
                href={`/products/${item.variant?.product?.handle}`}
                className="text-base font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2"
                data-testid="product-link"
              >
                {item.title}
              </LocalizedClientLink>
              <LineItemOptions variant={item.variant} data-testid="cart-item-variant" />
            </div>
            <div className="text-right ml-4">
              <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
            </div>
          </div>
          
          {/* Subscription Toggle */}
          {supportsSubscription && (
            <div className="border-t border-gray-100 pt-3">
              <SubscribeToggle 
                lineId={item.id}
                initialMetadata={item.metadata}
                productMetadata={productMetadata}
                quantity={item.quantity}
                isLoading={isPending}
              />
            </div>
          )}
          
          {/* Quantity and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-3">
              <ModernTooltip content="Eemalda toode">
                <DeleteButton 
                  id={item.id} 
                  onDelete={handleDelete}
                  data-testid="cart-item-remove-button"
                  className="!text-gray-400 hover:!text-red-500 transition-colors"
                >
                  Eemalda
                </DeleteButton>
              </ModernTooltip>
              
              <Separator orientation="vertical" className="h-5" />
              
              <div className="flex items-center gap-x-2">
                <span className="text-sm text-gray-600 font-medium">Kogus:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    disabled={item.quantity <= 1 || isPending}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-900 min-w-[40px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    disabled={item.quantity >= 10 || isPending}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {isPending && (
                  <div className="text-xs text-gray-500">Uuendamine...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ErrorMessage error={error} data-testid="cart-item-error-message" />
    </div>
  )
}



