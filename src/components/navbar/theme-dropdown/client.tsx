'use client'
import { FC } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui-custom/button'
import { Moon, Sun } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui-custom/dropdown-menu'
import DropdownTooltip from '@/components/ui-custom/dropdown-tooltip'

interface ThemeDropdownClientProps {
  tooltip: string
  labels: Record<'light' | 'dark' | 'system', string>
}

const ThemeDropdownClient: FC<ThemeDropdownClientProps> = ({ tooltip, labels }) => {
  const { setTheme } = useTheme()

  return (
    <DropdownTooltip
      button={
        <Button
          variant='secondary'
          size='icon'
          className='shadow-none h-6 w-6'
          aria-label={tooltip}
        >
          <Sun className='h-4! w-4! rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-4! w-4! rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
        </Button>
      }
      tooltip={tooltip}
      content={(['light', 'dark', 'system'] as const).map((theme) => (
        <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
          {labels[theme]}
        </DropdownMenuItem>
      ))}
    />
  )
}

export default ThemeDropdownClient
