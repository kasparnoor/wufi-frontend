"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import { convertToLocale } from "@lib/util/money"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
      metadata: item.metadata || undefined,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const isSubscriptionItem =
    item.metadata?.purchase_type === "subscription" &&
    item.metadata?.is_first_order === "true"
  const subscriptionPct = isSubscriptionItem
    ? parseFloat(String(item.metadata?.subscription_discount ?? 0))
    : 0
  const originalLineTotal = item.unit_price * item.quantity
  const discountedTotal = originalLineTotal * (1 - subscriptionPct / 100)

  return (
    <Table.Row className="w-full group transition-colors hover:bg-yellow-50/40" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="rounded-lg overflow-hidden border border-gray-100 group-hover:border-yellow-300 transition-colors shadow-sm"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className={clx("text-left", { "p-4": type === "preview" })}>
        <LocalizedClientLink href={`/products/${item.product_handle}`}>
          <Text
            className={clx(
              "font-medium text-gray-900 group-hover:text-yellow-700 transition-colors",
              type === "preview" ? "text-base" : "text-base sm:text-lg"
            )}
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
        </LocalizedClientLink>
        <div className="text-gray-600">
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        </div>
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex flex-col items-start gap-2">
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-20 h-10 p-4 rounded-lg border border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            
            <div className="flex items-center">
              <DeleteButton 
                id={item.id} 
                data-testid="product-delete-button" 
                className="text-gray-500 hover:text-red-500"
              />
            </div>
            
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell text-gray-700">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className={clx("!pr-0", { "p-4": type === "preview" })}>
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          {isSubscriptionItem ? (
            <div className="flex flex-col items-end space-y-1">
              <span className="line-through text-gray-500">
                {convertToLocale({ amount: originalLineTotal, currency_code: currencyCode })}
              </span>
              <span className="text-lg font-semibold text-green-600">
                {convertToLocale({ amount: discountedTotal, currency_code: currencyCode })}
              </span>
              <span className="text-sm text-green-600">
                Soodustus {subscriptionPct}%
              </span>
            </div>
          ) : (
            <div className="font-semibold text-lg text-gray-900">
              <LineItemPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </div>
          )}
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
