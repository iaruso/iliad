/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import dynamic from 'next/dynamic'
import { useDeepCompareMemo } from 'use-deep-compare';
import { useState, useEffect, useMemo, useRef, useCallback, useContext } from 'react'
import { GlobeContext, GlobeContextProps } from '@/context/globe-context'
import { useTheme } from 'next-themes'
import { useInterval } from 'usehooks-ts'
import { getPanelElement } from 'react-resizable-panels'
import { type Material } from 'three'
import { GlobePoint, GlobeLocation } from '@/@types/globe'
import { sunPositionAt } from '@/lib/solar'
import { getColor } from '@/lib/colors'
import { Loader2 } from 'lucide-react'
import { OilSpills } from '@/@types/oilspills'
import { prepareGlobeData, createGlobeConvex, loadGlobeMaterial } from '@/lib/formatters'
import { useRouter } from '@/i18n/navigation'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full w-full items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  )
})

const GlobeComponent = ({ data }: { data: OilSpills }) => {
  const {
    dataToDisplay,
    setGroupedGlobeData,
    groupedGlobeData,
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
    setPlaying,
    labelsVisible
  } = useContext(GlobeContext) as GlobeContextProps
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [dataDetail, setDataDetail] = useState<'single' | 'original'>('single')
  const [dataWeightMultiplier, setDataWeightMultiplier] = useState(3)
  const lastAnimatedPositionRef = useRef<{ lat: number; lng: number } | null>(null);

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

  const globeData = useMemo(() => {
    if (!data.data) return {};
    return prepareGlobeData(data, dataDetail);
  }, [data, dataDetail]);
  
  useEffect(() => {
    setGroupedGlobeData(globeData);
  }, [globeData]);
  
  useEffect(() => {
    const timestamps = Object.keys(globeData).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );
  
    if (timestamps.length > 0) {
      setDate(new Date(timestamps[0]));
    }
  }, [data]);

  useEffect(() => {
    loadGlobeMaterial({ textureQuality, dayNight }).then(setGlobeMaterial)
  }, [textureQuality, dayNight])

  const timestamps = Object.keys(groupedGlobeData).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  useInterval(() => {
    if (playing) {
      const currentIndex = timestamps.findIndex(ts =>
        new Date(ts).getTime() === date.getTime()
      );
      const next = timestamps[currentIndex + 1];
      if (next) {
        setDate(new Date(next));
      } else {
        setPlaying(false);
      }
    }
  }, 500);

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
            if (data.single) return 'original'
            else if (prevDetail !== 'single') return 'single'
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
    [globeMaterial, viewType, data.single]
  )

  const groupedGData = useDeepCompareMemo(() => {
    const groups: { id: string; points: GlobePoint[] }[] = [];

    for (const spill of dataToDisplay) {
      for (const [densityKey, densityData] of Object.entries(spill.densities)) {
        if ((densityData as { points: GlobePoint[] }).points.length > 0) {
          groups.push({
            id: `${spill.id}-${densityKey}`,
            points: (densityData as { points: GlobePoint[] }).points,
          });
        }
      }
    }

    return groups;
  }, [dataToDisplay]);

  function animateToLocation(latitude: number, longitude: number, altitude: number, duration: number) {
    const currentView = globeRef.current!.pointOfView();
    const startTime = performance.now();

    let animationFrameId: number | null = null;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const interpolatedView = {
        lat: currentView.lat + (latitude - currentView.lat) * progress,
        lng: currentView.lng + (longitude - currentView.lng) * progress,
        altitude: currentView.altitude + (altitude - currentView.altitude) * progress,
      };

      globeRef.current?.pointOfView(interpolatedView);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }

  useEffect(() => {
    if (!globeRef.current || !isGlobeReady) return;

    if (data.single) {
      const latitude = data.data[0]?.coordinates?.[1] ?? 0;
      const longitude = data.data[0]?.coordinates?.[0] ?? 0;
      lastAnimatedPositionRef.current = { 
        lat: Array.isArray(latitude) ? latitude[0] : latitude, 
        lng: Array.isArray(longitude) ? longitude[0] : longitude 
      };
      animateToLocation(latitude as number, longitude as number, 0.01, 2000);
      return;
    }

    if (!dataToDisplay?.length) return;

    const firstPoint = dataToDisplay.find(spill =>
      Object.values(spill.densities).some(d =>
        (d as { points: GlobePoint[] }).points.length > 0
      )
    );

    if (!firstPoint) return;

    const firstDensityWithPoints = Object.values(firstPoint.densities).find(d =>
      (d as { points: GlobePoint[] }).points.length > 0
    ) as { points: GlobePoint[] } | undefined;

    const point = firstDensityWithPoints?.points[0];
    if (!point) return;

    const { latitude: lat, longitude: lng } = point;

    const last = lastAnimatedPositionRef.current;
    const distance = last
      ? Math.sqrt((lat - last.lat) ** 2 + (lng - last.lng) ** 2)
      : Infinity;

    if (distance < 0.01) return;

    lastAnimatedPositionRef.current = { lat, lng };
    animateToLocation(lat, lng, 1, 2000);
  }, [isGlobeReady, data.single, dataToDisplay]);
  
  const labelsData = useDeepCompareMemo(() => {
    return dataToDisplay.flatMap(spill =>
      Object.values(spill.densities).flatMap(d =>
        (d as { points: GlobePoint[] }).points.filter(p =>
          typeof p.latitude === 'number' &&
          typeof p.longitude === 'number' &&
          typeof p.density === 'number' &&
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude) &&
          Number.isFinite(p.density)
        )
      )
    );
  }, [dataToDisplay]);
  
  const htmlIndicators = useDeepCompareMemo(() => {
    return dataToDisplay.map(spill => {
      const original = data.data?.find(entry => entry._id === spill.id);
      const [lng, lat] = original?.coordinates ?? [0, 0];

      return {
        _id: spill.id,
        latitude: lat,
        longitude: lng,
        area: original?.area ?? 0
      };
    });
  }, [dataToDisplay, data.data]);

  const heatmapsData = useDeepCompareMemo(() => {
    return dataToDisplay.flatMap(spill =>
      Object.values(spill.densities).flatMap(d =>
        (d as { points: GlobePoint[] }).points.map(p => ({
          latitude: p.latitude,
          longitude: p.longitude,
          density: p.density ?? 1,
        }))
      )
    );
  }, [dataToDisplay]);
  
  return (
    <>
      <div className='w-full flex-1 flex overflow-hidden relative'>
        <Globe
          key={viewType}
          ref={globeRef}
          onGlobeReady={() => setIsGlobeReady(true)}
          rendererConfig={{
            antialias: false,
            alpha: true,
            powerPreference: 'default',
          }}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor='rgba(0,0,0,0)'
          backgroundImageUrl={resolvedTheme === 'dark' ? '/sky.webp' : null}
          globeMaterial={globeMaterial as Material | undefined}
          bumpImageUrl='/earth-bump.webp'
          showAtmosphere={false}
          onZoom={handleGlobeRotation}
          {...(dataDetail === 'original' && {
            customLayerData: groupedGData,
            customThreeObject: (d) => createGlobeConvex(globeRef, d as { id: string; points: GlobePoint[] }, dataWeightMultiplier),
            customThreeObjectUpdate: () => {}
          })}          
          {...(viewType === 'heatmap' && {
            heatmapsData: [heatmapsData],
            heatmapPointLat: (d) => (d as GlobePoint).latitude,
            heatmapPointLng: (d) => (d as GlobePoint).longitude,
            heatmapPointWeight: 1,
            heatmapBandwidth: 0.6,
            heatmapColorSaturation: 2.8,
            heatmapTopAltitude: 0.01,
            heatmapBaseAltitude: 0.005,
            heatmapColorFn: () => getColor,
            enablePointerInteraction: false
          })}
          {...(dataDetail === 'single' && !data.single ? {
            labelsData: labelsData,
            labelsTransitionDuration: 0,
            labelLat: (d) => (d as GlobePoint).latitude,
            labelLng: (d) => (d as GlobePoint).longitude,
            labelText: (d) => (d as GlobePoint)._id || 'Unknown',
            labelSize: 4e-10,
            labelDotRadius: (d) => {
              const density = Number.isFinite((d as GlobePoint).density) ? (d as GlobePoint).density : 1;
              return Math.min(Math.sqrt(Math.min(density, 1)) * Math.max(altitude, 0.004) * 0.2, 1) * dataWeightMultiplier * 0.2;
            },
            labelColor: (d) => (d as GlobePoint).color || '#ff0000',
          } : {
            labelsData: [],
            labelLat: () => 0,
            labelLng: () => 0,
            labelText: () => '',
            labelSize: () => 0,
            labelDotRadius: () => 0,
            labelColor: () => '#ff0000'
          })}
          {...(!data.single && labelsVisible ? {
            htmlElementsData: htmlIndicators,
            htmlLat: (d) => (d as GlobeLocation).latitude,
            htmlLng: (d) => (d as GlobeLocation).longitude,
            htmlAltitude: 0.0001,
            htmlElement: (d) => {
              const wrapper = document.createElement('div');
              wrapper.style.position = 'relative';
            
              const id = (d as GlobeLocation)._id?.slice(-9) ?? 'unknown';
              const area = (d as GlobeLocation).area?.toFixed(2) ?? '-';
            
              const inner = document.createElement('a');
              inner.classList.add('globe-point-button');
              inner.href = `?oilspill=${(d as GlobeLocation)._id}`;
              inner.style.textDecoration = 'none';
              inner.style.pointerEvents = 'auto';
              inner.style.cursor = 'pointer';
            
              inner.innerHTML = `
                <span>${id}</span>
                <div>
                  <span>${area} km²</span>
                  <span>[${(d as GlobeLocation).latitude.toFixed(2)}, ${(d as GlobeLocation).longitude.toFixed(2)}]</span>
                </div>
              `;
            
              inner.onclick = (e) => {
                e.preventDefault();
                router.push(`?oilspill=${(d as GlobeLocation)._id}`);
              };
            
              inner.style.position = 'absolute';
              inner.style.bottom = '4px';
              inner.style.left = '4px';
            
              wrapper.appendChild(inner);
              return wrapper;
            },            
            htmlElementVisibilityModifier: (el, isVisible) => {
              el.style.opacity = isVisible ? '1' : '0';
            }
          } : {
            htmlElementsData: []
          })}
        />
      </div>
    </>
  )
}

export default GlobeComponent