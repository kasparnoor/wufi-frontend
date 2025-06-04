"use client"

import * as React from "react"
import { cn } from "@lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { HelpCircle } from "lucide-react"

export interface ModernTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
  delayDuration?: number
}

export const ModernTooltip = React.forwardRef<
  React.ElementRef<typeof TooltipTrigger>,
  ModernTooltipProps
>(({ content, children, side = "top", align = "center", className, delayDuration = 200, ...props }, ref) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger ref={ref} asChild {...props}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={className}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

ModernTooltip.displayName = "ModernTooltip"

export interface InfoTooltipProps extends Omit<ModernTooltipProps, 'children'> {
  iconClassName?: string
}

export const InfoTooltip = React.forwardRef<
  React.ElementRef<typeof TooltipTrigger>,
  InfoTooltipProps
>(({ content, side = "top", align = "center", className, iconClassName, delayDuration = 200, ...props }, ref) => {
  return (
    <ModernTooltip
      content={content}
      side={side}
      align={align}
      className={className}
      delayDuration={delayDuration}
      ref={ref}
      {...props}
    >
      <HelpCircle className={cn("h-4 w-4 text-gray-500 hover:text-gray-700 cursor-help", iconClassName)} />
    </ModernTooltip>
  )
})

InfoTooltip.displayName = "InfoTooltip"

export { ModernTooltip as WufiTooltip } 