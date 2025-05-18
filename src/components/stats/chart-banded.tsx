'use client'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  YAxis
} from 'recharts'
import { FC, useMemo } from 'react'

type ChartBandedProps = {
  data: { value: [number, number, number] }[]
}

const ChartBanded: FC<ChartBandedProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.map(({ value }, i) => ({
        name: i.toString(),
        a: [value[0], value[2]],
        b: value[1],
      })),
    [data]
  )
  const min = Math.min(...data.map(({ value }) => value[0]))
  const max = Math.max(...data.map(({ value }) => value[2]))

  return (
    <ResponsiveContainer
      width='100%'
      height='100%'
    >
      <ComposedChart 
        data={chartData}
        margin={{
          top: -2,
          right: -2,
          left: -2,
          bottom: 24,
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
            min,
            max
          ]}
        />
        <Area
          dataKey='a'
          stroke='none'
          fill='hsl(var(--chart-1) / 0.5)'
          connectNulls
          dot={false}
          activeDot={false}
        />
        <Line
          type='monotone'
          dataKey='b'
          stroke='hsl(var(--chart-1))'
          strokeWidth={1}
          dot={false}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default ChartBanded
