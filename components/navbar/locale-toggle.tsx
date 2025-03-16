'use client'

import { FC } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Locale } from '@/types/locale'
import { locales, usePathname, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import DropdownTooltip from '@/components/ui/dropdown-tooltip'

const LocaleToggle: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('navbar.options.locale')

  const changeLanguage = (locale: Locale) => {
    const newSearchParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    router.replace(`${pathname}?${newSearchParams}`, { locale: locale})
  }

  return (
    <DropdownTooltip
      button={
        <Button variant='secondary' size='icon' className='shadow-none h-6 w-6'>
          <Globe className='h-4! w-4!'/>
        </Button>
      }
      tooltip={t('tooltip')}
      content={locales.filter((locale): locale is Locale => locale !== null && locale !== undefined).map((locale: Locale) => (
        <DropdownMenuItem key={locale} onClick={() => changeLanguage(locale)}>
          {t(locale)}
        </DropdownMenuItem>
      ))}
    />
  )
}

export default LocaleToggle