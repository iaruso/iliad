import { getTranslations } from 'next-intl/server'
import PrintScreenButtonClient from './client'

const PrintScreenButtonServer = async () => {
  const t = await getTranslations('globe.controls')

  return <PrintScreenButtonClient tooltipText={t('print.tooltip')} />
}

export default PrintScreenButtonServer
