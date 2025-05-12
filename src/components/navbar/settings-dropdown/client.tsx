'use client'

import { FC, useContext } from 'react'
import { GlobeContext, GlobeContextProps } from '@/context/globe-context'
import DropdownTooltip from '@/components/ui-custom/dropdown-tooltip'
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui-custom/dropdown-menu'
import { Button } from '@/components/ui-custom/button'
import { Settings } from 'lucide-react'
import CustomSwitch from '@/components/ui-custom/custom-switch'

interface SettingsDropdownClientProps {
  tooltip: string
  labels: {
    points: string
    heatmap: string
    labels: string
    time: string
    textures: string
    on: string
    off: string
    low: string
    high: string
  }
}

const SettingsDropdownClient: FC<SettingsDropdownClientProps> = ({ tooltip, labels }) => {
  const {
    viewType,
    setViewType,
    textureQuality,
    setTextureQuality,
    dayNight,
    setDayNight,
    labelsVisible,
    setLabelsVisible,
    supportsWebGPU
  } = useContext(GlobeContext) as GlobeContextProps

  return (
    <DropdownTooltip
      className='absolute bottom-8 -right-6 w-80'
      button={
        <Button variant='secondary' size='icon' className='shadow-none h-6 w-6'>
          <Settings className='h-4! w-4!' />
        </Button>
      }
      tooltip={tooltip}
      align='start'
      side='bottom'
      content={
        <>
          {supportsWebGPU && (
            <>
              <DropdownMenuLabel className='h-10 flex items-center px-2 py-1'>{tooltip}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setViewType('points')}
                className='h-fit border-b -mx-1 -mt-1 rounded-none'
                disabled={viewType === 'points'}
              >
                <div className='h-16 w-full flex gap-2 px-1 pt-1'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-sm font-medium'>{labels.points}</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewType('heatmap')}
                className='h-fit border-border/50 -mx-1 -mb-1 rounded-none'
                disabled={viewType === 'heatmap'}
              >
                <div className='h-16 w-full flex gap-2 px-1 pt-1'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-sm font-medium'>{labels.heatmap}</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuLabel className='px-2 py-1'>
            <div className='flex items-center justify-between'>
              <p>{labels.textures}</p>
              <CustomSwitch
                checked={textureQuality === 'high'}
                onChange={() =>
                  setTextureQuality(textureQuality === 'high' ? 'low' : 'high')
                }
                falseLabel={labels.low}
                trueLabel={labels.high}
              />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className='px-2 py-1'>
            <div className='flex items-center justify-between'>
              <p>{labels.time}</p>
              <CustomSwitch
                checked={dayNight}
                onChange={() => setDayNight(!dayNight)}
                falseLabel={labels.off}
                trueLabel={labels.on}
              />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className='px-2 py-1'>
            <div className='flex items-center justify-between'>
              <p>{labels.labels}</p>
              <CustomSwitch
                checked={labelsVisible}
                onChange={() => setLabelsVisible(!labelsVisible)}
                falseLabel={labels.off}
                trueLabel={labels.on}
              />
            </div>
          </DropdownMenuLabel>
        </>
      }
    />
  )
}

export default SettingsDropdownClient
