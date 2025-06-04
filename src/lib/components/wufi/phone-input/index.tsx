"use client"

import React from "react"
import { ModernInput, type ModernInputProps } from "@lib/components/ui/modern-input"

export interface PhoneInputProps extends Omit<ModernInputProps, 'type' | 'variant'> {
  placeholder?: string
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ placeholder = "Phone Number", ...props }, ref) => {
    return (
      <ModernInput
        ref={ref}
        type="tel"
        variant="phone"
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export default PhoneInput 