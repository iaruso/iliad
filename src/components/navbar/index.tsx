import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui-custom/badge'
import ThemeToggle from './theme-dropdown'
import LocaleToggle from './locale-dropdown'
import HelperDropdown from './helper-dropdown'
import SettingsDropdown from './settings-dropdown'

const Navbar = async () => {
  const t = await getTranslations('navbar')

  return (
    <nav className='border-t h-12 flex items-center py-2 px-2 justify-between gap-2'>
      <div className='flex items-start gap-2'>
        <h1 className='font-[550] select-none line-clamp-1'>{t('app')}</h1>
        <Badge variant='minimal' className='tabular-nums'>beta-v2</Badge>
      </div>
      <div className='flex items-center gap-1.5'>
        <ThemeToggle />
        <LocaleToggle />
        <HelperDropdown />
        <SettingsDropdown />
      </div>
    </nav>
  )
}

export default Navbar
