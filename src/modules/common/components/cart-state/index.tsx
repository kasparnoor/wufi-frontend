"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { retrieveCart } from "@lib/data/cart"

type CartStateType = {
  itemCount: number
  updateCart: () => Promise<void>
  forceUpdate: () => void
}

const CartStateContext = createContext<CartStateType | undefined>(undefined)

export const useCartState = () => {
  const context = useContext(CartStateContext)
  if (!context) {
    throw new Error("useCartState must be used within a CartStateProvider")
  }
  return context
}

export const CartStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itemCount, setItemCount] = useState(0)
  const [forceUpdateCount, setForceUpdateCount] = useState(0)

  const updateCart = useCallback(async () => {
    try {
      const cart = await retrieveCart()
      
      // Calculate total quantity by summing up quantities of all items
      const totalQuantity = cart?.items?.reduce((total, item) => {
        return total + (item.quantity || 0)
      }, 0) || 0
      
      setItemCount(totalQuantity)
      console.log("Cart state updated, total quantity:", totalQuantity)
    } catch (error) {
      console.error("Error updating cart state:", error)
      setItemCount(0)
    }
  }, [])

  const forceUpdate = useCallback(() => {
    setForceUpdateCount(prev => prev + 1)
    updateCart()
  }, [updateCart])

  // Initial fetch happens when the component mounts (client-side)
  React.useEffect(() => {
    updateCart()
  }, [updateCart, forceUpdateCount])

  return (
    <CartStateContext.Provider value={{ itemCount, updateCart, forceUpdate }}>
      {children}
    </CartStateContext.Provider>
  )
} 