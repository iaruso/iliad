import { FC } from 'react'
import { useTranslations } from 'next-intl'
import { formatOilspillStats, FormattedStats } from '@/lib/stats'
import StatsCard from './card'

interface StatsProps {
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
  }
  type: 'single' | 'multiple'
}

const Stats: FC<StatsProps> = ({ data }) => {
  const t = useTranslations('globe.stats')
  const stats: FormattedStats = formatOilspillStats(data.data)
  console.log(stats)
  return (
    <div className='p-2 border-t text-sm flex-1 h-0 flex flex-col gap-2 w-full'>
      <div className='flex gap-2 h-fit max-h-1/4'>
        <StatsCard
          className='flex-1'
          label={t('area.label')}
          detail={t.rich('area.detail', {
            sup: (chunks) => <sup>{chunks}</sup>
          })}
          tooltip={t('area.tooltip.info')}
          data={stats.area.data}
          min={stats.area.min}
          tooltipMin={t('area.tooltip.min', { min: stats.area.min })}
          max={stats.area.max}
          tooltipMax={t('area.tooltip.max', { max: stats.area.max })}
          avg={stats.area.average}
          tooltipAvg={t('area.tooltip.avg', { avg: stats.area.average })}
        />
        <StatsCard
          className='flex-1'
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
        />
        <StatsCard
          className='aspect-square'
          label={t('bearing.label')}
          detail={t('bearing.detail')}
          tooltip={t('bearing.tooltip.info')}
          data={stats.bearing.data}
          min={stats.bearing.min}
          tooltipMin={t('bearing.tooltip.min', { min: stats.bearing.min })}
          max={stats.bearing.max}
          tooltipMax={t('bearing.tooltip.max', { max: stats.bearing.max })}
          avg={stats.bearing.average}
          tooltipAvg={t('bearing.tooltip.avg', { avg: stats.bearing.average })}
          chartType='radar'
        />
        <StatsCard
          className='aspect-square'
          label={t('density.label')}
          detail={t.rich('density.detail', {
            sup: (chunks) => <sup>{chunks}</sup>
          })}
          tooltip={t('density.tooltip.info')}
          data={stats.density.data}
          min={stats.density.min}
          tooltipMin={t('density.tooltip.min', { min: stats.density.min })}
          max={stats.density.max}
          tooltipMax={t('density.tooltip.max', { max: stats.density.max })}
          avg={stats.density.average}
          tooltipAvg={t('density.tooltip.avg', { avg: stats.density.average })}
          chartType='area'
        />
      </div>
      <div className='grid grid-cols-3 gap-2 flex-1 h-0'>
        <StatsCard
          label={t('frequency.label')}
          detail={t('frequency.detail')}
          tooltip={t('frequency.tooltip.info')}
          data={stats.frequency.data}
          min={stats.frequency.min}
          tooltipMin={t('frequency.tooltip.min', { min: stats.frequency.min })}
          max={stats.frequency.max}
          tooltipMax={t('frequency.tooltip.max', { max: stats.frequency.max })}
          avg={stats.frequency.average}
          tooltipAvg={t('frequency.tooltip.avg', { avg: stats.frequency.average })}
        />
        <StatsCard
          label={t('points.label')}
          detail={t('points.detail')}
          tooltip={t('points.tooltip.info')}
          data={stats.points.data}
          min={stats.points.min}
          tooltipMin={t('points.tooltip.min', { min: stats.points.min })}
          max={stats.points.max}
          tooltipMax={t('points.tooltip.max', { max: stats.points.max })}
          avg={stats.points.average}
          tooltipAvg={t('points.tooltip.avg', { avg: stats.points.average })}
        />
        <StatsCard
          label={t('duration.label')}
          detail={t('duration.detail')}
          tooltip={t('duration.tooltip.info')}
          data={stats.duration.data}
          min={stats.duration.min}
          tooltipMin={t('duration.tooltip.min', { min: stats.duration.min })}
          max={stats.duration.max}
          tooltipMax={t('duration.tooltip.max', { max: stats.duration.max })}
          avg={stats.duration.average}
          tooltipAvg={t('duration.tooltip.avg', { avg: stats.duration.average })}
        />
      </div>
      <div className='grid grid-cols-3 gap-2 flex-1 h-0'>
        <StatsCard
          label={t('compaction.label')}
          detail={t('compaction.detail')}
          tooltip={t('compaction.tooltip.info')}
          data={stats.compaction.data}
          min={stats.compaction.min}
          tooltipMin={t('compaction.tooltip.min', { min: stats.compaction.min })}
          max={stats.compaction.max}
          tooltipMax={t('compaction.tooltip.max', { max: stats.compaction.max })}
          avg={stats.compaction.average}
          tooltipAvg={t('compaction.tooltip.avg', { avg: stats.compaction.average })}
        />
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
        />
      </div>
    </div>
  )
}

export default Stats
