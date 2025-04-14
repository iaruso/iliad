'use client';
import { FC, useContext, useMemo } from 'react';
import { GlobeContext, GlobeContextProps } from '@/context/globe-context';
import { useTranslations } from 'next-intl';
import ButtonTooltip from '@/components/ui/button-tooltip';
import DropdownTooltip from '@/components/ui/dropdown-tooltip';
import PopoverTooltip from '@/components/ui/popover-tooltip';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { RangeCalendar } from '@/components/ui/calendar-rac';
import { Button } from '@/components/ui/button';
import { SkipBack, Play, Pause, SkipForward, Calendar } from 'lucide-react';
import { enUS, pt } from 'date-fns/locale'
import { format } from 'date-fns'
import { useLocale } from 'next-intl';

const Timeline: FC = () => {
  const { 
    date,
    setDate,
    playing,
    setPlaying,
    timelineSpeed,
    setTimelineSpeed,
    dateRange,
    setDateRange,
    groupedGlobeData
  } = useContext(GlobeContext) as GlobeContextProps;
  const locale = useLocale() === 'en' ? enUS : pt;
  const t = useTranslations('globe.timeline');
  const timestamps = useMemo(() => {
    return Object.keys(groupedGlobeData).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );
  }, [groupedGlobeData]);
  
  return (
    <div className='w-full h-12 border-t bg-background'>
      <div className='flex items-center p-2 h-12 gap-2'>
        <ButtonTooltip
          button={
            <Button
              variant={'outline'}
              className='!h-8 !w-8 cursor-pointer p-0'
              onClick={() => {
                setPlaying(false);
                const first = timestamps[0];
                if (first) setDate(new Date(first));
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
            setPlaying(!playing);
          }}
        > 
          {
            playing
              ? <Pause className='!h-3.5 !w-3.5 fill-primary stroke-primary'/>
              : <Play className='!h-3.5 !w-3.5 fill-primary stroke-primary'/>
          }
        </Button>
        <Button
          variant={'outline'}
          className='!h-8 !w-8 cursor-pointer p-0'
          onClick={() => {
            setPlaying(false);
            const last = timestamps[timestamps.length - 1];
            if (last) setDate(new Date(last));
          }}
        >
          <SkipForward className='!h-3.5 !w-3.5 fill-primary stroke-primary' strokeWidth={2.5}/>
        </Button>
        <DropdownTooltip
          button={
            <Button
              variant={'outline'}
              className='!h-8 !w-8 cursor-pointer p-0 text-xs'
              disabled
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
              disabled
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
          className='border-none p-0 w-fit'
        />
        <div className='flex flex-1 rounded-md border !h-8 overflow-hidden relative'>
  {/* timeline por hora */}
  {(() => {
    const start = new Date(timestamps[0]);
    const end = new Date(timestamps[timestamps.length - 1]);

    const fullHourSteps: Date[] = [];
    const cursor = new Date(start);
    cursor.setMinutes(0, 0, 0);

    while (cursor <= end) {
      fullHourSteps.push(new Date(cursor));
      cursor.setHours(cursor.getHours() + 1);
    }

    return fullHourSteps.map((hour) => {
      const hourStr = hour.toISOString();

      const exists = timestamps.some(ts => {
        const d = new Date(ts);
        return d.getFullYear() === hour.getFullYear() &&
               d.getMonth() === hour.getMonth() &&
               d.getDate() === hour.getDate() &&
               d.getHours() === hour.getHours();
      });

      const isActive = hour.getTime() === date.getTime();

      const bg = isActive
        ? 'bg-primary/20'
        : exists
        ? 'bg-muted/20'
        : 'bg-background';

      return (
        <div
          key={hourStr}
          className={`flex-1 h-full transition-colors ${bg}`}
          title={hourStr}
        />
      );
    });
  })()}

  {/* caixa com a data e hora atual */}
  <div className='relative z-20 flex items-center justify-center w-36 border-l bg-muted/60 text-xs font-medium px-1 text-center'>
    {format(date, 'yyyy-MM-dd HH:mm', { locale })}
  </div>
</div>

      </div>
    </div>
  );
};

export default Timeline;