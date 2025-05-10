import { getTranslations } from 'next-intl/server'
import ThemeToggleClient from './client'

const ThemeToggleServer = async () => {
  const t = await getTranslations('navbar.options.theme')
  return <ThemeToggleClient tooltip={t('tooltip')} labels={{
    light: t('light'),
    dark: t('dark'),
    system: t('system')
  }} />
}

export default ThemeToggleServer
