'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ButtonTooltip from '@/components/ui/button-tooltip';
import { useTranslations } from 'next-intl';
import { Maximize, Shrink } from 'lucide-react';

const FullscreenToggle = () => {
  const t = useTranslations('globe.controls');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      const usingFullscreenAPI = !!document.fullscreenElement;
      const usingF11 = window.innerHeight === screen.height && !usingFullscreenAPI;
      setIsFullscreen(usingFullscreenAPI || usingF11);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('visibilitychange', checkFullscreen);
    window.addEventListener('resize', checkFullscreen);

    checkFullscreen(); // Estado inicial

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('visibilitychange', checkFullscreen);
      window.removeEventListener('resize', checkFullscreen);
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (window.innerHeight === screen.height) {
      alert(t('manualExit'));
    } else {
      document.documentElement.requestFullscreen?.();
    }
  };

  return (
    <ButtonTooltip
      button={
        <Button
          variant="outline"
          className="!h-8 !w-8 cursor-pointer p-0"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Shrink className="!h-3.5 !w-3.5 stroke-primary" strokeWidth={2} />
          ) : (
            <Maximize className="!h-3.5 !w-3.5 stroke-primary" strokeWidth={2.5} />
          )}
        </Button>
      }
      tooltip={t(isFullscreen ? 'minimize.tooltip' : 'maximize.tooltip')}
    />
  );
};

export default FullscreenToggle;
