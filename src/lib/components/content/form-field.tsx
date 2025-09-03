"use client"

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react"
import { cn } from "../../utils"

interface BaseFieldProps {
  label: string
  name: string
  required?: boolean
  error?: string
  helper?: string
  className?: string
  labelClassName?: string
}

interface TextFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  type?: 'text' | 'email' | 'tel' | 'password' | 'url' | 'number'
}

interface TextareaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  type: 'textarea'
  rows?: number
}

interface SelectFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLSelectElement>, 'name'> {
  type: 'select'
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
}

type FormFieldProps = TextFieldProps | TextareaFieldProps | SelectFieldProps

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
  ({ label, name, required, error, helper, className, labelClassName, type = 'text', ...props }, ref) => {
    const fieldId = `field-${name}`
    const errorId = error ? `${fieldId}-error` : undefined
    const helperId = helper ? `${fieldId}-helper` : undefined

    const baseInputClasses = cn(
      "w-full px-3 py-2 border rounded-md shadow-sm transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
      error 
        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
        : "border-gray-300 hover:border-gray-400",
      className
    )

    const renderField = () => {
      if (type === 'textarea') {
        const textareaProps = props as TextareaFieldProps
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={fieldId}
            name={name}
            required={required}
            aria-describedby={cn(errorId, helperId)}
            aria-invalid={error ? 'true' : 'false'}
            className={baseInputClasses}
            rows={textareaProps.rows || 4}
            {...(textareaProps as any)}
          />
        )
      }

      if (type === 'select') {
        const selectProps = props as SelectFieldProps
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={fieldId}
            name={name}
            required={required}
            aria-describedby={cn(errorId, helperId)}
            aria-invalid={error ? 'true' : 'false'}
            className={baseInputClasses}
            {...(selectProps as any)}
          >
            {selectProps.options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        )
      }

      // Default to input
      const inputProps = props as TextFieldProps
      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          id={fieldId}
          name={name}
          required={required}
          aria-describedby={cn(errorId, helperId)}
          aria-invalid={error ? 'true' : 'false'}
          className={baseInputClasses}
          {...(inputProps as any)}
        />
      )
    }

    return (
      <div className="space-y-1">
        {/* Label */}
        <label
          htmlFor={fieldId}
          className={cn(
            "block text-sm font-medium text-gray-700",
            labelClassName
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </label>

        {/* Input Field */}
        {renderField()}

        {/* Helper Text */}
        {helper && (
          <p id={helperId} className="text-sm text-gray-500">
            {helper}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export default FormField

// Validation utilities
export const validateField = (value: string, rules: {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
}) => {
  const errors: string[] = []

  if (rules.required && !value.trim()) {
    errors.push('This field is required')
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters`)
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters`)
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    errors.push('Invalid format')
  }

  if (value && rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors.push('Invalid email address')
    }
  }

  return errors
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numbers: /^\d+$/,
} as const 