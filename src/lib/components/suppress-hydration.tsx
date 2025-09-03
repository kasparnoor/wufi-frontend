"use client"

import { ReactNode } from 'react'

interface SuppressHydrationProps {
  children: ReactNode
  suppressHydrationWarning?: boolean
}

/**
 * Component to suppress hydration warnings for content that's intentionally
 * different between server and client (like user-specific data, timestamps, etc.)
 */
export default function SuppressHydration({ 
  children, 
  suppressHydrationWarning = true 
}: SuppressHydrationProps) {
  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>
      {children}
    </div>
  )
} 