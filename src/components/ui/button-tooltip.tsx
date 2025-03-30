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
import { DialogTrigger } from '@/components/ui/dialog'

interface ButtonTooltipProps {
  button: ReactNode;
  tooltip: string;
  isDropdown?: boolean;
  isPopover?: boolean;
  isDialog?: boolean;
}

const ButtonTooltip: FC<ButtonTooltipProps> = ({ button, tooltip, isDropdown = false, isPopover = false, isDialog = false }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            {isDropdown || isPopover || isDialog ? (
              React.cloneElement(
              isDropdown ? <DropdownMenuTrigger asChild /> :
              isPopover ? <PopoverTrigger asChild /> :
              <DialogTrigger asChild />,
              {},
              button
              )
            ) : (
              button
            )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ButtonTooltip;