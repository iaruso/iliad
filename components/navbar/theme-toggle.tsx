'use client'

import { FC } from 'react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import DropdownTooltip from '@/components/ui/dropdown-tooltip'


const ThemeToggle: FC = () => {
  const t = useTranslations('navbar.options.theme')
  const { setTheme } = useTheme()
  return (
    <DropdownTooltip
      button={
        <Button variant='secondary' size='icon' className='shadow-none h-6 w-6'>
          <Sun className='!h-4 !w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'/>
          <Moon className='absolute !h-4 !w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'/>
        </Button>
      }
      tooltip={t('tooltip')}
      content={['light', 'dark', 'system'].map((theme) => (
        <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
          {t(theme)}
        </DropdownMenuItem>
      ))}
    />
  )
}

export default ThemeToggle
