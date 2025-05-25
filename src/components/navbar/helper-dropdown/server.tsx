import { getTranslations } from 'next-intl/server'
import HelperDropdownClient from './client'

const HelperDropdownServer = async () => {
  const t = await getTranslations('navbar.options.helper')
  return <HelperDropdownClient
    tooltip={t('tooltip')}
    labels={{
      default: t('options.default.title'),
      globe: t('options.globe.title'),
      timeline: t('options.timeline.title'),
      dataAll: t('options.data.title'),
      dataOne: t('options.data.title')
    }}
  />
}

export default HelperDropdownServer
