'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC, useMemo, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { OilSpill } from '@/@types/oilspills';
import { Link } from '@/i18n/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList
} from '@/components/ui-custom/breadcrumb';
import {
  ChevronLeft,
  Copy,
  SquareStack,
  MapPinned,
  Clock,
  CircleGauge
} from 'lucide-react';
import DataViewer from '@/components/data-viewer';
import { TooltipWrapper } from '@/components/ui-custom/tooltip-wrapper';
import { Button } from '@/components/ui-custom/button';
import ButtonTooltip from '@/components/ui-custom/button-tooltip';
import { formatMinutes } from '@/lib/formatters';

const Stats = dynamic(() => import('@/components/stats'), {
  loading: () => <></>,
  ssr: false
});

interface DetailsProps {
  data: OilSpill;
}

const DetailsCard = ({
  value,
  icon,
  tooltip
}: {
  value: string | number;
  icon: ReactNode;
  tooltip: string;
}) => (
  <TooltipWrapper
    trigger={
      <div className='flex items-center gap-1 h-8 px-2 py-1 rounded-md text-xs font-medium border'>
        {icon}
        {value == null ? '-' : value}
      </div>
    }
    triggerClassName={`p-0.5 px-1 text-xs flex items-center gap-1 justify-center`}
    content={<p className='text-xs w-full'>{tooltip}</p>}
  />
);

const Details: FC<DetailsProps> = ({ data }) => {
  const t = useTranslations('details');
  const stats = useMemo(() => {
    const timestamps = data.data && Array.isArray(data.data)
      ? data.data
          .filter(entry => entry && entry.timestamp)
          .map(entry => {
            try {
              return new Date(entry.timestamp);
            } catch {
              console.error('Invalid timestamp format:', entry.timestamp);
              return null;
            }
          })
          .filter(Boolean) as Date[]
      : [];
    
    timestamps.sort((a, b) => a.getTime() - b.getTime());

    const coordinates = data.coordinates && 
                       Array.isArray(data.coordinates) && 
                       data.coordinates.length >= 2 
                       ? data.coordinates 
                       : [0, 0];

    return {
      totalTimestamps: timestamps.length,
      coordinates,
    };
  }, [data]);

  return (
    <>
      <Breadcrumb className='flex items-center justify-start gap-2 h-12 p-2 border-b w-full'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <ButtonTooltip
              button={
                <Button
                  variant='outline'
                  className='h-8 w-8 p-0 rounded-md gap-0'
                  asChild
                  aria-label={t('return')}
                >
                  <Link
                    href='/?page=1&size=10'
                  >
                    <ChevronLeft className='!size-4 text-foreground' />
                  </Link>
                </Button>
              }
              tooltip={t('return')}
            />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <ButtonTooltip
              button={
                <Button
                  variant='outline'
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className='h-8 px-2 py-1 rounded-md gap-1.5 font-medium text-xs uppercase text-foreground'
                  aria-label={t('copy.tooltip')}
                >
                  {data._id?.toString().slice(-9).padStart(9, '0')}
                  <Copy className='!size-3.5' />
                </Button>
              }
              tooltip={t('copy.tooltip')}
            />
          </BreadcrumbItem>
        </BreadcrumbList>
        <div className='flex items-center justify-end gap-2 [&_button]:!p-0 ml-auto' data-joyride='data-metrics'>
          <DetailsCard
            value={stats.totalTimestamps}
            icon={<SquareStack className='!size-3.5' strokeWidth={2} />}
            tooltip={t('timestampsCollected.tooltip')}
          />
          <DetailsCard
            value={formatMinutes(data.duration)}
            icon={<Clock className='!size-3.5' strokeWidth={2} />}
            tooltip={t('duration.tooltip')}
          />
          <DetailsCard
            value={formatMinutes(data.frequency)}
            icon={<CircleGauge className='!size-3.5' strokeWidth={2} />}
            tooltip={t('frequency.tooltip')}
          />
          <DetailsCard
            value={
              (() => {
                const [lat, lng] = stats.coordinates as [number, number];
                return lat.toFixed(2) + '°N, ' + lng.toFixed(2) + '°E';
              })()
            }
            icon={<MapPinned className='!size-3.5' strokeWidth={2} />}
            tooltip={t('location.tooltip')}
          />
        </div>
      </Breadcrumb>
      <div className='flex flex-col flex-1 h-0 overflow-y-auto'>
        <Stats
          className='border-none'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={data as any}
          type='single'
        />
        <div className='flex-1 h-0 grid p-2 pt-0 gap-2 grid-rows-2'>
          <DataViewer data={data} />
          <div
            data-joyride='data-ocean-viewer'
            className='select-none pointer-events-none w-full rounded-md border bg-muted/50 flex items-center justify-center p-4 relative overflow-hidden'
          >
            <Image
              src='/ocean-viewer-preview.webp'
              alt={t('oceanViewer.wip')}
              width={366}
              height={247}
              priority={true}
              className='object-cover absolute inset-0 w-full blur opacity-40'
            />
            <span className='text-xs font-medium text-accent-foreground/80 dark:text-muted-foreground z-[1]'>
              {t('oceanViewer.wip')}
            </span>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default Details;
