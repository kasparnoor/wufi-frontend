"use client"

import React from "react"
import { ModernInput, type ModernInputProps } from "@lib/components/ui/modern-input"

export interface EmailInputProps extends Omit<ModernInputProps, 'type'> {
  label?: string
}

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ label = "Email Address", ...props }, ref) => {
    return (
      <ModernInput
        ref={ref}
        type="email"
        label={label}
        {...props}
      />
    )
  }
)

EmailInput.displayName = "EmailInput"

export default EmailInput 