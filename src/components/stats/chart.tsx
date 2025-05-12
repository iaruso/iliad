/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import type { FC } from 'react'
import { Area, AreaChart, YAxis, ResponsiveContainer, ReferenceLine  } from 'recharts'
import { type ChartConfig, ChartContainer } from '@/components/ui-custom/chart'

interface ChartProps {
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

const Chart: FC<ChartProps> = ({ data, min, max, avg }) => {
  const chartData = data.map((value, index) => ({
    index: index + 1,
    value,
  }))

  return (
    <ChartContainer config={chartConfig} className='min-h-24 w-full'>
      <ResponsiveContainer className={'h-24 w-full'}>
        <AreaChart 
          data={chartData}
          accessibilityLayer
          margin={{
            top: 50,
            right: -5,
            left: -5,
            bottom: -5,
          }}
        >
          <YAxis
            width={0}
            dataKey='value'
            axisLine={false}
            tickLine={false}
            tick={false}
            type='number'
            domain={[
              0,
              max
            ]}
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
            dataKey='value'
            type='natural'
            fill='url(#fillChart)'
            fillOpacity={0.35}
            stroke='var(--color-chart)'
            strokeWidth={1.5}
            strokeOpacity={0.7}
            stackId='a'
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default Chart
