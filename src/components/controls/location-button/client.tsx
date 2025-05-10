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
  const { setCurrentLocation } = useContext(GlobeContext) as GlobeContextProps

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        date: new Date(),
      })
    })
  }

  return (
    <ButtonTooltip
      button={
        <Button onClick={getCurrentLocation} variant={'outline'} className='!h-8 !w-8 cursor-pointer p-0'>
          <Locate className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5} />
        </Button>
      }
      tooltip={tooltipText}
    />
  )
}

export default LocationButtonClient
