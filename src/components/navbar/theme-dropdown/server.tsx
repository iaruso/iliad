import { getTranslations } from 'next-intl/server'
import ThemeDropdownClient from './client'

const ThemeDropdownServer = async () => {
  const t = await getTranslations('navbar.options.theme')
  return <ThemeDropdownClient tooltip={t('tooltip')} labels={{
    light: t('light'),
    dark: t('dark'),
    system: t('system')
  }} />
}

export default ThemeDropdownServer
