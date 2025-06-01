'use client';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { getLocalTimeZone, today } from '@internationalized/date';
import { format } from 'date-fns';
import { FC, useContext, useMemo, useEffect } from 'react';
import { GlobeContext, GlobeContextProps } from '@/context/globe-context';
import { useTranslations } from 'next-intl';
import ButtonTooltip from '@/components/ui-custom/button-tooltip';
import DropdownTooltip from '@/components/ui-custom/dropdown-tooltip';
import PopoverTooltip from '@/components/ui-custom/popover-tooltip';
import { DropdownMenuItem } from '@/components/ui-custom/dropdown-menu';
import { RangeCalendar } from '@/components/ui-custom/calendar-rac';
import { Button } from '@/components/ui-custom/button';
import { SkipBack, Play, Pause, SkipForward, Calendar } from 'lucide-react';
import { useLocale } from 'next-intl';
const DateDisplay = dynamic(() => import('./date-display'), { ssr: true });

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
    groupedGlobeData,
  } = useContext(GlobeContext) as GlobeContextProps;
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasOilspillParam = searchParams.has('oilspill');
  const currentLocale = useLocale();
  const t = useTranslations('globe.timeline');
  const timestamps = useMemo(() => {
    return Object.keys(groupedGlobeData).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );
  }, [groupedGlobeData]);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  useEffect(() => {
    if (startDate && endDate && (!dateRange?.start || !dateRange?.end)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { parseDate, toZoned } = require('@internationalized/date');
      const timeZone = 'UTC';
      try {
        const startStr = startDate.split('T')[0];
        const endStr = endDate.split('T')[0];
        const startParsed = parseDate(startStr);
        const endParsed = parseDate(endStr);
        const startZdt = toZoned(startParsed, timeZone);
        const endZdt = toZoned(endParsed, timeZone);
        setDateRange({ start: startZdt, end: endZdt });
      } catch {

      }
    }
  }, [startDate, endDate, dateRange, setDateRange]);
  
  useEffect(() => {
    if (!startDate && !endDate) {
      setDateRange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const [minDate, maxDate] = useMemo(() => {
    // Always use the earliest and latest timestamp in groupedGlobeData
    if (timestamps.length === 0) return [undefined, undefined];
    const first = new Date(timestamps[0].replace(' ', 'T'));
    const last = new Date(timestamps[timestamps.length - 1].replace(' ', 'T'));
    return [first, last];
  }, [timestamps]);

  const filteredTimestamps = useMemo(() => {
    if (!minDate || !maxDate) return [];

    // Always use the full range from minDate to maxDate, regardless of current year
    return timestamps.filter(ts => {
      const date = new Date(ts.replace(' ', 'T'));
      return date >= minDate && date <= maxDate;
    });
  }, [timestamps, minDate, maxDate]);

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
    <div className='w-full h-12 border-t bg-background' data-joyride='timeline'>
      <div className='flex items-center p-2 h-12 gap-2'>
        <div className='flex items-center gap-2 h-full' data-joyride='timeline-controls'>
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
                  className='justify-end'
                  key={speed}
                  onClick={() => setTimelineSpeed(speed)}
                >
                  {t(`speed.options.${String(speed).replace('.', '_')}`)}
                </DropdownMenuItem>
              ))
            }
            className='min-w-auto'
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
                    className='!h-8 w-48 cursor-pointer px-2.5 text-xs flex items-center justify-start'
                    aria-label={t('calendar.tooltip')}
                  >
                    <Calendar className='!h-3.5 !w-3.5 stroke-primary'/>
                    <span className='mx-auto w-full'>
                    {dateRange
                      ? `${dateRange.start && 'toString' in dateRange.start ? dateRange.start.toString().split('T')[0] : String(dateRange.start)} - ${dateRange.end && 'toString' in dateRange.end ? dateRange.end.toString().split('T')[0] : String(dateRange.end)}`
                      : t('calendar.tooltip')}
                    </span>
                  </Button>
                }
                tooltip={t('calendar.tooltip')}
                content={
                  <RangeCalendar
                    className='rounded-md border p-2 bg-background'
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    maxValue={today(getLocalTimeZone())}
                  />
                }
                className='border-none p-0 w-fit'
              />
            )
          }
        </div>
        <div className='flex flex-1 rounded-md border !h-8 overflow-hidden relative' data-joyride='timeline-bar'>
          <div className='flex-1 flex items-center'>
            {(() => {
              if (timestamps.length === 0) return (
                <div className='flex-1 h-full text-center bg-muted/20 cursor-default'/>
              );

              const parseDate = (ts: string) => new Date(ts.replace(' ', 'T'));
              const start = parseDate(filteredTimestamps[0]);
              const end = parseDate(filteredTimestamps[filteredTimestamps.length - 1]);

              const stepSize = 60;
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
                const key = block.toISOString().slice(0, 16);

                for (const spill of spills) {
                  timeMap[key] ||= new Set();
                  timeMap[key].add(spill.id);
                }
              });

              const timelineBlocks = [];
              let gapStart: Date | null = null;
              let gapCount = 0;

              for (let i = 0; i < steps.length; i++) {
                const time = steps[i];
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

                if (!exists) {
                  if (gapStart === null) gapStart = time;
                  gapCount++;
                  if (i === steps.length - 1 || (steps[i + 1] && (timeMap[steps[i + 1].toISOString().slice(0, 16)]?.size ?? 0) > 0)) {
                    timelineBlocks.push(
                      <div
                        key={`gap-${gapStart.toISOString()}`}
                        className={`flex-shrink-0 flex items-end h-full bg-background`}
                        style={{ flex: gapCount, minWidth: 2 }}
                        aria-hidden="true"
                      />
                    );
                    gapStart = null;
                    gapCount = 0;
                  }
                  continue;
                }

                timelineBlocks.push(
                  <div
                    key={timeStr}
                    className={`flex-1 flex items-end h-full cursor-pointer hover:bg-primary/20 min-w-[2px]`}
                    onClick={() => setDate(time)}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`${key}: ${count} unique oilspill(s)`}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') setDate(time);
                    }}
                  >
                    <div
                      className={`w-full ${bg} h-full`}
                      title={`${key}: ${count} unique oilspill(s)`}
                    />
                  </div>
                );
              }
              return timelineBlocks;
            })()}
          </div>
          <div className='relative z-20 flex items-center justify-center max-w-40 w-full border-l bg-chart-1/10 text-xs font-medium px-1 text-center'>
            <DateDisplay date={date} localeCode={currentLocale as 'pt' | 'en'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;