'use client'
import type { FC } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis  } from 'recharts'
import { type ChartConfig, ChartContainer } from '@/components/ui-custom/chart'
import { formatRadarData } from '@/lib/stats'

interface ChartRadarProps {
  data: number[]
  avg: number
}

const chartConfig = {
  chart: {
    label: 'a',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const ChartRadar: FC<ChartRadarProps> = ({ data, avg }) => {
  const dataG = data ? formatRadarData(data) : []
  return (
    <div className={`
      w-full h-full flex items-center justify-center relative overflow-hidden
      [&_.recharts-polar-grid-concentric] [&_.recharts-polar-grid-angle>:not(:nth-child(6n+1))]:!hidden
    `}>
      <ChartContainer config={chartConfig} className='h-full'>
        <RadarChart cx='50%' cy='50%' outerRadius='100%' data={dataG} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey='a' tickLine={false} axisLine={false} tick={false} />
          <PolarRadiusAxis tick={false} angle={90-avg} stroke='var(--color-chart)' strokeWidth={1} strokeOpacity={0.7}/>
          <Radar
            animationDuration={0}
            dataKey='A'
            stroke='var(--color-chart)'
            strokeWidth={1}
            strokeOpacity={0.35}
            fill='var(--color-chart)'
            fillOpacity={0.35/2}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  )
}

export default ChartRadar
