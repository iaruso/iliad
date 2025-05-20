'use client'
import { FC, useMemo } from 'react'

interface ChartDotsProps {
  min: number
  avg: number
  max: number
}

const generatePoints = (count: number) => {
  const points = []
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100
    const y = Math.random() * 100
    points.push({ x, y })
  }
  return points
}

const DotLayer = ({
  count,
  className,
}: {
  count: number
  className: string
}) => {
  const points = useMemo(() => generatePoints(count), [count])
  return (
    <>
      {points.map((point, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${className}`}
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: '2px',
            height: '2px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </>
  )
}

const ChartDots: FC<ChartDotsProps> = ({ min, avg, max }) => {
  const low = Math.max(0, min)
  const mid = Math.max(0, avg - min)
  const high = Math.max(0, max - avg)

  return (
    <div className='w-full h-full relative overflow-hidden'>
      <DotLayer count={low} className='bg-chart-1/20' />
      <DotLayer count={mid} className='bg-chart-1/60' />
      <DotLayer count={high} className='bg-chart-1' />
    </div>
  )
}

export default ChartDots
