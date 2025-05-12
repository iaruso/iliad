import { getTranslations } from 'next-intl/server'
import SettingsDropdownClient from './client'

const SettingsDropdownServer = async () => {
  const t = await getTranslations('navbar.options.settings')

  return (
    <SettingsDropdownClient
      tooltip={t('tooltip')}
      labels={{
        points: t('data.options.points.title'),
        heatmap: t('data.options.heatmaps.title'),
        labels: t('labels.title'),
        time: t('time.title'),
        textures: t('textures.title'),
        on: t('time.options.on'),
        off: t('time.options.off'),
        low: t('textures.options.low'),
        high: t('textures.options.high'),
      }}
    />
  )
}

export default SettingsDropdownServer
