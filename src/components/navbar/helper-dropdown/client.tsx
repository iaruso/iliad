'use client'
import { FC, useEffect } from 'react'
import { Button } from '@/components/ui-custom/button'
import { CircleHelp } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui-custom/dropdown-menu'
import DropdownTooltip from '@/components/ui-custom/dropdown-tooltip'
import { useJoyride } from '@/providers/joyride-provider'
import { useSearchParams } from 'next/navigation'

interface HelperDropdownClientProps {
  tooltip: string
  labels: Record<
    'default' | 'globe' | 'timeline' | 'dataAll' | 'dataOne', string
  >
}

const HelperDropdownClient: FC<HelperDropdownClientProps> = ({ tooltip, labels }) => {
  const searchParams = useSearchParams()
  const oilspill = searchParams.get('oilspill')
  const { startTour } = useJoyride();

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const tutorialCookie = cookies.find(c => c.startsWith('tutorial='));
    if (!tutorialCookie) {
      startTour('default');
    }
  }, [startTour]);

  return (
    <div className='flex' data-joyride='helper'>
      <DropdownTooltip
        button={
          <Button
            variant='secondary'
            size='icon'
            className='shadow-none h-6 w-6'
            aria-label={tooltip}
          >
            <CircleHelp className='h-4! w-4!' />
          </Button>
        }
        tooltip={tooltip}
        content={([
          'default', 'globe', 'timeline',
          oilspill ? 'dataOne' : 'dataAll'
        ] as const).map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => startTour(option)}
          >
            {labels[option]}
          </DropdownMenuItem>
        ))}
      />
    </div>
  )
}

export default HelperDropdownClient
