import React, { ReactNode, FC } from 'react'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import {
  DropdownMenu,
  DropdownMenuContent
} from '@/components/ui-custom/dropdown-menu'

interface DropdownTooltipProps {
  className?: string;
  button: ReactNode;
  tooltip: string;
  content: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
}

const DropdownTooltip: FC<DropdownTooltipProps> = ({ className, button, tooltip, content, side = 'top', align = 'end' }) => {
  return (
    <DropdownMenu>
      <ButtonTooltip button={button} tooltip={tooltip} isDropdown/>
      <DropdownMenuContent className={className} side={side} align={align} onCloseAutoFocus={(e) => e.preventDefault()}>
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownTooltip;