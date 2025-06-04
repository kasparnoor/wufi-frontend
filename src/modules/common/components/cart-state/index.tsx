"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

type CartStateType = {
  itemCount: number
  updateCart: (cart?: any) => void
  forceUpdate: () => void
  setItemCount: (count: number) => void
}

const CartStateContext = createContext<CartStateType | undefined>(undefined)

export const useCartState = () => {
  const context = useContext(CartStateContext)
  if (!context) {
    throw new Error("useCartState must be used within a CartStateProvider")
  }
  return context
}

export const CartStateProvider: React.FC<{ 
  children: React.ReactNode
  initialCart?: any
}> = ({ children, initialCart }) => {
  // Calculate initial item count from cart or localStorage
  const getInitialItemCount = () => {
    if (initialCart?.items) {
      return initialCart.items.reduce((total: number, item: any) => {
        return total + (item.quantity || 0)
      }, 0) || 0
    }
    
    // Fallback to localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart-item-count")
      return stored ? parseInt(stored, 10) : 0
    }
    
    return 0
  }

  const [itemCount, setItemCountState] = useState(getInitialItemCount)
  const [forceUpdateCount, setForceUpdateCount] = useState(0)

  // Custom setItemCount that also updates localStorage
  const setItemCount = useCallback((count: number) => {
    setItemCountState(count)
    if (typeof window !== "undefined") {
      localStorage.setItem("cart-item-count", count.toString())
    }
  }, [])

  const updateCart = useCallback((cart?: any) => {
    if (cart) {
      // Calculate total quantity by summing up quantities of all items
      const totalQuantity = cart?.items?.reduce((total: number, item: any) => {
        return total + (item.quantity || 0)
      }, 0) || 0
      
      setItemCount(totalQuantity)
      console.log("Cart state updated, total quantity:", totalQuantity)
    } else {
      // If no cart provided, we can't update the count
      console.log("No cart provided to updateCart")
    }
  }, [setItemCount])

  const forceUpdate = useCallback(() => {
    setForceUpdateCount(prev => prev + 1)
    // Note: This no longer automatically fetches cart data
    // Components using this should handle cart updates themselves
  }, [])

  // Update localStorage when itemCount changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart-item-count", itemCount.toString())
    }
  }, [itemCount])

  return (
    <CartStateContext.Provider value={{ itemCount, updateCart, forceUpdate, setItemCount }}>
      {children}
    </CartStateContext.Provider>
  )
} 