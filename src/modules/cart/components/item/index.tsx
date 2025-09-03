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
import { rateLimitedAction, RATE_LIMITS } from "@lib/util/client-rate-limit"

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
      rateLimitedAction(
        `cart-update-${item.id}`,
        async () => {
          const formData = new FormData()
          formData.append("lineId", item.id)
          formData.append("quantity", newQuantity.toString())
          
          return updateItemAction(null, formData)
        },
        {
          ...RATE_LIMITS.CART_UPDATE,
          errorMessage: 'Liiga palju muudatusi. Palun oodake hetk.',
        }
      ).then((result) => {
        if (result) {
          setError(result)
        } else {
          setError(null)
        }
      }).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error updating quantity:", error)
        }
        setError(error.message || "Failed to update quantity")
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

  // Get product metadata from cart item
  const productMetadata = (item.variant?.product as any)?.metadata
  const variantMetadata = (item.variant as any)?.metadata
  const itemMetadata = item.metadata
  
  // Check if product supports subscriptions - strict check for subscription_enabled = true
  const supportsSubscription = productMetadata?.subscription_enabled === true
  
  // Debug logging only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Debug cart item metadata:', {
      productTitle: item.title,
      supportsSubscription,
      productId: item.product_id,
      variantId: item.variant_id,
    })
  }

  // Render as table row when used in preview/table context
  if (type === "preview") {
    return (
      <tr 
        className="border-b border-gray-100 last:border-b-0"
        data-testid={dataTestId}
      >
        <td className="py-4 pr-4">
          <div className="w-16 h-16 flex-shrink-0">
            <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" />
          </div>
        </td>
        <td className="py-4">
          <div className="flex flex-col gap-y-2">
            {/* Product Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <LocalizedClientLink
                  href={`/products/${item.variant?.product?.handle}`}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2"
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
            
            {/* Subscription info for preview */}
            {supportsSubscription && item.metadata?.purchase_type === "subscription" && (
              <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 w-fit">
                Püsitellimus
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              Kogus: {item.quantity}
            </div>
            
            {error && <ErrorMessage error={error} />}
          </div>
        </td>
      </tr>
    )
  }

  // Default div rendering for full/card types
  return (
    <div
      className="py-4 border-b border-gray-100 last:border-b-0"
      data-testid={dataTestId}
    >
      {/* Top section: Product info and price */}
      <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
          <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" />
        </div>
        <div className="flex-1 min-w-0">
          <LocalizedClientLink
            href={`/products/${item.variant?.product?.handle}`}
            className="text-sm sm:text-base font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 block mb-1"
            data-testid="product-link"
          >
            {item.title}
          </LocalizedClientLink>
          <LineItemOptions variant={item.variant} data-testid="cart-item-variant" />
        </div>
        <div className="text-right">
          <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
        </div>
      </div>
      
      {/* Subscription Toggle */}
      {supportsSubscription && (
        <div className="mb-3 sm:mb-4">
          <SubscribeToggle 
            lineId={item.id}
            initialMetadata={item.metadata}
            productMetadata={productMetadata}
            quantity={item.quantity}
            isLoading={isPending}
          />
        </div>
      )}
      
      {/* Bottom section: Quantity and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Kogus:</span>
          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={decrementQuantity}
              disabled={item.quantity <= 1 || isPending}
              className="p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Vähenda kogust"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="px-2 sm:px-3 py-1 min-w-[32px] sm:min-w-[40px] text-center text-xs sm:text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={incrementQuantity}
              disabled={item.quantity >= 10 || isPending}
              className="p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Suurenda kogust"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
        
        <DeleteButton
          id={item.id}
          onDelete={handleDelete}
          className="text-gray-400 hover:text-red-500 text-xs sm:text-sm"
          data-testid="cart-item-remove-button"
        />
      </div>
      
      {error && <ErrorMessage error={error} />}
    </div>
  )
}



