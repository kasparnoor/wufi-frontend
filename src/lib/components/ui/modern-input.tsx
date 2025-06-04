"use client"

import * as React from "react"
import { cn } from "@lib/utils"
import { Input } from "./input"
import { Label } from "./label"
import { Eye, EyeOff } from "lucide-react"

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  errors?: string[]
  touched?: boolean
  variant?: "default" | "phone" | "select" | "estonian-address"
  containerClassName?: string
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, label, errors, touched, variant = "default", containerClassName, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)

    const isPassword = type === "password"
    const actualType = isPassword && showPassword ? "text" : type
    const hasError = touched && errors && errors.length > 0
    const isFloating = isFocused || hasValue

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    // Phone variant - no label
    if (variant === "phone") {
      return (
        <div className={cn("relative", containerClassName)}>
          <Input
            type={actualType}
            className={cn(
              "h-16 text-base",
              hasError && "border-red-500 focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {hasError && (
            <div className="mt-1 text-sm text-red-600">
              {errors?.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>
      )
    }

    // All other variants with floating labels
    return (
      <div className={cn("relative", containerClassName)}>
        <div className="relative">
          <Input
            type={actualType}
            className={cn(
              "h-16 text-base peer placeholder-transparent",
              hasError && "border-red-500 focus:border-red-500",
              className
            )}
            placeholder={label}
            ref={ref}
            {...props}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          
          {label && (
            <Label
              className={cn(
                "absolute left-3 transition-all duration-200 pointer-events-none",
                "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500",
                "peer-focus:top-3 peer-focus:text-xs peer-focus:text-blue-600",
                isFloating && "top-3 text-xs text-blue-600",
                hasError && "text-red-600"
              )}
            >
              {label}
            </Label>
          )}

          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {hasError && (
          <div className="mt-1 text-sm text-red-600">
            {errors?.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    )
  }
)

ModernInput.displayName = "ModernInput"

export { ModernInput } 