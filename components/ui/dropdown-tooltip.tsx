'use client'

import React, { ReactNode, FC } from 'react'
import ButtonTooltip from '@/components/ui/button-tooltip'
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
      <ButtonTooltip button={button} tooltip={tooltip} isDropdown/>
      <DropdownMenuContent side='top' align='end' onCloseAutoFocus={(e) => e.preventDefault()}>
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownTooltip;