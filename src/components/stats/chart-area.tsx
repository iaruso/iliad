'use client'
import type { FC } from 'react'

interface ChartAreaProps {
  min: number
  avg: number
  max: number
}

const ChartArea: FC<ChartAreaProps> = ({
  min,
  avg,
  max
 }) => {
  const avgPercent = ((avg / max) * 100).toFixed(0)
  const minPercent = ((min / max) * 100).toFixed(0)
  
  return (
    <div className='w-full h-full flex items-center justify-center relative'>
      <div className='h-full aspect-square bg-radial from-chart-1/20 to-transparent rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-border/40'/>
      <div 
        className='aspect-square bg-radial from-chart-1/15 to-transparent rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-border/60'
        style={{ height: `${avgPercent}%` }}
      />
      <div 
        className='aspect-square bg-radial from-chart-1/10 to-transparent rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-1 border border-border/80'
        style={{ height: `${minPercent}%` }}
      />
    </div>
  )
}

export default ChartArea
