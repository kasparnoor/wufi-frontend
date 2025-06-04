"use client"

import { Text, useToggleState, Button } from "@medusajs/ui"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { usePathname } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { useState } from "react"
import { LocalizedClientLink } from "@lib/components"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
  onTransferCart?: () => Promise<void>
}) {
  const { customer, cart, onTransferCart } = props
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("Proovi uuesti")

  if (!customer || !!cart.customer_id) {
    return
  }

  const handleSubmit = async () => {
    if (!onTransferCart) {
      console.warn("No onTransferCart handler provided to CartMismatchBanner")
      return
    }

    try {
      setIsPending(true)
      setActionText("Ülekandmine..")

      await onTransferCart()
    } catch {
      setActionText("Proovi uuesti")
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center justify-center small:p-4 p-2 text-center bg-orange-300 small:gap-2 gap-1 text-sm mt-2 text-orange-800">
      <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center">
        <span className="flex items-center gap-1">
          <AlertCircle className="inline" />
          Midagi läks valesti sinu ostukorvi ülekandmisel
        </span>

        <span>·</span>

        <Button
          variant="transparent"
          className="hover:bg-transparent active:bg-transparent focus:bg-transparent disabled:text-orange-500 text-orange-950 p-0 bg-transparent"
          size="base"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner
