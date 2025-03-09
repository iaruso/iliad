'use client'

import React, { ReactNode, FC } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DropdownTooltipProps {
  button: ReactNode;
  tooltip: string;
  content: ReactNode;
}

const DropdownTooltip: FC<DropdownTooltipProps> = ({ button, tooltip, content }) => {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              {button}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent side='top' align='end' onCloseAutoFocus={(e) => e.preventDefault()}>
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownTooltip;