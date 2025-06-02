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
import { Loader2 } from 'lucide-react'
import { OilSpills } from '@/@types/oilspills'
import { prepareGlobeData, createGlobeConvex, loadGlobeMaterial, prepareActorData } from '@/lib/formatters'
import { useRouter } from '@/i18n/navigation'
import { createCustomSmudge } from '@/lib/smudge';

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
    actorToDisplay,
    setGroupedGlobeData,
    setActorGlobeData,
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
    setAltitude,
    date,
    setDate,
    playing,
    setPlaying,
    labelsVisible,
    timelineSpeed
  } = useContext(GlobeContext) as GlobeContextProps
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [dataDetail, setDataDetail] = useState<'single' | 'original'>('single')
  const lastAnimatedPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);

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

  const actorData = useMemo(() => {
    return prepareActorData(data);
  }, [data, dataDetail]);
  
  useEffect(() => {
    setGroupedGlobeData(globeData);
    setActorGlobeData(actorData);
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
  }, 500 / timelineSpeed);

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
      const targetView = { lat, lng, altitude: 0.01 }
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
        if (globeRef.current && (viewType === 'points' || viewType === 'convex')) {
          const newAltitude = globeRef.current.pointOfView().altitude
          globeRef.current.controls({ maxDistance: 500 })
          setDataDetail((prevDetail) => {
            if (data.single) return 'original'
            else if (prevDetail !== 'single') return 'single'
            return prevDetail
          })
          setAltitude(newAltitude)
        }
      }, 100)
    },
    [globeMaterial, viewType, data.single]
  )

  const animateToLocation = useCallback((latitude: number, longitude: number, altitude: number, duration: number) => {
    if (!globeRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    const currentView = globeRef.current.pointOfView();
    const startTime = performance.now();
    let animationFrameId: number | null = null;
    let finished = false;

    const animate = (time: number) => {
      if (finished) return;
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
      } else {
        finished = true;
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => {
      finished = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      isAnimatingRef.current = false;
    };
  }, [globeRef]);

  // Memoize groupedGData, labelsData, htmlIndicators
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

  const labelsData = useDeepCompareMemo(() => {
    return actorToDisplay.flatMap(actor => {
      if (!actor.coordinates || !Array.isArray(actor.coordinates)) return [];
      return actor.coordinates.map(([lng, lat]: [number, number]) => ({
        _id: actor.id,
        latitude: lat,
        longitude: lng,
        color: '#CCCCCC'
      }));
    });
  }, [actorToDisplay]);
  
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
  
  useEffect(() => {
    if (!globeRef.current || !isGlobeReady) return;

    if (data.single) {
      const latitude = data.data[0]?.coordinates?.[1] ?? 0;
      const longitude = data.data[0]?.coordinates?.[0] ?? 0;
      lastAnimatedPositionRef.current = { 
        lat: Array.isArray(latitude) ? latitude[0] : latitude, 
        lng: Array.isArray(longitude) ? longitude[0] : longitude 
      };
      animateToLocation(latitude as number, longitude as number, 0.01, 300);
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
    animateToLocation(lat, lng, 1, 300);
  }, [isGlobeReady, data.single, dataToDisplay, viewType]);
  
  useEffect(() => {
    return () => {
      if (isAnimatingRef.current) {
        setIsAnimating(false);
        isAnimatingRef.current = false;
      }
    };
  }, []);

  return (
    <>
      <div
        className={`w-full flex-1 flex overflow-hidden relative${isAnimating ? ' pointer-events-none' : ''}`}
        data-joyride='globe'
      >
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
          backgroundImageUrl={
            resolvedTheme === 'dark' ? 
            textureQuality === 'high' ? '/sky-hq.webp' :
            textureQuality === 'mid' ? '/sky.webp' : '/sky-lq.webp'
            : 
            null
          }
          globeMaterial={globeMaterial as Material | undefined}
          bumpImageUrl={textureQuality === 'high' ? '/earth-bump-hq.webp' : textureQuality === 'mid' ? '/earth-bump.webp' : '/earth-bump-lq.webp'}
          showAtmosphere={false}
          onZoom={handleGlobeRotation}
          {...(viewType === 'convex' && {
            customLayerData: groupedGData,
            customThreeObject: (d) =>
              createGlobeConvex(globeRef, d as { id: string; points: GlobePoint[] }, 1, 'convex'),
            customThreeObjectUpdate: () => {}
          })}
          {...(viewType === 'points'&& {
            customLayerData: groupedGData,
            customThreeObject: (d) =>
              createGlobeConvex(globeRef, d as { id: string; points: GlobePoint[] }, 1, 'points'),
            customThreeObjectUpdate: () => {}
          })}        
          {...(viewType === 'smudge' && {
            customLayerData: groupedGData,
            customThreeObject: (d) =>
              createCustomSmudge(globeRef, d as { id: string; points: GlobePoint[] }, 0.3),
            customThreeObjectUpdate: () => {},
          })}
          {...(actorToDisplay && {
            labelsData: labelsData,
            labelsTransitionDuration: 0,
            labelLat: (d) => (d as GlobePoint).latitude,
            labelLng: (d) => (d as GlobePoint).longitude,
            labelText: (d) => (d as GlobePoint)._id || 'Unknown',
            labelSize: 4e-10,
            labelDotRadius: viewType === 'smudge' ? 0.002 : 0.001,
            labelAltitude: 0.000011,
            labelColor: (d) => (d as GlobePoint).color || '#AAAAAA',
          })}
          {...(labelsVisible ? {
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
              if (data.single) {
                inner.style.cursor = 'default';
                inner.style.pointerEvents = 'none';
                inner.innerHTML = `
                  <span>${id}</span>
                `;
              } else {
                inner.style.cursor = 'pointer';
                inner.style.pointerEvents = 'auto';
                inner.innerHTML = `
                  <span>${id}</span>
                  <div>
                    <span>${area} km²</span>
                    <span>[${(d as GlobeLocation).latitude.toFixed(2)}, ${(d as GlobeLocation).longitude.toFixed(2)}]</span>
                  </div>
                `;
              }
              inner.style.textDecoration = 'none';            
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