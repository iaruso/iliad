'use client'

import { Button } from '@/components/ui-custom/button'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import { Camera } from 'lucide-react'

interface PrintScreenButtonClientProps {
  tooltipText: string
}

const PrintScreenButtonClient = ({ tooltipText }: PrintScreenButtonClientProps) => {
  const downloadCanvas = () => {
    const canvas = document.querySelector('.scene-container canvas') as HTMLCanvasElement | null
    if (!canvas) {
      console.error('Canvas element not found. Ensure the selector is correct and the canvas exists.')
      return
    }

    setTimeout(() => {
      const link = document.createElement('a')
      link.download = 'screenshot.jpeg'
      link.href = canvas.toDataURL('image/jpeg')
      link.click()
    }, 1000)
  }

  return (
    <ButtonTooltip
      button={
        <Button
          variant="outline"
          className="!h-8 !w-8 cursor-pointer p-0"
          onClick={downloadCanvas}
          disabled
        >
          <Camera className="!h-3.5 !w-3.5 stroke-primary" strokeWidth={2.5} />
        </Button>
      }
      tooltip={tooltipText}
    />
  )
}

export default PrintScreenButtonClient
