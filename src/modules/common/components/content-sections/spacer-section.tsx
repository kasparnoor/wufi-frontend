"use client"

import { SpacerData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface SpacerSectionProps {
  data: SpacerData
}

const SpacerSection = ({ data }: SpacerSectionProps) => {
  // Convert size to specific spacing classes
  const getSpacingClass = () => {
    switch (data.size) {
      case 'small':
        return 'py-8'
      case 'medium':
        return 'py-16'
      case 'large':
        return 'py-24'
      case 'extra-large':
        return 'py-32'
      default:
        return 'py-16'
    }
  }

  return (
    <div 
      className={cn(
        "w-full",
        getSpacingClass(),
        data.background_color === 'gray' && "bg-gray-50",
        data.background_color === 'blue' && "bg-blue-50",
        data.background_color === 'white' && "bg-white"
      )}
      aria-hidden="true"
    />
  )
}

export default SpacerSection 