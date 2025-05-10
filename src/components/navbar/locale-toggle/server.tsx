import { getTranslations } from 'next-intl/server'
import LocaleToggleClient from './client'

const LocaleToggleServer = async () => {
  const t = await getTranslations('navbar.options.locale')
  return <LocaleToggleClient tooltip={t('tooltip')} labels={{
    en: t('en'),
    pt: t('pt')
  }} />
}

export default LocaleToggleServer
