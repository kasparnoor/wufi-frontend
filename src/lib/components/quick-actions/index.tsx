import { ReactNode } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface QuickAction {
  icon: ReactNode
  title: string
  description?: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
}

interface QuickActionsProps {
  title?: string
  actions: QuickAction[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export const QuickActions = ({ 
  title = "Kiired toimingud", 
  actions, 
  columns = 3,
  className = "" 
}: QuickActionsProps) => {
  // Better responsive grid classes that work well with many items
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }

  // Auto-adjust columns based on number of actions for better UX
  const getOptimalColumns = () => {
    if (actions.length <= 2) return 2
    if (actions.length <= 3) return 3  
    if (actions.length <= 6) return 3
    return 4
  }

  const actualColumns = columns || getOptimalColumns()

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      )}
      <div className={`grid gap-3 ${gridClasses[actualColumns]}`}>
        {actions.map((action, index) => (
          <QuickActionTile key={index} {...action} />
        ))}
      </div>
    </div>
  )
}

const QuickActionTile = ({ 
  icon, 
  title, 
  description, 
  href, 
  onClick,
  variant = 'default',
  disabled = false
}: QuickAction) => {
  const baseClasses = "group relative bg-white border rounded-lg transition-all duration-200 touch-manipulation"
  
  const variantClasses = {
    default: disabled 
      ? "border-gray-200 cursor-not-allowed opacity-60" 
      : "border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer",
    outline: disabled
      ? "border-gray-300 cursor-not-allowed opacity-60"
      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer",
    ghost: disabled
      ? "border-transparent cursor-not-allowed opacity-60"
      : "border-transparent hover:bg-gray-50 cursor-pointer"
  }

  const content = (
    <div className="p-4 min-h-[80px] flex flex-col justify-center">
      {/* Icon and title row */}
      <div className="flex items-center gap-3 mb-1">
        <div className={`flex-shrink-0 transition-colors ${
          disabled 
            ? "text-gray-400" 
            : "text-gray-600 group-hover:text-blue-600"
        }`}>
          {icon}
        </div>
        
        <h3 className={`font-medium text-sm leading-tight flex-1 ${
          disabled 
            ? "text-gray-400" 
            : "text-gray-900 group-hover:text-blue-700"
        }`}>
          {title}
        </h3>

        {/* Optional chevron indicator for external links */}
        {href && !disabled && (
          <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors ml-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className={`text-xs leading-tight ml-8 ${
          disabled 
            ? "text-gray-300" 
            : "text-gray-500 group-hover:text-blue-600"
        }`}>
          {description}
        </p>
      )}
    </div>
  )

  const className = `${baseClasses} ${variantClasses[variant]}`

  if (disabled) {
    return <div className={className}>{content}</div>
  }

  if (href) {
    return (
      <LocalizedClientLink href={href}>
        <div className={className}>
          {content}
        </div>
      </LocalizedClientLink>
    )
  }

  return (
    <button 
      onClick={onClick}
      className={`${className} w-full text-left`}
      disabled={disabled}
    >
      {content}
    </button>
  )
}

export default QuickActions 