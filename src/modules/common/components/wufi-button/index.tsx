import { Button } from "@medusajs/ui"
import { ReactNode } from "react"
import clsx from "clsx"

interface WufiButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary"
  size?: "small" | "medium" | "large"
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  form?: string
}

const WufiButton = ({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  form,
}: WufiButtonProps) => {
  const baseStyles = "inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200"
  
  const variantStyles = {
    primary: "bg-yellow-400/90 hover:bg-yellow-400 text-yellow-900 border border-yellow-400 shadow-lg hover:shadow-yellow-400/20 transform hover:scale-105",
    secondary: "bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transform hover:scale-105"
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

export default WufiButton 