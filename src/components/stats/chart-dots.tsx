'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface ChartDotsProps {
  min: number
  avg: number
  max: number
}

const ChartDots = ({ min, avg, max }: ChartDotsProps) => {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawDots = (count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const colorRGBA = theme === 'dark' ? '162, 164, 177' : '92, 110, 128'

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawDots(Math.max(0, min), `rgba(${colorRGBA}, 0.2)`)
    drawDots(Math.max(0, avg - min), `rgba(${colorRGBA}, 0.6)`)
    drawDots(Math.max(0, max - avg), `rgba(${colorRGBA}, 1)`)

  }, [min, avg, max, theme])

  return <canvas ref={canvasRef} className='w-full h-full' width={300} height={300} />
}

export default ChartDots
