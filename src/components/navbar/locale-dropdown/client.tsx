'use client'

import { FC } from 'react'
import { useSearchParams } from 'next/navigation'
import { Locale } from '@/@types/locale'
import { locales } from '@/i18n/routing'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui-custom/button'
import { Globe } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui-custom/dropdown-menu'
import DropdownTooltip from '@/components/ui-custom/dropdown-tooltip'

interface LocaleDropdownClientProps {
  tooltip: string
  labels: Record<Locale, string>
}

const LocaleDropdownClient: FC<LocaleDropdownClientProps> = ({ tooltip, labels }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const changeLanguage = (locale: Locale) => {
    const newSearchParams = new URLSearchParams(Array.from(searchParams.entries()))
    router.replace(`${pathname}?${newSearchParams}`, { locale })
  }

  return (
    <DropdownTooltip
      button={
        <Button
          variant='secondary'
          size='icon'
          className='shadow-none h-6 w-6'
          aria-label={tooltip}
        >
          <Globe className='h-4! w-4!' />
        </Button>
      }
      tooltip={tooltip}
      content={locales
        .filter((locale): locale is Locale => !!locale)
        .map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => changeLanguage(locale)}>
            {labels[locale]}
          </DropdownMenuItem>
        ))}
    />
  )
}

export default LocaleDropdownClient
