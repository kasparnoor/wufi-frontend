"use client"

import { Heading } from "@medusajs/ui"
import { X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { LocalizedClientLink } from "@lib/components"
import Help from "@modules/account/components/help"
import Items from "@modules/account/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/account/components/order-summary"
import ShippingDetails from "@modules/account/components/shipping-details"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Tellimuse detailid</h1>
        <LocalizedClientLink
          href="/konto/tellimused"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <X /> Tagasi ülevaatesse
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
