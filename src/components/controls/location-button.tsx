'use client';
import { useContext } from 'react';
import { GlobeContext, GlobeContextProps } from '@/context/globe-context';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import ButtonTooltip from '@/components/ui/button-tooltip';
import { Locate } from 'lucide-react';

const LocationButton = () => {
  const { setCurrentLocation } = useContext(GlobeContext) as GlobeContextProps;
  const t = useTranslations('globe.controls');

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        date: new Date()
      });
    });
  }

  return (
    <ButtonTooltip
        button={
          <Button
            onClick={getCurrentLocation}
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Locate className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('location.tooltip')}
      />
  );
}

export default LocationButton;