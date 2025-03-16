'use client'

import React, { ReactNode, FC } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PopoverTrigger } from '@/components/ui/popover'

interface ButtonTooltipProps {
  button: ReactNode;
  tooltip: string;
  isDropdown?: boolean;
  isPopover?: boolean;
}

const ButtonTooltip: FC<ButtonTooltipProps> = ({ button, tooltip, isDropdown = false, isPopover = false }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          { isDropdown ? (
            <DropdownMenuTrigger asChild>
              {button}
            </DropdownMenuTrigger>
            ) : isPopover ? (
            <PopoverTrigger asChild>
              {button}
            </PopoverTrigger>
            ) : button
          }
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ButtonTooltip;