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
import { Badge } from '@/components/ui-custom/badge'

interface SettingsDropdownClientProps {
  tooltip: string
  labels: {
    representation: string
    points: string
    pointsDescription: string
    smudge: string
    smudgeDescription: string
    convex: string
    convexDescription: string
    labels: string
    time: string
    textures: string
    on: string
    off: string
    low: string
    high: string
    mid: string
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
    setLabelsVisible
  } = useContext(GlobeContext) as GlobeContextProps

  return (
    <div className='flex' data-joyride='settings'>
      <DropdownTooltip
        className='absolute bottom-8 -right-6 w-80'
        button={
          <Button
            variant='secondary'
            size='icon'
            className='shadow-none h-6 w-6'
            aria-label={tooltip}
          >
            <Settings className='h-4! w-4!' />
          </Button>
        }
        tooltip={tooltip}
        align='start'
        side='bottom'
        content={
          <>
            <>
              <DropdownMenuLabel className='h-10 flex items-center justify-between px-2 py-1'>
                {labels.representation}
                <Badge variant='minimal' className='text-xs px-1 py-0.5 h-auto'>
                  {viewType === 'points' && labels.points}
                  {viewType === 'convex' && labels.convex}
                  {viewType === 'smudge' && labels.smudge}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setViewType('points')}
                className='h-fit border-b -mx-1 -mt-1 rounded-none'
                disabled={viewType === 'points'}
              >
                <div className='h-16 w-full flex gap-2 px-1 pt-1'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-sm font-medium'>{labels.points}</p>
                    <span className='text-xs text-muted-foreground'>
                      {labels.pointsDescription}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewType('convex')}
                className='h-fit border-b -mx-1 -mt-1 rounded-none'
                disabled={viewType === 'convex'}
              >
                <div className='h-16 w-full flex gap-2 px-1 pt-1'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-sm font-medium'>{labels.convex}</p>
                    <span className='text-xs text-muted-foreground'>
                      {labels.convexDescription}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewType('smudge')}
                className='h-fit border-border/50 -mx-1 -mb-1 rounded-none'
                disabled={viewType === 'smudge'}
              >
                <div className='h-16 w-full flex gap-2 px-1 pt-1'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-sm font-medium'>{labels.smudge}</p>
                    <span className='text-xs text-muted-foreground'>
                      {labels.smudgeDescription}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>    
            <DropdownMenuLabel className='px-2 py-1'>
              <div className='flex items-center justify-between'>
                <p>{labels.textures}</p>
                <CustomSwitch
                  value={textureQuality === 'high' ? 'true' : textureQuality === 'low' ? 'false' : 'extra'}
                  onChange={(value) =>
                    setTextureQuality(
                      value === 'true' ? 'high' : value === 'false' ? 'low' : 'mid'
                    )
                  }
                  falseLabel={labels.low}
                  trueLabel={labels.high}
                  extraLabel={labels.mid}
                />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className='px-2 py-1'>
              <div className='flex items-center justify-between'>
                <p>{labels.time}</p>
                <CustomSwitch
                  value={dayNight ? 'true' : 'false'}
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
                  value={labelsVisible ? 'true' : 'false'}
                  onChange={() => setLabelsVisible(!labelsVisible)}
                  falseLabel={labels.off}
                  trueLabel={labels.on}
                />
              </div>
            </DropdownMenuLabel>
          </>
        }
      />
    </div>
  )
}

export default SettingsDropdownClient
