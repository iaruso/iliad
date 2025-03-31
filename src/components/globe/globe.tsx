'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo, useRef, useCallback, useContext } from 'react'
import { GlobeContext, GlobeContextProps } from '@/context/globe-context'
import { useTheme } from 'next-themes'
import { useInterval } from 'usehooks-ts'
import { getPanelElement } from 'react-resizable-panels'
import { TextureLoader, ShaderMaterial, type Material, Vector2 } from 'three'
import { GlobePoint } from '@/@types/globe'
import { dayNightShader } from '@/lib/shaders'
import { formatGlobeData } from '@/lib/formatters'
import { sunPositionAt } from '@/lib/solar'
import { getColor } from '@/lib/colors'
import { Loader2 } from 'lucide-react'
import * as THREE from 'three'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full w-full items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  )
})

function computeConvexHull(pts: THREE.Vector2[]): THREE.Vector2[] {
  const hull = [];

  // Find leftmost point
  let leftMost = pts.reduce((left, p) => (p.x < left.x ? p : left), pts[0]);
  let current = leftMost;

  do {
    hull.push(current);
    let next = pts[0];

    for (let i = 1; i < pts.length; i++) {
      if (next === current) {
        next = pts[i];
        continue;
      }

      const cross = (next.x - current.x) * (pts[i].y - current.y) - 
                    (next.y - current.y) * (pts[i].x - current.x);
      if (cross < 0) {
        next = pts[i];
      }
    }

    current = next;
  } while (current !== leftMost);

  return hull;
}

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
  const [dataWeightMultiplier, setDataWeightMultiplier] = useState(3)

  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const panelElement = getPanelElement('content-panel')
    containerRef.current = panelElement as HTMLDivElement
  }, [])

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
  }, needsResize ? 100 : null)

  // Memoize formatted globe data
  const memoizedGData = useMemo(() => formatGlobeData(initialData, dataDetail), [
    initialData,
    dataDetail
  ])

  useEffect(() => {
    const textureLoader = new TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    const dayTexture = textureQuality === 'low' ? '/earth-day.webp' : '/earth-day-hq.webp'
    const nightTexture = textureQuality === 'low' ? '/earth-night.webp' : '/earth-night-hq.webp'
    const noLightsTexture = textureQuality === 'low' ? '/earth-night-no-lights.webp' : '/earth-night-no-lights-hq.webp'

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
      Promise.all([
        textureLoader.loadAsync(dayTexture),
        textureLoader.loadAsync(nightTexture),
        textureLoader.loadAsync(noLightsTexture)
      ])
      .then(([dayTex, nightTex, noLightsTex]) => {
        dayTex.needsUpdate = true
        nightTex.needsUpdate = true
        noLightsTex.needsUpdate = true
      
        const material = new ShaderMaterial({
          uniforms: {
            dayTexture: { value: dayTex },
            nightTexture: { value: nightTex },
            noLightsTexture: { value: noLightsTex },
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
      const duration = 2000

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
      if (globeRef.current) {
        globeRef.current.controls().maxDistance = 500;
      }
      if (rotationTimeoutRef.current) clearTimeout(rotationTimeoutRef.current)
      if (globeMaterial?.uniforms) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat)
      }
      rotationTimeoutRef.current = setTimeout(() => {
        if (globeRef.current && viewType === 'points') {
          const newAltitude = globeRef.current.pointOfView().altitude
          globeRef.current.controls({ maxDistance: 500 })
          setDataDetail((prevDetail) => {
            if (newAltitude > 0.1 && prevDetail !== 'single') return 'single'
            if (newAltitude > 0.02 && newAltitude <= 0.1 && prevDetail !== 'low') return 'low'
            if (newAltitude > 0.01 && newAltitude <= 0.02 && prevDetail !== 'medium') return 'medium'
            if (newAltitude <= 0.01 && prevDetail !== 'high') return 'high'
            return prevDetail
          })
          setDataWeightMultiplier((prevMultiplier) => {
            if (newAltitude > 0.1 && prevMultiplier !== 1) return 2.5
            if (newAltitude > 0.02 && newAltitude <= 0.1 && prevMultiplier !== 0.5) return 1.75
            if (newAltitude > 0.01 && newAltitude <= 0.02 && prevMultiplier !== 0.25) return 1.25
            if (newAltitude <= 0.01 && prevMultiplier !== 0.1) return 1
            return prevMultiplier
          })
          setAltitude(newAltitude)
        }
      }, 200)
    },
    [globeMaterial, viewType]
  )

  const groupedGData = useMemo(() => {
    const groups: Record<string, GlobePoint[]> = {};
    for (const point of memoizedGData) {
      const groupId = point.properties.groupId ?? 'default';
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId].push(point);
    }
  
    return Object.entries(groups).map(([id, points]) => ({
      id,
      points
    }));
  }, [memoizedGData]);
  
  console.log(memoizedGData)
  return (
    <>
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
          {...(dataDetail !== 'single' ? {
            customLayerData: groupedGData,
            customThreeObject: (d: object) => {
              const group = d as { id: string; points: GlobePoint[] };

              const flatPoints = group.points.map(p =>
                new THREE.Vector2(p.properties.longitude, p.properties.latitude)
              );
              const hull2D = computeConvexHull(flatPoints);
              if (hull2D.length < 3) return new THREE.Object3D();

              const center = hull2D.reduce((acc, pt) => acc.add(pt), new THREE.Vector2(0, 0)).divideScalar(hull2D.length);
              const relativePoints = hull2D.map(p => new THREE.Vector2(p.x - center.x, p.y - center.y));

              const shape = new THREE.Shape(relativePoints);
              const shapeGeometry2D = new THREE.ShapeGeometry(shape);
              const positionAttr = shapeGeometry2D.getAttribute('position');

              const positions3D: THREE.Vector3[] = [];

              for (let i = 0; i < positionAttr.count; i++) {
                const x = positionAttr.getX(i);
                const y = positionAttr.getY(i);
                const lng = center.x + x;
                const lat = center.y + y;

                const vec3 = globeRef.current.getCoords(lat, lng, 0.000001);
                positions3D.push(vec3);
              }

              const geometry = new THREE.BufferGeometry();
              const vertices = new Float32Array(positions3D.length * 3);
              for (let i = 0; i < positions3D.length; i++) {
                vertices[i * 3] = positions3D[i].x;
                vertices[i * 3 + 1] = positions3D[i].y;
                vertices[i * 3 + 2] = positions3D[i].z;
              }

              geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
              geometry.setIndex(shapeGeometry2D.getIndex());
              geometry.computeVertexNormals();

              const fillMaterial = new THREE.MeshLambertMaterial({
                color: '#ff0000',
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
              });

              const mesh = new THREE.Mesh(geometry, fillMaterial);
              const contourPoints = hull2D.map(p =>
                globeRef.current.getCoords(p.y, p.x, 0.0000011)
              );
              contourPoints.push(contourPoints[0]);

              const lineGeometry = new THREE.BufferGeometry().setFromPoints(contourPoints);
              const lineMaterial = new THREE.LineBasicMaterial({ color: '#ff0000', linewidth: 1 });
              const line = new THREE.LineLoop(lineGeometry, lineMaterial);

              const groupObj = new THREE.Group();
              groupObj.add(mesh);
              groupObj.add(line);

              return groupObj;
            },
            customThreeObjectUpdate: () => {}
          } : {
            customLayerData: undefined,
            customThreeObject: () => new THREE.Object3D(),
            customThreeObjectUpdate: () => {}
          })}
          {...(viewType === 'heatmap' ? {
            heatmapsData: [memoizedGData],
            heatmapPointLat: (d) => (d as GlobePoint).properties.latitude,
            heatmapPointLng: (d) => (d as GlobePoint).properties.longitude,
            heatmapPointWeight: (d) => (d as GlobePoint).properties.density,
            heatmapBandwidth: 0.6,
            heatmapColorSaturation: 2.8,
            heatmapTopAltitude: 0.01,
            heatmapBaseAltitude: 0.005,
            heatmapColorFn: () => getColor,
            enablePointerInteraction: false
          } : {
            labelsData: memoizedGData,
            labelsTransitionDuration: 0,
            labelLat: (d) => (d as GlobePoint).properties.latitude,
            labelLng: (d) => (d as GlobePoint).properties.longitude,
            labelText: (d) => (d as GlobePoint).properties.name,
            labelSize: (d) => Math.sqrt((d as GlobePoint).properties.density) * 4e-10,
            labelDotRadius: (d) => Math.min(Math.sqrt((d as GlobePoint).properties.density) * Math.max(altitude, 0.004) * 0.2, 1) * dataWeightMultiplier,
            labelColor: () => 'rgba(255, 0, 0, 1)'
            }
          )}
        />
      </div>
    </>
  )
}

export default GlobeComponent