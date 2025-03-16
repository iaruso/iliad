'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { useInterval } from 'usehooks-ts'
import { getPanelElement } from 'react-resizable-panels'
import { ResizablePanel } from '@/components/ui/resizable'
import { TextureLoader, ShaderMaterial, type Material, Vector2 } from 'three'
import { GlobeMethods } from 'react-globe.gl'
import { GlobePoint } from '@/types/globe'
import { dayNightShader } from '@/lib/shaders'
import { formatGlobeData } from '@/lib/formatters'
import { sunPositionAt } from '@/lib/solar'
import { getColor } from '@/lib/colors'
import { DateRange } from "react-aria-components";
import { Loader2 } from 'lucide-react'
import Timeline from '@/components/timeline'
import Controls from '@/components/controls'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full w-full items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  )
})

const VELOCITY = 60

const GlobeComponent = ({ initialData = [], supportsWebGPU }: { initialData?: GlobePoint[], supportsWebGPU: string | null }) => {
  const highPerformance = supportsWebGPU === 'true' ? true : false;
  const { resolvedTheme } = useTheme()
  const [isGlobeReady, setIsGlobeReady] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<GlobeMethods>(undefined)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })
  const [dt, setDt] = useState(new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [, setMoment] = useState<'start' | 'end'>('start')
  const [timelineSpeed, setTimelineSpeed] = useState<number>(1)
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [globeMaterial, setGlobeMaterial] = useState<ShaderMaterial | null>(null)

  useEffect(() => {
    const panelElement = getPanelElement('content-panel')
    containerRef.current = panelElement as HTMLDivElement
  }, [])

  const [needsResize, setNeedsResize] = useState(true)
  
  useEffect(() => {
    const handleResize = () => {
      setNeedsResize(true)
    }

    window.addEventListener('resize', handleResize)
    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])
  
  useInterval(() => {
    setDimensions({
      width: containerRef.current?.clientWidth || window.innerWidth,
      height: (containerRef.current?.clientHeight ?? window.innerHeight) - 48,
    })
    setNeedsResize(false)
  }, needsResize ? 200 : null)

  const memoizedGData = useMemo(() => {
    if (highPerformance) {
      return formatGlobeData(initialData, 'high');
    } else {
      return formatGlobeData(initialData, 'low');
    }
  }, [initialData, highPerformance])

  console.log(memoizedGData)

  useEffect(() => {
    const textureLoader = new TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    const dayTexture = '/earth-day.webp'
    const nightTexture = '/earth-night.webp'
    Promise.all([textureLoader.loadAsync(dayTexture), textureLoader.loadAsync(nightTexture)])
      .then(([dayTexture, nightTexture]) => {
        dayTexture.needsUpdate = true
        nightTexture.needsUpdate = true

        const material = new ShaderMaterial({
          uniforms: {
            dayTexture: { value: dayTexture },
            nightTexture: { value: nightTexture },
            sunPosition: { value: new Vector2() },
            globeRotation: { value: new Vector2() },
          },
          vertexShader: dayNightShader.vertexShader,
          fragmentShader: dayNightShader.fragmentShader,
        })
        setGlobeMaterial(material)
      })
      .catch((error) => {
        console.error('Failed to load textures:', error)
      })
  }, [])

  useInterval(() => {
    if (isPlaying) {
      setDt((prevDt) => {
        const newDt = new Date(prevDt)
        newDt.setMinutes(newDt.getMinutes() + VELOCITY)
        return newDt
      })
    }
  }, 1000)

  useEffect(() => {
    if (globeMaterial?.uniforms) {
      const [lng, lat] = sunPositionAt(dt)
      globeMaterial.uniforms.sunPosition.value.set(lng, lat)
    }
  }, [dt, globeMaterial])

  const handleGlobeRotation = useCallback(
    ({ lng, lat }: { lng: number; lat: number }) => {
      if (globeMaterial?.uniforms) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat)
      }
    },
    [globeMaterial],
  )

  const getCameraPosition = () => {
    if (globeRef.current) {
      const globeWidth = globeRef.current.pointOfView().altitude * 10753
      const test = (globeWidth / 1047) * 124
      console.log(globeWidth, test.toFixed(0))
    }
  }

  return (
    <ResizablePanel id='content-panel' className='flex-1 flex flex-col overflow-hidden dark:bg-black' defaultSize={76} onMouseMove={() => getCameraPosition()}>
      {!isGlobeReady && (
        <div className='absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10'>
          <div className='flex flex-col items-center'>
            <Loader2 className='h-10 w-10 animate-spin text-primary' />
            <p className='mt-4 text-foreground'>Loading Globe...</p>
          </div>
        </div>
      )}
      <div className='w-full flex-1 flex overflow-hidden relative'>
        <Globe
          ref={globeRef}
          onGlobeReady={() => setIsGlobeReady(true)}
          rendererConfig={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',

          }}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor='rgba(0,0,0,0)'
          globeMaterial={globeMaterial as Material | undefined}
          bumpImageUrl={'/earth-bump.webp'}
          showAtmosphere={false}
          onZoom={handleGlobeRotation}
          backgroundImageUrl={resolvedTheme === 'dark' ? '/sky.webp' : null}
          {...(highPerformance ? {
            heatmapsData: [memoizedGData],
            heatmapPointLat: (d) => (d as GlobePoint).properties.latitude,
            heatmapPointLng: (d) => (d as GlobePoint).properties.longitude,
            heatmapPointWeight: (d) => (d as GlobePoint).properties.weight,
            heatmapBandwidth: 0.6,
            heatmapColorSaturation: 2.8,
            heatmapTopAltitude: 0.01,
            heatmapBaseAltitude: 0.005,
            heatmapColorFn: () => getColor,
          } : {
            labelsData: memoizedGData,
            labelLat: (d) => (d as GlobePoint).properties.latitude,
            labelLng: (d) => (d as GlobePoint).properties.longitude,
            labelText: (d) => (d as GlobePoint).properties.name,
            labelSize: (d) => Math.sqrt((d as GlobePoint).properties.weight) * 4e-10,
            labelDotRadius: (d) => Math.sqrt((d as GlobePoint).properties.weight),
            labelColor: () => 'rgba(255, 0, 0, 0.05)',
            onLabelHover: (label) => console.log(label),
          })}
        />
        <Controls />
      </div>
      <div className='w-full h-12 border-t bg-background'>
        <Timeline 
          date={dt}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          timelineSpeed={timelineSpeed}
          setTimelineSpeed={setTimelineSpeed}
          setMoment={setMoment}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>
      {/* <div className='absolute bottom-2 left-2 text-cyan-300 font-mono bg-black/60 px-2 py-1 rounded flex items-center'>
        <Clock className='w-4 h-4 mr-2' />
        {dt.toLocaleString()}
      </div> */}
    </ResizablePanel>
  )
}

export default GlobeComponent

