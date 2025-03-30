'use client'

import React, { ReactNode, FC } from 'react'
import ButtonTooltip from '@/components/ui/button-tooltip'
import {
  Popover,
  PopoverContent
} from '@/components/ui/popover'

interface DropdownTooltipProps {
  button: ReactNode;
  tooltip: string;
  content: ReactNode;
}

const DropdownTooltip: FC<DropdownTooltipProps> = ({ button, tooltip, content }) => {
  return (
    <Popover>
      <ButtonTooltip button={button} tooltip={tooltip} isPopover/>
      <PopoverContent className='border-none p-0 w-fit' side='top' align='end' onCloseAutoFocus={(e) => e.preventDefault()}>
        {content}
      </PopoverContent>
    </Popover>
  )
}

export default DropdownTooltip;