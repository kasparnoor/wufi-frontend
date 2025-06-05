"use client"

import { IconBadge, clx } from "@medusajs/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import ChevronDown from "@modules/common/icons/chevron-down"

type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  onQuantityChange?: (quantity: number) => void
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">

const CartItemSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Select...", className, children, onQuantityChange, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const quantity = parseInt(e.target.value)
      if (onQuantityChange && !isNaN(quantity)) {
        onQuantityChange(quantity)
      }
      // Call original onChange if provided
      if (props.onChange) {
        props.onChange(e)
      }
    }

    return (
      <div className="relative">
        <div
          className={clx(
            "relative flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 focus-within:border-gray-400 transition-colors",
            "w-16 h-10",
            className,
            {
              "text-gray-500": isPlaceholder,
            }
          )}
        >
          <select
            ref={innerRef}
            {...props}
            onChange={handleChange}
            className="appearance-none bg-transparent border-none outline-none w-full h-full text-center text-sm font-medium text-gray-700 cursor-pointer"
          >
            <option disabled value="">
              {placeholder}
            </option>
            {children}
          </select>
          <div className="absolute right-2 pointer-events-none flex items-center justify-center">
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    )
  }
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
