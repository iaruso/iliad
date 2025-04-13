'use client';
import { useContext } from 'react';
import { GlobeContext, GlobeContextProps } from '@/context/globe-context';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import ButtonTooltip from '@/components/ui/button-tooltip';
import { Plus, Minus } from 'lucide-react';

const ZoomButtons = () => {
  const { globeRef, altitude, setAltitude } = useContext(GlobeContext) as GlobeContextProps;
  const t = useTranslations('globe.controls');

  const handleZoomIn = () => {
    if (globeRef.current) {
      const currentAltitude = globeRef.current.pointOfView().altitude;
      const decrement = currentAltitude < 0.2 ? 0.01 : 0.1;
      const newAltitude = currentAltitude - decrement;
      setAltitude(newAltitude);
      globeRef.current.pointOfView({ altitude: newAltitude });
    }
  };

  const handleZoomOut = () => {
    if (globeRef.current) {
      const currentAltitude = globeRef.current.pointOfView().altitude;
      const increment = currentAltitude < 0.2 ? 0.01 : 0.1;
      const newAltitude = currentAltitude + increment;
      setAltitude(newAltitude);
      globeRef.current.pointOfView({ altitude: newAltitude });
    }
  };

  return (
    <>
      <ButtonTooltip
        button={
          <Button onClick={handleZoomIn} variant="outline" className="!h-8 !w-8 cursor-pointer p-0" disabled={altitude <= 0.01}>
            <Plus className="!h-3.5 !w-3.5 stroke-primary" strokeWidth={2.5} />
          </Button>
        }
        tooltip={t('zoomIn.tooltip')}
      />
      <ButtonTooltip
        button={
          <Button onClick={handleZoomOut} variant="outline" className="!h-8 !w-8 cursor-pointer p-0" disabled={altitude >= 3.9}>
            <Minus className="!h-3.5 !w-3.5 stroke-primary" strokeWidth={2.5} />
          </Button>
        }
        tooltip={t('zoomOut.tooltip')}
      />
    </>
  );
};

export default ZoomButtons;
