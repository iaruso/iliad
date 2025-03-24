'use client';
import { useContext } from 'react';
import { GlobeContext, GlobeContextProps } from '@/context/globe-context';
import DropdownTooltip from '@/components/ui/dropdown-tooltip';
import { 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import CustomSwitch from '../ui/custom-switch';

const TexturesDropdown = () => {
  const { 
    viewType,
    setViewType,
    textureQuality,
    setTextureQuality,
    dayNight,
    setDayNight
  } = useContext(GlobeContext) as GlobeContextProps;
  const t = useTranslations('globe.controls');
  return (
    <DropdownTooltip
      className='absolute -top-9 right-10 w-80'
      button={
        <Button
          variant={'outline'}
          className='!h-8 !w-8 cursor-pointer p-0'
        >
          <Layers className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
        </Button>
      }
      tooltip={t('layers.tooltip')}
      align='end'
      side='bottom'
      content={
        <>
          <DropdownMenuLabel className='h-10 flex items-center px-2 py-1'>{t('layers.data.title')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setViewType('heatmap')} className='h-fit p-1 ml-1 mr-2 rounded-md' disabled={viewType === 'heatmap'}>
            <div className='h-16 w-full flex gap-2'>
              <div className='h-full aspect-square bg-background rounded-sm border'></div>
              <div className='flex flex-col gap-1'>
                <p className='text-sm font-medium'>{t('layers.data.options.heatmaps.title')}</p>
                <p className='text-xs text-muted-foreground'>{t('layers.data.options.heatmaps.description')}</p>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewType('points')} className='h-fit p-1 ml-1 mr-2 rounded-md' disabled={viewType === 'points'}>
            <div className='h-16 w-full flex gap-2'>
              <div className='h-full aspect-square bg-background rounded-sm border'></div>
              <div className='flex flex-col gap-1'>
                <p className='text-sm font-medium'>{t('layers.data.options.points.title')}</p>
                <p className='text-xs text-muted-foreground'>{t('layers.data.options.points.description')}</p>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className='px-2 py-1'>
            <div className='flex items-center justify-between p-0'>
              <p>{t('layers.textures.title')}</p>
              <CustomSwitch 
                checked={textureQuality === 'high'}
                onChange={() => setTextureQuality(textureQuality === 'high' ? 'low' : 'high')}
                falseLabel={t('layers.textures.options.low')}
                trueLabel={t('layers.textures.options.high')}
              />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className='px-2 py-1'>
            <div className='flex items-center justify-between p-0'>
              <p>{t('layers.time.title')}</p>
              <CustomSwitch 
                checked={dayNight}
                onChange={() => setDayNight(!dayNight)}
                falseLabel={t('layers.time.options.off')}
                trueLabel={t('layers.time.options.on')}
              />
            </div>
          </DropdownMenuLabel>
        </>
      }
    />
  );
}

export default TexturesDropdown;