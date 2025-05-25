import { getTranslations } from 'next-intl/server'
import SettingsDropdownClient from './client'

const SettingsDropdownServer = async () => {
  const t = await getTranslations('navbar.options.settings')

  return (
    <SettingsDropdownClient
      tooltip={t('tooltip')}
      labels={{
        representation: t('data.title'),
        points: t('data.options.points.title'),
        pointsDescription: t('data.options.points.description'),
        smudge: t('data.options.smudge.title'),
        smudgeDescription: t('data.options.smudge.description'),
        convex: t('data.options.convex.title'),
        convexDescription: t('data.options.convex.description'),
        labels: t('labels.title'),
        time: t('time.title'),
        textures: t('textures.title'),
        on: t('time.options.on'),
        off: t('time.options.off'),
        low: t('textures.options.low'),
        high: t('textures.options.high'),
        mid: t('textures.options.mid'),
      }}
    />
  )
}

export default SettingsDropdownServer
