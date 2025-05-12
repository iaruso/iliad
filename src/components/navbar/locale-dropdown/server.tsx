import { getTranslations } from 'next-intl/server'
import LocaleDropdownClient from './client'

const LocaleDropdownServer = async () => {
  const t = await getTranslations('navbar.options.locale')
  return <LocaleDropdownClient tooltip={t('tooltip')} labels={{
    en: t('en'),
    pt: t('pt')
  }} />
}

export default LocaleDropdownServer
