"use client"

import { useEffect } from "react"
import { TimeoutHandler } from "@lib/util/timeout-handler"

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Handle uncaught promise rejections (including timeout errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Uncaught Promise Rejection:', event.reason)
      
      // Check if it's a timeout error using our utility
      if (TimeoutHandler.isTimeoutError(event.reason)) {
        console.warn('Timeout error caught and handled gracefully:', event.reason.message)
        // Prevent the error from being logged to console as unhandled
        event.preventDefault()
        
        // Optionally show a user-friendly message
        // You could trigger a toast notification here
        return
      }
      
      // Handle other common checkout errors
      if (
        event.reason instanceof Error && 
        (event.reason.name === 'AbortError' || 
         event.reason.message?.toLowerCase().includes('timeout') ||
         event.reason.message?.toLowerCase().includes('network') ||
         event.reason.message?.toLowerCase().includes('fetch'))
      ) {
        console.warn('Network/fetch error caught and handled gracefully:', event.reason.message)
        // Prevent the error from being logged to console as unhandled
        event.preventDefault()
        
        // Optionally show a user-friendly message
        // You could trigger a toast notification here
        return
      }
      
      // Handle checkout-specific errors
      if (
        event.reason instanceof Error && 
        (event.reason.message?.toLowerCase().includes('payment') ||
         event.reason.message?.toLowerCase().includes('checkout') ||
         event.reason.message?.toLowerCase().includes('cart'))
      ) {
        console.warn('Checkout error caught and handled gracefully:', event.reason.message)
        // Don't prevent these as they might need to be handled by checkout components
        // But log them for debugging
        return
      }
    }

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught Error:', event.error)
      
      if (TimeoutHandler.isTimeoutError(event.error)) {
        console.warn('Timeout error caught and handled gracefully:', event.error.message)
        event.preventDefault()
        return
      }
      
      if (
        event.error instanceof Error && 
        (event.error.name === 'AbortError' || 
         event.error.message?.toLowerCase().includes('timeout') ||
         event.error.message?.toLowerCase().includes('network') ||
         event.error.message?.toLowerCase().includes('fetch'))
      ) {
        console.warn('Network/fetch error caught and handled gracefully:', event.error.message)
        event.preventDefault()
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
} 