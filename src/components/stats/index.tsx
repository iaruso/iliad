import { FC } from 'react'
import { formatOilspillStats, FormattedStats } from '@/lib/stats'
import StatsCard from './card'

interface StatsProps {
  data: {
    data: any[]
  }
  type: 'single' | 'multiple'
}

const Stats: FC<StatsProps> = ({ data }) => {
  const stats: FormattedStats = formatOilspillStats(data.data)
  console.log('Stats', stats)
  return (
    <div className='grid grid-cols-3 gap-2 p-2 border-t text-sm flex-1 h-0 overflow-y-auto'>
      <StatsCard
        label='Area'
        data={stats.area.data}
        min={stats.area.min}
        max={stats.area.max}
        avg={stats.area.average}
      />
      <StatsCard
        label='Duration'
        data={stats.duration.data}
        min={stats.duration.min}
        max={stats.duration.max}
        avg={stats.duration.average}
      />
      <StatsCard
        label='Frequency'
        data={stats.frequency.data}
        min={stats.frequency.min}
        max={stats.frequency.max}
        avg={stats.frequency.average}
      />
      <StatsCard
        label='Points'
        data={stats.points.data}
        min={stats.points.min}
        max={stats.points.max}
        avg={stats.points.average}
      />
      <StatsCard
        label='Density'
        data={stats.density.data}
        min={stats.density.min}
        max={stats.density.max}
        avg={stats.density.average}
      />
      <StatsCard
        label='Perimeter'
        data={stats.perimeter.data}
        min={stats.perimeter.min}
        max={stats.perimeter.max}
        avg={stats.perimeter.average}
      />


      <div>
        <strong>Compaction</strong>
        <div className='ml-2 flex flex-wrap gap-2 text-muted-foreground'>
          <span>min: {stats.compaction.min.toFixed(2)}</span>
          <span>max: {stats.compaction.max.toFixed(2)}</span>
          <span>avg: {stats.compaction.average.toFixed(2)}</span>
          <span>minAbs: {stats.compaction.minAbs?.toFixed(2)}</span>
          <span>maxAbs: {stats.compaction.maxAbs?.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <strong>Dispersion Radius</strong>
        <div className='ml-2 flex flex-wrap gap-2 text-muted-foreground'>
          <span>min: {stats.dispersionRadius.min.toFixed(2)}</span>
          <span>max: {stats.dispersionRadius.max.toFixed(2)}</span>
          <span>avg: {stats.dispersionRadius.average.toFixed(2)}</span>
          <span>minAbs: {stats.dispersionRadius.minAbs?.toFixed(2)}</span>
          <span>maxAbs: {stats.dispersionRadius.maxAbs?.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <strong>Dispersion Distance</strong>
        <div className='ml-2 flex flex-wrap gap-2 text-muted-foreground'>
          <span>min: {stats.dispersionDistance.min.toFixed(2)}</span>
          <span>max: {stats.dispersionDistance.max.toFixed(2)}</span>
          <span>avg: {stats.dispersionDistance.average.toFixed(2)}</span>
          <span>minAbs: {stats.dispersionDistance.minAbs?.toFixed(2)}</span>
          <span>maxAbs: {stats.dispersionDistance.maxAbs?.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <strong>Bearing</strong>
        <div className='ml-2 flex flex-wrap gap-2 text-muted-foreground'>
          <span>min: {stats.bearing.min.toFixed(2)}</span>
          <span>max: {stats.bearing.max.toFixed(2)}</span>
          <span>avg: {stats.bearing.average.toFixed(2)}</span>
          <span>minAbs: {stats.bearing.minAbs?.toFixed(2)}</span>
          <span>maxAbs: {stats.bearing.maxAbs?.toFixed(2)}</span>
        </div>
      </div>

      
    </div>
  )
}

export default Stats
