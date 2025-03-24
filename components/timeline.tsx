import { FC, Dispatch, SetStateAction } from 'react';
import { useTranslations } from 'next-intl';
import ButtonTooltip from '@/components/ui/button-tooltip';
import DropdownTooltip from '@/components/ui/dropdown-tooltip';
import PopoverTooltip from '@/components/ui/popover-tooltip';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { RangeCalendar } from '@/components/ui/calendar-rac';
import { Button } from '@/components/ui/button';
import { SkipBack, Play, Pause, SkipForward, Calendar } from 'lucide-react';
import { DateRange } from 'react-aria-components';

interface TimelineProps {
  date: Date;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  timelineSpeed: number;
  setTimelineSpeed: (speed: number) => void;
  setMoment: (moment: 'start' | 'end') => void;
  dateRange: DateRange | null;
  setDateRange: Dispatch<SetStateAction<DateRange | null>>;
}

const Timeline: FC<TimelineProps> = ({ 
  date,
  isPlaying,
  setIsPlaying,
  timelineSpeed,
  setTimelineSpeed,
  setMoment,
  dateRange,
  setDateRange
}) => {
  const t = useTranslations('globe.timeline');
  return (
    <div className='flex items-center p-2 h-12 gap-2'>
      <ButtonTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
            onClick={() => {
              setIsPlaying(false);
              setMoment('start');
            }}
          >
            <SkipBack className='!h-3.5 !w-3.5 fill-primary stroke-primary' strokeWidth={2.5}/>
          </Button>
        }
        tooltip={t('skipBack.tooltip')}
      />
      <Button
        variant={'outline'}
        className='!h-8 !w-8 cursor-pointer p-0'
        onClick={() => {
          setIsPlaying(!isPlaying);
        }}
      > 
        {
          isPlaying
            ? <Pause className='!h-3.5 !w-3.5 fill-primary stroke-primary'/>
            : <Play className='!h-3.5 !w-3.5 fill-primary stroke-primary'/>
        }
      </Button>
      <Button
        variant={'outline'}
        className='!h-8 !w-8 cursor-pointer p-0'
        onClick={() => {
          setIsPlaying(false);
          setMoment('end');
        }}
      >
        <SkipForward className='!h-3.5 !w-3.5 fill-primary stroke-primary' strokeWidth={2.5}/>
      </Button>
      <DropdownTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0 text-xs'
          >
            {t(`speed.options.${String(timelineSpeed).replace('.', '_')}`)}
          </Button>
        }
        tooltip={t('speed.tooltip')}
        content={
          [0.5, 1, 2].map((speed) => (
            <DropdownMenuItem
              key={speed}
              onClick={() => setTimelineSpeed(speed)}
            >
              {t(`speed.options.${String(speed).replace('.', '_')}`)}
            </DropdownMenuItem>
          ))
        }
      />
      <PopoverTooltip
        button={
          <Button
            variant={'outline'}
            className='!h-8 w-48 cursor-pointer px-2.5 text-xs'
          >
            <Calendar className='!h-3.5 !w-3.5 stroke-primary'/>
            {dateRange ? `${dateRange.start} - ${dateRange.end}` : t('calendar.tooltip')}
          </Button>
        }
        tooltip={t('calendar.tooltip')}
        content={
          <RangeCalendar className='rounded-md border p-2 bg-background' value={dateRange} onChange={setDateRange} />
        }
      />
      <div className='flex flex-1 rounded-md border !h-8'>
        <div className='flex-1'></div>
        <div className='border-l bg-muted/60 text-xs font-medium flex items-center justify-center w-20'>
          {date.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Timeline;