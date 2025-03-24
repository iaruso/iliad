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

const TexturesDropdown = () => {
  const { viewType, setViewType } = useContext(GlobeContext) as GlobeContextProps;
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
          <DropdownMenuLabel>{t('layers.data.title')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setViewType('heatmap')} className='h-fit p-1' disabled={viewType === 'heatmap'}>
            <div className='h-16 w-full flex gap-2'>
              <div className='h-full aspect-square bg-background rounded-sm border'></div>
              <p>{t('layers.data.options.heatmaps')}</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewType('points')} className='h-fit p-1' disabled={viewType === 'points'}>
            <div className='h-16 w-full flex gap-2'>
              <div className='h-full aspect-square bg-background rounded-sm border'></div>
              <p>{t('layers.data.options.points')}</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            <div>
              <p>{t('layers.textures.title')}</p>

            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            <div>
              <p>{t('layers.time.title')}</p>
              
            </div>
          </DropdownMenuLabel>
        </>
      }
    />
  );
}

export default TexturesDropdown;