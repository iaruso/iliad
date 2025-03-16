import { FC } from 'react';
import { useTranslations } from 'next-intl';
import ButtonTooltip from '@/components/ui/button-tooltip';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  Minus,
  Rotate3D,
  Maximize,
  //Shrink,
  Locate,
  Camera,
  RotateCcw
} from 'lucide-react';

const Controls: FC = () => {
  const t = useTranslations('globe.controls');
  return (
    <div className='relative top-2 right-10 flex flex-col justify-start items-center gap-2 !w-8'>
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Plus className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('zoomIn.tooltip')}
      />
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Minus className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('zoomOut.tooltip')}
      />
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Rotate3D className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('rotate.tooltip')}
      />
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Maximize className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('maximize.tooltip')}
      />
      {/* <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Shrink className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('minimize.tooltip')}
      /> */}
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Locate className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('location.tooltip')}
      />
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <Camera className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('print.tooltip')}
      />
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
          >
            <RotateCcw className='!h-3.5 !w-3.5 stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('reset.tooltip')}
      />
    </div>
  );
};

export default Controls;