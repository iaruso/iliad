import { getTranslations } from 'next-intl/server'
import FullscreenToggleClient from './client'

const FullscreenToggleServer = async () => {
  const t = await getTranslations('globe.controls')

  return (
    <FullscreenToggleClient
      tooltipMinimize={t('minimize.tooltip')}
      tooltipMaximize={t('maximize.tooltip')}
      manualExitText={t('manualExit')}
    />
  )
}

export default FullscreenToggleServer
