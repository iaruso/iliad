'use client'
import type { FC } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  YAxis
} from 'recharts'
import {
  ChartConfig,
  ChartContainer
} from '@/components/ui-custom/chart'

interface ChartStepProps {
  data: number[]
  min: number
  max: number
  avg: number
}

const chartConfig = {
  chart: {
    label: 'a',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const ChartStep: FC<ChartStepProps> = ({ data, min, max, avg }) => {
  const chartData = data.map((value, index) => ({
    index: index + 1,
    value,
  }))
  return (
    <ChartContainer config={chartConfig} className='w-full h-full [&_.recharts-cartesian-grid-horizontal>line]:!hidden'>
      <AreaChart
        data={chartData}
        accessibilityLayer
        margin={{
          top: 32,
          bottom: 32,
        }}
        tabIndex={-1}
      >
        <CartesianGrid vertical={false} />
        <YAxis
          domain={[min * 0.95, max * (1 / 0.95)]}
          dataKey={'value'}
          tickLine={false}
          axisLine={false}
          tick={false}
          width={0}
        />
        <ReferenceLine
          y={avg}
          stroke='var(--color-chart)'
          strokeDasharray='2.5 2.5'
          strokeWidth={1}
          strokeOpacity={0.7}
        />
        <defs>
          <linearGradient id='fillChart' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='var(--color-chart)' stopOpacity={0.4} />
            <stop offset='95%' stopColor='var(--color-chart)' stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          animationDuration={0}
          dataKey='value'
          type='step'
          fill='url(#fillChart)'
          fillOpacity={0.35}
          stroke='var(--color-chart)'
          strokeWidth={1.5}
          strokeOpacity={0.7}
          stackId='a'
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default ChartStep