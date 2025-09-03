"use client"

import { DividerData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface DividerSectionProps {
  data: DividerData
}

const DividerSection = ({ data }: DividerSectionProps) => {
  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div
          className={cn(
            "border-0",
            // Style variations
            data.style === 'solid' && "border-t border-gray-300",
            data.style === 'dashed' && "border-t border-dashed border-gray-300",
            data.style === 'dotted' && "border-t border-dotted border-gray-300",
            data.style === 'gradient' && "h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent",
            data.style === 'thick' && "border-t-2 border-gray-300",
            // Default style
            !data.style && "border-t border-gray-300",
            // Width variations
            data.width === 'small' && "max-w-24 mx-auto",
            data.width === 'medium' && "max-w-48 mx-auto",
            data.width === 'large' && "max-w-96 mx-auto",
            data.width === 'full' && "w-full",
            // Default width
            !data.width && "w-full"
          )}
          role="separator"
          aria-orientation="horizontal"
        />
      </div>
    </div>
  )
}

export default DividerSection 