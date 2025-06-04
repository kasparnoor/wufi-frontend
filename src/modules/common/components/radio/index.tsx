import React from "react"
import { clx } from "@medusajs/ui"

type RadioProps = {
  label?: string
  description?: string
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <div className={clx("flex items-start gap-3", className)}>
        <input
          ref={ref}
          type="radio"
          className={clx(
            "mt-1 h-4 w-4 text-blue-600 border-gray-300",
            "focus:ring-blue-500 focus:ring-2 focus:ring-offset-0",
            "disabled:bg-gray-100 disabled:cursor-not-allowed"
          )}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label className="text-sm font-medium text-gray-900">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Radio.displayName = "Radio"

export default Radio 