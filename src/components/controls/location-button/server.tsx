import { getTranslations } from 'next-intl/server'
import LocationButtonClient from './client'

const LocationButton = async () => {
  const t = await getTranslations('globe.controls')

  return <LocationButtonClient tooltipText={t('location.tooltip')} />
}

export default LocationButton
