import { FC } from 'react'
import FullscreenToggle from './fullscreen-toggle'
import LocationButton from './location-button'
import ZoomButtons from './zoom-buttons'

const Controls: FC = () => {
  return (
    <div className='absolute top-2 right-2 flex flex-col justify-start items-center gap-2 !w-8 z-10' data-joyride='globe-controls'>
      <ZoomButtons />
      <FullscreenToggle />
      <LocationButton />
    </div>
  )
}

export default Controls
