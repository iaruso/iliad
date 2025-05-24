'use client'

import { useContext } from 'react'
import { GlobeContext, type GlobeContextProps } from '@/context/globe-context'
import { Button } from '@/components/ui-custom/button'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import { Plus, Minus } from 'lucide-react'

interface ZoomButtonsClientProps {
  tooltipZoomIn: string
  tooltipZoomOut: string
}

const ZoomButtonsClient = ({
  tooltipZoomIn,
  tooltipZoomOut
}: ZoomButtonsClientProps) => {
  const { globeRef, altitude, setAltitude } = useContext(GlobeContext) as GlobeContextProps

  const handleZoomIn = () => {
    if (globeRef.current) {
      const currentAltitude = globeRef.current.pointOfView().altitude
      const decrement = currentAltitude < 0.2 ? 0.01 : 0.1
      const newAltitude = currentAltitude - decrement
      setAltitude(newAltitude)
      globeRef.current.pointOfView({ altitude: newAltitude })
    }
  }

  const handleZoomOut = () => {
    if (globeRef.current) {
      const currentAltitude = globeRef.current.pointOfView().altitude
      const increment = currentAltitude < 0.2 ? 0.01 : 0.1
      const newAltitude = currentAltitude + increment
      setAltitude(newAltitude)
      globeRef.current.pointOfView({ altitude: newAltitude })
    }
  }

  return (
    <>
      <ButtonTooltip
        button={
          <Button
            onClick={handleZoomIn}
            variant='outline'
            className='!h-8 !w-8 cursor-pointer p-0'
            disabled={altitude <= 0.01}
            aria-label={tooltipZoomIn}
          >
            <Plus className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5} />
          </Button>
        }
        tooltip={tooltipZoomIn}
      />
      <ButtonTooltip
        button={
          <Button
            onClick={handleZoomOut}
            variant='outline'
            className='!h-8 !w-8 cursor-pointer p-0'
            disabled={altitude >= 3.9}
            aria-label={tooltipZoomOut}
          >
            <Minus className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5} />
          </Button>
        }
        tooltip={tooltipZoomOut}
      />
    </>
  )
}

export default ZoomButtonsClient
