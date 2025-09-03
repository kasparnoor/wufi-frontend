import React from "react"
import { Button } from "@medusajs/ui"
import { ReactNode } from "react"
import clsx from "clsx"

interface KrapsButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary"
  size?: "small" | "medium" | "large"
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  form?: string
}

const KrapsButton = ({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  form,
}: KrapsButtonProps) => {
  const baseStyles = "inline-flex items-center gap-2 rounded-full font-bold transition-all duration-200"
  
  const variantStyles = {
    primary: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border border-yellow-400 shadow-lg hover:shadow-yellow-400/20 transform hover:scale-105 font-heading",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transform hover:scale-105 font-medium"
  }

  const sizeStyles = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-2.5 text-base",
    large: "px-8 py-3.5 text-base"
  }

  return (
    <Button
      onClick={onClick}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      type={type}
      disabled={disabled}
      form={form}
    >
      {children}
    </Button>
  )
}

export default KrapsButton 