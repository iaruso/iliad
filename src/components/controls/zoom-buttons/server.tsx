import { getTranslations } from 'next-intl/server'
import ZoomButtonsClient from './client'

const ZoomButtonsServer = async () => {
  const t = await getTranslations('globe.controls')

  return (
    <ZoomButtonsClient
      tooltipZoomIn={t('zoomIn.tooltip')}
      tooltipZoomOut={t('zoomOut.tooltip')}
    />
  )
}

export default ZoomButtonsServer
