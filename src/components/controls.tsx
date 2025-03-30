import { FC } from 'react';
import { useTranslations } from 'next-intl';
import ZoomButtons from '@/components/controls/zoom-buttons';
import FullscreenToggle from '@/components/controls/fullscreen-toggle';
import LocationButton from '@/components/controls/location-button';
import PrintScreenButton from '@/components/controls/printscreen-button';
import TexturesDropdown from '@/components/controls/textures-dropdown';

const Controls: FC = () => {
  const t = useTranslations('globe.controls');
  return (
    <div className='absolute top-2 right-2 flex flex-col justify-start items-center gap-2 !w-8 z-10'>
      <ZoomButtons />
      <FullscreenToggle />
      <LocationButton />
      <PrintScreenButton />
      <TexturesDropdown />
    </div>
  );
};

export default Controls;