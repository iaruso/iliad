/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'
import { useContext } from 'react'
import { GlobeContext, type GlobeContextProps } from '@/context/globe-context'
import { Button } from '@/components/ui-custom/button'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import { Locate } from 'lucide-react'

interface LocationButtonClientProps {
  tooltipText: string
}

const LocationButtonClient = ({ tooltipText }: LocationButtonClientProps) => {
  const { setCurrentLocation, dataToDisplay } = useContext(GlobeContext) as GlobeContextProps

  const setFirstGlobeLocation = () => {
    if (!dataToDisplay?.length) return
    const firstSpill = dataToDisplay.find(spill => {
      return Object.values(spill.densities || {}).some((d: any) => (d.points?.length ?? 0) > 0)
    })
    if (!firstSpill) return
    const firstDensity = Object.values(firstSpill.densities || {}).find((d: any) => (d.points?.length ?? 0) > 0) as { points: any[] } | undefined
    if (!firstDensity || !firstDensity.points.length) return
    const point = firstDensity.points[0]
    setCurrentLocation({
      lat: point.latitude,
      lng: point.longitude,
      date: new Date(),
    })
  }

  return (
    <ButtonTooltip
      button={
        <Button 
          onClick={setFirstGlobeLocation}
          variant={'outline'}
          className='!h-8 !w-8 cursor-pointer p-0'
          aria-label={tooltipText}
        >
          <Locate className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5} />
        </Button>
      }
      tooltip={tooltipText}
    />
  )
}

export default LocationButtonClient
