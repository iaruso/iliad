'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo, useRef, useCallback, useContext } from 'react'
import { GlobeContext, GlobeContextProps } from '@/context/globe-context'
import { useTheme } from 'next-themes'
import { useInterval } from 'usehooks-ts'
import { getPanelElement } from 'react-resizable-panels'
import { TextureLoader, ShaderMaterial, type Material, Vector2 } from 'three'
import { GlobePoint } from '@/types/globe'
import { dayNightShader } from '@/lib/shaders'
import { formatGlobeData } from '@/lib/formatters'
import { sunPositionAt } from '@/lib/solar'
import { getColor } from '@/lib/colors'
import { DateRange } from 'react-aria-components'
import { Loader2 } from 'lucide-react'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full w-full items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  )
})

const VELOCITY = 60

const GlobeComponent = ({ initialData = [] }: { initialData?: GlobePoint[] }) => {
  const {
    globeRef,
    isGlobeReady,
    setIsGlobeReady,
    globeMaterial,
    setGlobeMaterial,
    currentLocation,
    zoomControl,
    viewType,
    textureQuality,
    dayNight,
    altitude,
    setAltitude,
    date,
    setDate,
    playing,
  } = useContext(GlobeContext) as GlobeContextProps
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [dataDetail, setDataDetail] = useState<'single' | 'low' | 'medium' | 'high'>('single')

  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const panelElement = getPanelElement('content-panel')
    containerRef.current = panelElement as HTMLDivElement
  }, [])

  // Resize observer and event listener for container dimensions
  const [needsResize, setNeedsResize] = useState(true)
  useEffect(() => {
    const handleResize = () => setNeedsResize(true)
    window.addEventListener('resize', handleResize)
    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) observer.unobserve(containerRef.current)
    }
  }, [])

  useInterval(() => {
    setDimensions({
      width: containerRef.current?.clientWidth || window.innerWidth,
      height: (containerRef.current?.clientHeight ?? window.innerHeight) - 48
    })
    setNeedsResize(false)
  }, needsResize ? 200 : null)

  // Memoize formatted globe data
  const memoizedGData = useMemo(() => formatGlobeData(initialData, dataDetail), [
    initialData,
    dataDetail
  ])

  // Load textures and create the ShaderMaterial
  useEffect(() => {
    const textureLoader = new TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    const dayTexture = textureQuality === 'low' ? '/earth-day.webp' : '/earth-day-hq.webp'
    const nightTexture = textureQuality === 'low' ? '/earth-night.webp' : '/earth-night-hq.webp'

    if (!dayNight) {
      textureLoader.loadAsync(dayTexture)
      .then((dayTex) => {
        dayTex.needsUpdate = true
        const material = new ShaderMaterial({
        uniforms: {
          dayTexture: { value: dayTex },
          sunPosition: { value: new Vector2() },
          globeRotation: { value: new Vector2() }
        },
        vertexShader: dayNightShader.vertexShader,
        fragmentShader: dayNightShader.fragmentShader
        })
        setGlobeMaterial(material)
      })
      .catch((error) => {
        console.error('Failed to load day texture:', error)
      })
    } else {
      Promise.all([textureLoader.loadAsync(dayTexture), textureLoader.loadAsync(nightTexture)])
      .then(([dayTex, nightTex]) => {
        dayTex.needsUpdate = true
        nightTex.needsUpdate = true
        const material = new ShaderMaterial({
        uniforms: {
          dayTexture: { value: dayTex },
          nightTexture: { value: nightTex },
          sunPosition: { value: new Vector2() },
          globeRotation: { value: new Vector2() }
        },
        vertexShader: dayNightShader.vertexShader,
        fragmentShader: dayNightShader.fragmentShader
        })
        setGlobeMaterial(material)
      })
      .catch((error) => {
        console.error('Failed to load textures:', error)
      })
    }
  }, [textureQuality, dayNight])

  // Update date if playing
  useInterval(() => {
    if (playing) {
      const newDt = new Date(date)
      newDt.setMinutes(newDt.getMinutes() + VELOCITY)
      setDate(newDt)
    }
  }, 1000)

  // Update the sun position in the shader material based on dt
  useEffect(() => {
    if (globeMaterial?.uniforms) {
      const [lng, lat] = sunPositionAt(date)
      globeMaterial.uniforms.sunPosition.value.set(lng, lat)
    }
  }, [date, globeMaterial])

  useEffect(() => {
    if (globeRef.current && zoomControl !== undefined) {
      const currentAltitude = globeRef.current.pointOfView().altitude
      globeRef.current.pointOfView({ altitude: currentAltitude + zoomControl })
    }
  }, [zoomControl])

  useEffect(() => {
    if (globeRef.current && currentLocation) {
      const { lat, lng } = currentLocation
      const currentView = globeRef.current.pointOfView()
      const targetView = { lat, lng, altitude: 0.5 }
      const duration = 2000 // Animation duration in milliseconds

      let animationFrameId: number | null = null
      const startTime = performance.now()

      const animate = (time: number) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)

        const interpolatedView = {
          lat: currentView.lat + (targetView.lat - currentView.lat) * progress,
          lng: currentView.lng + (targetView.lng - currentView.lng) * progress,
          altitude:
            currentView.altitude +
            (targetView.altitude - currentView.altitude) * progress
        }

        globeRef.current?.pointOfView(interpolatedView)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        }
      }

      animationFrameId = requestAnimationFrame(animate)

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
      }
    }
  }, [currentLocation])

  const handleGlobeRotation = useCallback(
    ({ lng, lat }: { lng: number; lat: number }) => {
      if (rotationTimeoutRef.current) clearTimeout(rotationTimeoutRef.current)
      if (globeMaterial?.uniforms) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat)
      }
      rotationTimeoutRef.current = setTimeout(() => {
        if (globeRef.current && viewType === 'points') {
          const newAltitude = globeRef.current.pointOfView().altitude
          console.log('New altitude:', newAltitude)
          setDataDetail((prevDetail) => {
            if (newAltitude > 0.5 && prevDetail !== 'single') return 'single'
            if (newAltitude > 0.1 && newAltitude <= 0.5 && prevDetail !== 'low') return 'low'
            if (newAltitude > 0.05 && newAltitude <= 0.1 && prevDetail !== 'medium') return 'medium'
            if (newAltitude <= 0.05 && prevDetail !== 'high') return 'high'
            return prevDetail
          })
          setAltitude(newAltitude)
        }
      }, 200)
    },
    [globeMaterial, viewType]
  )

  return (
    <>
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
          key={viewType}
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
          bumpImageUrl='/earth-bump.webp'
          showAtmosphere={false}
          onZoom={handleGlobeRotation}
          backgroundImageUrl={resolvedTheme === 'dark' ? '/sky.webp' : null}
          {...(viewType === 'heatmap' ? {
            heatmapsData: [memoizedGData],
            heatmapPointLat: (d) => (d as GlobePoint).properties.latitude,
            heatmapPointLng: (d) => (d as GlobePoint).properties.longitude,
            heatmapPointWeight: (d) => (d as GlobePoint).properties.weight,
            heatmapBandwidth: 0.6,
            heatmapColorSaturation: 2.8,
            heatmapTopAltitude: 0.01,
            heatmapBaseAltitude: 0.005,
            heatmapColorFn: () => getColor,
            enablePointerInteraction: false
          } : {
            labelsData: memoizedGData,
            labelLat: (d) => (d as GlobePoint).properties.latitude,
            labelLng: (d) => (d as GlobePoint).properties.longitude,
            labelText: (d) => (d as GlobePoint).properties.name,
            labelSize: (d) => Math.sqrt((d as GlobePoint).properties.weight) * 4e-10,
            labelDotRadius: (d) => Math.sqrt((d as GlobePoint).properties.weight) * altitude * 0.9,
            labelColor: () => 'rgba(255, 0, 0, 1)',
            onLabelHover: (label) => console.log(label)
            }
          )}
        />
      </div>
    </>
  )
}

export default GlobeComponent