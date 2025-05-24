'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import type { ReactNode } from 'react'

type TooltipWrapperProps = {
  trigger: ReactNode
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  triggerClassName?: string
  contentClassName?: string
}

export function TooltipWrapper({
  trigger,
  content,
  side = 'top',
  sideOffset = 4,
  triggerClassName,
  contentClassName,
}: TooltipWrapperProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={triggerClassName} aria-label={'trigger'}>{trigger}</TooltipTrigger>
        <TooltipContent side={side} sideOffset={sideOffset} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
