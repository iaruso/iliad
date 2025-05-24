'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { FC, useContext, useState, useMemo } from 'react';
import { GlobeContext, GlobeContextProps } from '@/context/globe-context';
import { useTranslations } from 'next-intl';
import ButtonTooltip from '@/components/ui-custom/button-tooltip';
import DropdownTooltip from '@/components/ui-custom/dropdown-tooltip';
import PopoverTooltip from '@/components/ui-custom/popover-tooltip';
import { DropdownMenuItem } from '@/components/ui-custom/dropdown-menu';
import { RangeCalendar } from '@/components/ui-custom/calendar-rac';
import { Button } from '@/components/ui-custom/button';
import { SkipBack, Play, Pause, SkipForward, Calendar } from 'lucide-react';
import { enUS, pt } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface TimelineProps {
  isSingle?: boolean;
}

const Timeline: FC<TimelineProps> = ({ isSingle }) => {
  const {
    date,
    setDate,
    playing,
    setPlaying,
    timelineSpeed,
    setTimelineSpeed,
    dateRange,
    setDateRange,
    groupedGlobeData,
  } = useContext(GlobeContext) as GlobeContextProps;
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasOilspillParam = searchParams.has('oilspill');
  const locale = useMemo(() => {
    const currentLocale = useLocale();
    return currentLocale === 'en' ? enUS : pt;
  }, [useLocale()]);
  const t = useTranslations('globe.timeline');
  const [rangeFilter] = useState<'1d' | '7d' | '30d' | '3m' | '6m' | '1y'>('1y');
  const timestamps = useMemo(() => {
    return Object.keys(groupedGlobeData).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );
  }, [groupedGlobeData]);

  const [minDate, maxDate] = useMemo(() => {
    const dates = timestamps.map(ts => new Date(ts.replace(' ', 'T')));
    dates.sort((a, b) => a.getTime() - b.getTime());
    return [dates[0], dates[dates.length - 1]];
  }, [timestamps]);

  const filteredTimestamps = useMemo(() => {
    if (!minDate || !maxDate) return [];
  
    const cutoff = new Date(maxDate);
  
    switch (rangeFilter) {
      case '1d':
        cutoff.setDate(cutoff.getDate() - 1);
        break;
      case '7d':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(cutoff.getDate() - 30);
        break;
      case '3m':
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case '6m':
        cutoff.setMonth(cutoff.getMonth() - 6);
        break;
      case '1y':
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
    }
  
    return timestamps.filter(ts => {
      const date = new Date(ts.replace(' ', 'T'));
      return date >= cutoff && date <= maxDate;
    });
  }, [timestamps, rangeFilter, minDate, maxDate]);

   const handleDateRangeChange = (newRange: typeof dateRange) => {
    setDateRange(newRange);

    if (newRange?.start && newRange?.end) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('startDate', format(
        typeof newRange.start === 'object' && 'toDate' in newRange.start
          ? newRange.start.toDate('UTC')
          : new Date(newRange.start),
        'yyyy-MM-dd'
      ));
      params.set('endDate', format(
        typeof newRange.end === 'object' && 'toDate' in newRange.end
          ? newRange.end.toDate('UTC')
          : new Date(newRange.end),
        'yyyy-MM-dd'
      ));
      router.replace(`?${params.toString()}`);
    }
  };
  
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
              aria-label={t('skipBack.tooltip')}
            >
              <SkipBack className='!h-3.5 !w-3.5 fill-primary stroke-primary' strokeWidth={2.5}/>
            </Button>
          }
          tooltip={t('skipBack.tooltip')}
        />
        <ButtonTooltip
          button={
          <Button
            variant={'outline'}
            className='!h-8 !w-8 cursor-pointer p-0'
            onClick={() => {
              setPlaying(!playing);
            }}
            aria-label={playing ? t('pause.tooltip') : t('play.tooltip')}
          > 
            {
              playing
                ? <Pause className='!h-3.5 !w-3.5 fill-primary stroke-primary'/>
                : <Play className='!h-3.5 !w-3.5 fill-primary stroke-primary'/>
            }
          </Button>
          }
          tooltip={playing ? t('pause.tooltip') : t('play.tooltip')}
        />
        <ButtonTooltip
          button={
            <Button
              variant={'outline'}
              className='!h-8 !w-8 cursor-pointer p-0'
              onClick={() => {
                setPlaying(false);
                const next = timestamps.find(ts => new Date(ts) > date);
                if (next) setDate(new Date(next));
              }}
              aria-label={t('skipForward.tooltip')}
            >
              <SkipForward className='!h-3.5 !w-3.5 fill-primary stroke-primary' strokeWidth={2.5}/>
            </Button>
          }
          tooltip={t('skipForward.tooltip')}
        />
        <DropdownTooltip
          button={
            <Button
              variant={'outline'}
              className='!h-8 !w-8 cursor-pointer p-0 text-xs'
              aria-label={t('speed.tooltip')}
            >
              {t(`speed.options.${String(timelineSpeed).replace('.', '_')}`)}
            </Button>
          }
          tooltip={t('speed.tooltip')}
          content={
            [0.5, 1, 2].map((speed) => (
              <DropdownMenuItem
                className='text-right'
                key={speed}
                onClick={() => setTimelineSpeed(speed)}
              >
                {t(`speed.options.${String(speed).replace('.', '_')}`)}
              </DropdownMenuItem>
            ))
          }
        />
        {
          hasOilspillParam ? (
            <div className='flex w-48 px-2.5 text-xs gap-2 text-foreground !h-8 border rounded-md justify-center items-center'>
              <Calendar className='!h-3.5 !w-3.5 stroke-foreground' />
              {minDate && maxDate
                ? `${format(minDate, 'yyyy-MM-dd')} - ${format(maxDate, 'yyyy-MM-dd')}`
                : '—'}
            </div>
          ) : (
          <PopoverTooltip
              button={
                <Button
                  variant={'outline'}
                  className='!h-8 w-48 cursor-pointer px-2.5 text-xs'
                  aria-label={t('calendar.tooltip')}
                >
                  <Calendar className='!h-3.5 !w-3.5 stroke-primary'/>
                  {dateRange ? `${dateRange.start} - ${dateRange.end}` : t('calendar.tooltip')}
                </Button>
              }
              tooltip={t('calendar.tooltip')}
              content={
                <RangeCalendar
                  className='rounded-md border p-2 bg-background'
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              }
              className='border-none p-0 w-fit'
            />
          )
        }
        <div className='flex flex-1 rounded-md border !h-8 overflow-hidden relative'>
          <div className='flex-1 flex items-center'>
            {(() => {
              if (timestamps.length === 0) return (
                <div className='flex-1 h-full text-center bg-muted/20 cursor-default'/>
              );

              const parseDate = (ts: string) => new Date(ts.replace(' ', 'T'));
              const start = parseDate(filteredTimestamps[0]);
              const end = parseDate(filteredTimestamps[filteredTimestamps.length - 1]);

              const stepSize = isSingle ? 15 : 60;
              const steps: Date[] = [];
              const cursor = new Date(start);
              cursor.setMinutes(Math.floor(cursor.getMinutes() / stepSize) * stepSize, 0, 0);

              while (cursor <= end) {
                steps.push(new Date(cursor));
                cursor.setMinutes(cursor.getMinutes() + stepSize);
              }

              const timeMap: Record<string, Set<string>> = {};

              Object.entries(groupedGlobeData).forEach(([timestamp, spills]) => {
                const d = parseDate(timestamp);
                const block = new Date(d);
                block.setMinutes(Math.floor(block.getMinutes() / stepSize) * stepSize, 0, 0);
                const key = block.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

                for (const spill of spills) {
                  timeMap[key] ||= new Set();
                  timeMap[key].add(spill.id);
                }
              });

              return steps.map((time) => {
                const timeStr = time.toISOString();
                const key = timeStr.slice(0, 16);
                const count = timeMap[key]?.size ?? 0;
                const exists = count > 0;
                const isActive = date >= time && date < new Date(time.getTime() + stepSize * 60 * 1000);

                const bg = isActive
                  ? 'bg-primary/60'
                  : exists
                  ? 'bg-muted/40'
                  : 'bg-background';

                return (
                  <div
                    key={timeStr}
                    className={`flex-1 flex items-end h-full ${exists ? 'cursor-pointer hover:bg-primary/20 min-w-[2px]' : 'cursor-default hover:bg-red-600/10'}`}
                    onClick={() => exists && setDate(time)}
                    role='button'
                    aria-pressed={isActive}
                    aria-label={`${key}: ${count} unique oilspill(s)`}
                    tabIndex={exists ? 0 : -1}
                    onKeyDown={(e) => {
                      if (exists && (e.key === 'Enter' || e.key === ' ')) {
                        setDate(time);
                      }
                    }}
                  >
                    <div
                      className={`w-full ${bg} ${exists && 'h-full'}`}
                      title={`${key}: ${count} unique oilspill(s)`}
                    />
                  </div>
                );
              });
            })()}
          </div>
          <div className='relative z-20 flex items-center justify-center max-w-40 w-full border-l bg-chart-1/10 text-xs font-medium px-1 text-center'>
            {format(date, 'yyyy-MM-dd HH:mm', { locale })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;