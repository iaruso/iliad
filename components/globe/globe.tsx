'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { getPanelElement } from 'react-resizable-panels'
import { ResizablePanel } from '@/components/ui/resizable'
import { TextureLoader, ShaderMaterial, type Material, Vector2 } from 'three'
import * as d3 from 'd3'
import { GlobePoint } from '@/types/globe'
import { dayNightShader } from '@/lib/shaders'
import { Loader2, Clock } from 'lucide-react'
import { formatGlobeData, sunPositionAt} from '@/lib/formatters'

  

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full w-full items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  ),
})

const VELOCITY = 1

const GlobeComponent = ({ initialData = [] }: { initialData?: GlobePoint[] }) => {
  const { resolvedTheme } = useTheme()
  const [isGlobeReady, setIsGlobeReady] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })
  const [dt, setDt] = useState(new Date())
  const [globeMaterial, setGlobeMaterial] = useState<ShaderMaterial | null>(null)

  useEffect(() => {
    const panelElement = getPanelElement('content-panel')
    containerRef.current = panelElement as HTMLDivElement
  }, [])

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        setDimensions({
          width: containerRef.current?.clientWidth || window.innerWidth,
          height: containerRef.current?.clientHeight || window.innerHeight,
        })
      }, 200)
    }

    handleResize()
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
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [])

  const colorScale = d3
    .scaleLinear<string>()
    .domain([0, 0.5, 10])
    .range(['rgba(255,0,0,0)', 'rgba(255,0,0,0.7)', 'rgba(255,0,0,1)'])
    .interpolate(d3.interpolateCubehelix.gamma(1.5))

  const getColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(1, value))
    return colorScale(clampedValue)
  }

  // Memoize data to avoid unnecessary re-renders
  const memoizedGData = useMemo(() => initialData, [initialData])
  // const memoizedGDataFormatted = useMemo(() => formatGlobeData(memoizedGData, 'single'), [memoizedGData])

  // Initialize day/night shader material
  useEffect(() => {
    const textureLoader = new TextureLoader()
    textureLoader.setCrossOrigin('anonymous')

    Promise.all([textureLoader.loadAsync('/day-earth.webp'), textureLoader.loadAsync('/night-earth.webp')])
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

  useEffect(() => {
    const interval = setInterval(() => {
      setDt((prevDt) => {
        const newDt = new Date(prevDt)
        newDt.setMinutes(newDt.getMinutes() + VELOCITY)
        return newDt
      })
    }, 1000/60)

    return () => clearInterval(interval)
  }, [])

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

  return (
    <ResizablePanel id='content-panel' className='flex-1 overflow-hidden' defaultSize={76}>
      {!isGlobeReady && (
        <div className='absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10'>
          <div className='flex flex-col items-center'>
            <Loader2 className='h-10 w-10 animate-spin text-primary' />
            <p className='mt-4 text-foreground'>Loading Globe...</p>
          </div>
        </div>
      )}
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
        backgroundImageUrl={resolvedTheme === 'dark' ? '/sky.webp' : null}
        showAtmosphere={false}
        atmosphereAltitude={0.15}
        atmosphereColor='rgba(65, 105, 225, 0.5)'
        heatmapsData={[memoizedGData]}
        heatmapPointLat={(d) => (d as GlobePoint).properties.latitude}
        heatmapPointLng={(d) => (d as GlobePoint).properties.longitude}
        heatmapPointWeight={(d) => (d as GlobePoint).properties.weight}
        heatmapBandwidth={2.5}
        heatmapTopAltitude={0.01}
        heatmapBaseAltitude={0.005}
        heatmapColorFn={() => getColor}
        hexPolygonResolution={3}
        hexPolygonMargin={0.2}
        onZoom={handleGlobeRotation}
      // labelsData={memoizedGDataFormatted as GlobePoint[]}
      // labelLat={(d) => (d as GlobePoint).properties.latitude}
      // labelLng={(d) => (d as GlobePoint).properties.longitude}
      // labelText={(d) => (d as GlobePoint).properties.name}
      // labelSize={(d) => Math.sqrt((d as GlobePoint).properties.weight) * 4e-4}
      // labelDotRadius={(d) => Math.sqrt((d as GlobePoint).properties.weight)}
      // labelColor={() => 'rgba(255, 0, 0, 0.75)'}
      // labelResolution={2}
      />
      {/* <div className='absolute bottom-2 left-2 text-cyan-300 font-mono bg-black/60 px-2 py-1 rounded flex items-center'>
        <Clock className='w-4 h-4 mr-2' />
        {dt.toLocaleString()}
      </div> */}
    </ResizablePanel>
  )
}

export default GlobeComponent

