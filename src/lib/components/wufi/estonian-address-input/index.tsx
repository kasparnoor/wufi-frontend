"use client"

import React from "react"
import { ModernInput, type ModernInputProps } from "@lib/components/ui/modern-input"

export interface EstonianAddressInputProps extends Omit<ModernInputProps, 'type' | 'variant'> {
  label?: string
}

const EstonianAddressInput = React.forwardRef<HTMLInputElement, EstonianAddressInputProps>(
  ({ label = "Address", ...props }, ref) => {
    return (
      <ModernInput
        ref={ref}
        type="text"
        variant="estonian-address"
        label={label}
        {...props}
      />
    )
  }
)

EstonianAddressInput.displayName = "EstonianAddressInput"

export default EstonianAddressInput 