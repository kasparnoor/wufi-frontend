import { ArrowRight } from "lucide-react"
import { ReactNode } from "react"
import { KrapsButton } from "../../../../lib/components"
import LocalizedClientLink from "../localized-client-link"

interface QuickAction {
  icon: ReactNode
  title: string
  href: string
}

interface QuickActionsProps {
  title?: string
  actions: QuickAction[]
  columns?: 1 | 2 | 3 | 4
}

const getGridClass = (columns: number) => {
  switch (columns) {
    case 1:
      return "sm:grid-cols-1"
    case 2:
      return "sm:grid-cols-2"
    case 3:
      return "sm:grid-cols-3"
    case 4:
      return "sm:grid-cols-4"
    default:
      return "sm:grid-cols-2"
  }
}

export const QuickActions = ({
  title,
  actions,
  columns = 2
}: QuickActionsProps) => {
  const gridClass = getGridClass(columns)

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">{title}</h3>
      )}
      <div className={`grid grid-cols-1 ${gridClass} gap-3`}>
        {actions.map((action, index) => (
          <LocalizedClientLink key={index} href={action.href}>
            <KrapsButton 
              variant="secondary" 
              size="medium"
              className="w-full justify-between group"
            >
              <span className="flex items-center gap-2">
                {action.icon}
                {action.title}
              </span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </KrapsButton>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
} 