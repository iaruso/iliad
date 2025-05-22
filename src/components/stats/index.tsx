/* eslint-disable  @typescript-eslint/no-explicit-any */
import { FC } from 'react'
import { useTranslations } from 'next-intl'
import { formatMinutes } from '@/lib/formatters'
import { formatOilspillStats, FormattedStats, formatSingleOilspillStats } from '@/lib/stats'
import StatsCard from './card'

interface StatsProps {
  className?: string
  data: {
    data?: any[]
    stats?: any[]
  }
  type: 'single' | 'multiple'
}

const Stats: FC<StatsProps> = ({ className, data, type }) => {
  const t = useTranslations('globe.stats')
  const stats: FormattedStats = type === 'multiple' ? formatOilspillStats(data.data ?? []) : formatSingleOilspillStats(data.stats ?? []);
  console.log('Stats', stats)
  return (
    <div className={`p-2 border-t text-sm flex-1 h-0 gap-2 w-full min-h-96 overflow-auto flex flex-col ${className}`}>
      <div className={`flex gap-2 flex-1 h-0`}>
        <StatsCard
          className='w-2/5'
          label={t('area.label')}
          detail={t.rich('area.detail', {
            sup: (chunks) => <sup>{chunks}</sup>
          })}
          tooltip={t('area.tooltip.info')}
          data={stats.area.data}
          min={stats.area.min}
          tooltipMin={t.rich('area.tooltip.min', { 
            min: stats.area.min,
            sup: (chunks) => <sup>{chunks}</sup>
          })}
          max={stats.area.max}
          tooltipMax={t.rich('area.tooltip.max', {
            max: stats.area.max,
            sup: (chunks) => <sup>{chunks}</sup>
          })}
          avg={stats.area.average}
          tooltipAvg={t.rich('area.tooltip.avg', {
            avg: stats.area.average,
            sup: (chunks) => <sup>{chunks}</sup>
          })}
          chartType='tree'
        />
        <div className='flex flex-col gap-2 flex-1'>
          <div className='max-h-24 grid grid-cols-3 gap-2'>
            <StatsCard
              label={t('density.label')}
              detail={t.rich('density.detail', {
                sup: (chunks) => <sup>{chunks}</sup>
              })}
              tooltip={t('density.tooltip.info')}
              data={stats.density.data}
              min={stats.density.min}
              avg={stats.density.average}
              max={stats.density.max}
              tooltipAvg={t.rich('density.tooltip.avg', { 
                avg: stats.density.average,
                sup: (chunks) => <sup>{chunks}</sup>
              })}
              chartType='area'
            />
            <StatsCard
              label={t('bearing.label')}
              detail={t('bearing.detail')}
              tooltip={t('bearing.tooltip.info')}
              data={stats.bearing.data}
              avg={stats.bearing.average}
              tooltipAvg={t('bearing.tooltip.avg', { avg: stats.bearing.average })}
              chartType='radar'
            />
            <StatsCard
              label={t('compaction.label')}
              detail={t('compaction.detail')}
              tooltip={t('compaction.tooltip.info')}
              min={stats.compaction.min * 100}
              avg={stats.compaction.average * 100}
              max={stats.compaction.max * 100}
              tooltipAvg={t('compaction.tooltip.avg', { avg: stats.compaction.average * 100 })}
              chartType='circularity'
            />
          </div>
          <div className='flex-1 h-0 grid grid-cols-2 gap-2'>
            { stats.duration && stats.frequency && (
            <>
              <StatsCard
                className=''
                label={t('duration.label')}
                detail={t('duration.detail')}
                tooltip={t('duration.tooltip.info')}
                data={stats.duration.data}
                min={stats.duration.min}
                tooltipMin={t('duration.tooltip.min', { min: formatMinutes(stats.duration.min) })}
                max={stats.duration.max}
                tooltipMax={t('duration.tooltip.max', { max: formatMinutes(stats.duration.max) })}
                avg={stats.duration.average}
                tooltipAvg={t('duration.tooltip.avg', { avg: formatMinutes(stats.duration.average) })}
                chartType='step'
                chartValueType='time'
              />
              <StatsCard
                className=''
                label={t('frequency.label')}
                detail={t('frequency.detail')}
                tooltip={t('frequency.tooltip.info')}
                data={stats.frequency.data}
                min={stats.frequency.min}
                tooltipMin={t('frequency.tooltip.min', { min: formatMinutes(stats.frequency.min) })}
                max={stats.frequency.max}
                tooltipMax={t('frequency.tooltip.max', { max: formatMinutes(stats.frequency.max) })}
                avg={stats.frequency.average}
                tooltipAvg={t('frequency.tooltip.avg', { avg: formatMinutes(stats.frequency.average) })}
                chartType='step'
                chartValueType='time'
              />
            </>
            )}
          </div>
        </div>
      </div>
      <div className={`grid gap-2 grid-rows-2 flex-1 h-0`}>
        <div className={`flex-1 grid gap-2 grid-cols-2`}>
          <StatsCard
            label={t('perimeter.label')}
            detail={t('perimeter.detail')}
            tooltip={t('perimeter.tooltip.info')}
            data={stats.perimeter.data}
            min={stats.perimeter.min}
            tooltipMin={t('perimeter.tooltip.min', { min: stats.perimeter.min })}
            max={stats.perimeter.max}
            tooltipMax={t('perimeter.tooltip.max', { max: stats.perimeter.max })}
            avg={stats.perimeter.average}
            tooltipAvg={t('perimeter.tooltip.avg', { avg: stats.perimeter.average })}
            chartType='step'
          />
          <StatsCard
            className='h-full'
            label={t('points.label')}
            detail={t('points.detail')}
            tooltip={t('points.tooltip.info')}
            min={stats.points.min}
            avg={stats.points.average}
            max={stats.points.max}
            tooltipAvg={t('points.tooltip.avg', { avg: stats.points.average })}
            chartType='dots'
          />
        </div>
        <div className={`flex-1 grid grid-cols-2 gap-2`}>
          <StatsCard
            label={t('dispersionRadius.label')}
            detail={t('dispersionRadius.detail')}
            tooltip={t('dispersionRadius.tooltip.info')}
            data={stats.dispersionRadius.data}
            min={stats.dispersionRadius.min}
            tooltipMin={t('dispersionRadius.tooltip.min', { min: stats.dispersionRadius.min })}
            max={stats.dispersionRadius.max}
            tooltipMax={t('dispersionRadius.tooltip.max', { max: stats.dispersionRadius.max })}
            avg={stats.dispersionRadius.average}
            tooltipAvg={t('dispersionRadius.tooltip.avg', { avg: stats.dispersionRadius.average })}
            chartType={type === 'multiple' ? 'banded' : 'step'}
          />
          <StatsCard
            label={t('dispersionDistance.label')}
            detail={t('dispersionDistance.detail')}
            tooltip={t('dispersionDistance.tooltip.info')}
            data={stats.dispersionDistance.data}
            min={stats.dispersionDistance.min}
            tooltipMin={t('dispersionDistance.tooltip.min', { min: stats.dispersionDistance.min })}
            max={stats.dispersionDistance.max}
            tooltipMax={t('dispersionDistance.tooltip.max', { max: stats.dispersionDistance.max })}
            avg={stats.dispersionDistance.average}
            tooltipAvg={t('dispersionDistance.tooltip.avg', { avg: stats.dispersionDistance.average })}
            chartType={type === 'multiple' ? 'banded' : 'step'}
          />
        </div>
      </div>
    </div>
  )
}

export default Stats
