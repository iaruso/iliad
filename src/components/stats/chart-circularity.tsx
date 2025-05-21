'use client'
import type { FC } from 'react'

interface ChartCircularityProps {
  min: number
  avg: number
  max: number
}

const minPolygonSides = 8
const maxPolygonSides = 24

const getPoints = (sides: number, radius: number, centerX: number, centerY: number) => {
  const angleStep = (Math.PI * 2) / sides
  const points: string[] = []

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    points.push(`${x},${y}`)
  }

  return points.join(' ')
}

const getSides = (value: number) =>
  Math.max(
    minPolygonSides,
    Math.round(minPolygonSides + (value / 100) * (maxPolygonSides - minPolygonSides))
  )

const ChartCircularity: FC<ChartCircularityProps> = ({ min, avg, max }) => {
  const minSides = getSides(min)
  const avgSides = getSides(avg)
  const maxSides = getSides(max)

  return (
    <div className='w-full h-full flex items-center justify-center relative'>
      <svg viewBox='0 0 100 100' className='w-full h-full'>
        <polygon
          points={getPoints(maxSides, 22, 50, 50)}
          className='fill-chart-1/20 stroke-border/40'
        />
        <polygon
          points={getPoints(avgSides, 35, 50, 50)}
          className='fill-chart-1/15 stroke-border/60'
        />
        <polygon
          points={getPoints(minSides, 48, 50, 50)}
          className='fill-chart-1/10 stroke-border/80'
        />
      </svg>
    </div>
  )
}

export default ChartCircularity
