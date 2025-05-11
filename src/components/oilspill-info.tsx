'use client';

import { FC, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { OilSpill } from '@/@types/oilspills';
import { Link } from '@/i18n/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui-custom/breadcrumb';
import { formatDistance, format } from 'date-fns';
import { enUS, pt } from 'date-fns/locale';
import { useLocale } from 'next-intl';

//import dynamic from 'next/dynamic';
//const OceanCanvas = dynamic(() => import('@/components/ocean-canvas'), { ssr: false });

interface OilSpillInfoProps {
  data: OilSpill;
}

const OilSpillInfo: FC<OilSpillInfoProps> = ({ data }) => {
  const t = useTranslations('oilspillInfo');
  const locale = useLocale() === 'en' ? enUS : pt;
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

    const start = timestamps.length > 0 ? timestamps[0] : new Date();
    const end = timestamps.length > 0 ? timestamps[timestamps.length - 1] : new Date();

    const intervals = timestamps.length > 1 
      ? timestamps.slice(1).map((ts, i) => ts.getTime() - timestamps[i].getTime())
      : [];
    
    const avgIntervalMs = intervals.length
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 0;
    
    const avgIntervalStr = avgIntervalMs
      ? formatDistance(0, avgIntervalMs, { locale: locale })
      : '-';

    let totalPolygons = 0;
    let totalDensity = 0;
    const densityGroups: Record<string, number> = {};
    const spillsPerTimestamp: Record<string, number> = {};

    if (data.data && Array.isArray(data.data)) {
      for (const entry of data.data) {
        if (!entry || !entry.timestamp) continue;
        
        const key = entry.timestamp;
        spillsPerTimestamp[key] = 0;

        if (entry.actors && Array.isArray(entry.actors)) {
          for (const actor of entry.actors) {
            if (!actor) continue;
            
            if (actor.geometry?.type === 'Polygon') {
              
              totalPolygons += 1;
              spillsPerTimestamp[key] += 1;

              if (actor.density != null) {
                totalDensity += actor.density;

                const range = actor.density >= 1
                  ? '≥1'
                  : actor.density >= 0.5
                  ? '0.5–0.99'
                  : actor.density >= 0.1
                  ? '0.1–0.49'
                  : actor.density >= 0.01
                  ? '0.01–0.09'
                  : '<0.01';

                densityGroups[range] = (densityGroups[range] ?? 0) + 1;
              }
            }
          }
        }
      }
    }

    const coordinates = data.coordinates && 
                       Array.isArray(data.coordinates) && 
                       data.coordinates.length >= 2 
                       ? data.coordinates 
                       : [0, 0];

    return {
      totalTimestamps: timestamps.length,
      start,
      end,
      avgIntervalStr,
      totalPolygons,
      totalDensity,
      averageDensity: totalPolygons ? totalDensity / totalPolygons : 0,
      densityGroups,
      spillsPerTimestamp,
      coordinates,
    };
  }, [data, locale]);

  return (
    <div className='flex flex-col h-full'>
      <Breadcrumb className='flex items-center gap-2 h-12 p-2 border-b w-full'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link
              href='/?page=1&size=10'
              className='text-sm font-medium text-primary hover:bg-muted/50 px-2 rounded-md border bg-muted/20 h-8 flex items-center'
            >
              {t('return')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='uppercase text-muted-foreground/80'>
              {data._id?.toString().slice(-9).padStart(9, '0')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='p-4 space-y-4'>
        <h2 className='text-xl font-semibold'>{t('summary')}</h2>
        <div className='grid grid-cols-1 gap-4 text-sm'>
          <div><strong>{t('timestampsCollected')}:</strong> {stats.totalTimestamps}</div>
          <div>
            <strong>{t('interval')}:</strong>{' '}
            {format(stats.start, 'PPPpp', { locale: locale })} → {format(stats.end, 'PPPpp', { locale: locale })}
          </div>
          <div><strong>{t('averageInterval')}:</strong> {stats.avgIntervalStr}</div>
          <div>
            <strong>{t('location')}:</strong>{' '}
            {(stats.coordinates as [number, number])[1].toFixed(4)}° N, {(stats.coordinates as [number, number])[0].toFixed(4)}° E
          </div>
          <div><strong>{t('totalPolygons')}:</strong> {stats.totalPolygons}</div>
          {/* <div><strong>{t('totalDensity')}:</strong> {stats.totalDensity.toFixed(2)}</div>
          <div><strong>{t('averageDensity')}:</strong> {stats.averageDensity.toFixed(3)}</div> */}
        </div>


        {/* <div>
          <h3 className='font-medium mt-4 mb-2'>Density distribution:</h3>
          <ul className='list-disc list-inside text-sm'>
            {Object.entries(stats.densityGroups).map(([range, count]) => (
              <li key={range}><strong>{range}:</strong> {count} spill(s)</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className='font-medium mt-4 mb-2'>Spills per timestamp:</h3>
          <ul className='list-disc list-inside text-sm max-h-40 overflow-y-auto'>
            {Object.entries(stats.spillsPerTimestamp).map(([ts, count]) => (
              <li key={ts}><strong>{ts}:</strong> {count} spill(s)</li>
            ))}
          </ul>
        </div> */}
      </div>
      {/* <div className='aspect-video' id='ocean-canvas'>
        <OceanCanvas />
      </div> */}
    </div>
  );
};

export default OilSpillInfo;
