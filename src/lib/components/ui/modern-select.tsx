import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { clx } from "@medusajs/ui"

interface ModernSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export const ModernSelect = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  ModernSelectProps
>(({ className, children, placeholder, ...props }, ref) => {
  return (
    <Select {...props}>
      <SelectTrigger ref={ref} className={clx("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
})

ModernSelect.displayName = "ModernSelect"

export { SelectItem as ModernSelectItem } 