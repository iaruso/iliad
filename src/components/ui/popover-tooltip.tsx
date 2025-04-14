'use client'

import React, { ReactNode, FC } from 'react'
import ButtonTooltip from '@/components/ui/button-tooltip'
import {
  Popover,
  PopoverContent
} from '@/components/ui/popover'

interface PopoverTooltipProps {
  button: ReactNode;
  tooltip: string;
  content: ReactNode;
  className?: string;
}

const PopoverTooltip: FC<PopoverTooltipProps> = ({ button, tooltip, content, className }) => {
  return (
    <Popover>
      <ButtonTooltip button={button} tooltip={tooltip} isPopover/>
      <PopoverContent className={`${className}`} side='top' align='end' onCloseAutoFocus={(e) => e.preventDefault()}>
        {content}
      </PopoverContent>
    </Popover>
  )
}

export default PopoverTooltip;