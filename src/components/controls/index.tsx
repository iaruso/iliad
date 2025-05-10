import { FC } from 'react'
import TexturesDropdown from './textures-dropdown'
import FullscreenToggle from './fullscreen-toggle'
import LocationButton from './location-button'
import PrintScreenButton from './printscreen-button'
import ZoomButtons from './zoom-buttons'

export const Controls: FC = () => {
  return (
    <div className='absolute top-2 right-2 flex flex-col justify-start items-center gap-2 !w-8 z-10'>
      <ZoomButtons />
      <FullscreenToggle />
      <LocationButton />
      <PrintScreenButton />
      <TexturesDropdown />
    </div>
  )
}
