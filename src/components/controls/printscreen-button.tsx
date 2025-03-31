'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ButtonTooltip from '@/components/ui/button-tooltip';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const PrintScreenButton = () => {
  const t = useTranslations('globe.controls');
  const downloadCanvas = () => {
    const canvas = document.querySelector('.scene-container canvas') as HTMLCanvasElement | null;
    if (!canvas) {
      console.error('Canvas element not found. Ensure the selector is correct and the canvas exists.');
      return;
    }
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = 'screenshot.jpeg';
      link.href = canvas.toDataURL('image/jpeg');
      link.click();
    }, 1000);
  };
  return (
    <ButtonTooltip
      button={
        <Button
          variant={'outline'}
          className='!h-8 !w-8 cursor-pointer p-0'
          onClick={downloadCanvas}
        >
          <Camera className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
        </Button>
      }
      tooltip={t('print.tooltip')}
    />
  );
}

export default PrintScreenButton;