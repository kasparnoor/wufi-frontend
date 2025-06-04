import React from "react"
import { clx } from "@medusajs/ui"

type NativeSelectProps = {
  placeholder?: string
  children?: React.ReactNode
  className?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Select...", children, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clx(
          "w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    )
  }
)

NativeSelect.displayName = "NativeSelect"

export default NativeSelect 