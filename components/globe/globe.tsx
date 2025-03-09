"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useMemo, useRef } from "react"
import { ResizablePanel } from "@/components/ui/resizable"
import { getPanelElement } from "react-resizable-panels"
import Earth from "../../public/earth.webp"
import Bump from "../../public/earth_bump.webp"
import * as d3 from "d3"
import { Loader2 } from "lucide-react"

interface GlobePoint {
  lat: number
  lng: number
  weight: number
}

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})


const GlobeComponent = ({ initialData }: { initialData: GlobePoint[] }) => {
  const [isGlobeReady, setIsGlobeReady] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const panelElement = getPanelElement("content-panel")
    containerRef.current = panelElement as HTMLDivElement
  }, [])

// Handle resizing of the globe
useEffect(() => { 
  let resizeTimeout: NodeJS.Timeout;

  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      setDimensions({
        width: containerRef.current?.clientWidth || window.innerWidth,
        height: containerRef.current?.clientHeight || window.innerHeight,
      });
    }, 200);
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  const observer = new ResizeObserver(handleResize);
  if (containerRef.current) {
    observer.observe(containerRef.current);
  }
  return () => {
    window.removeEventListener('resize', handleResize);
    if (containerRef.current) {
      observer.unobserve(containerRef.current);
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  };
}, []);

  const colorScale = d3
    .scaleLinear<string>()
    .domain([0, 1, 2])
    .range(["rgba(255,0,0,0)", "rgba(255,0,0,0.7)", "rgba(255,0,0,1)"])
    .interpolate(d3.interpolateCubehelix.gamma(1.5))

  const getColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(1, value))
    return colorScale(clampedValue)
  }

  // Memoizar os dados para evitar re-renderizações desnecessárias
  const memoizedGData = useMemo(() => initialData, [initialData])

  // Lidar com a rotação automática
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.1
    }
  }, [])

  return (
    <ResizablePanel id="content-panel" className='flex-1 overflow-hidden' defaultSize={76}>
      {!isGlobeReady && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-foreground">Loading Globe...</p>
          </div>
        </div>
      )}
      <Globe
        ref={globeRef}
        onGlobeReady={() => setIsGlobeReady(true)}
        rendererConfig={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="hsla(0 0% 0%, 0)"
        globeImageUrl={Earth.src}
        bumpImageUrl={Bump.src}
        showAtmosphere={false}
        atmosphereAltitude={0.02}
        showGraticules={true}
        heatmapsData={[memoizedGData]}
        heatmapPointLat="lat"
        heatmapPointLng="lng"
        heatmapPointWeight="weight"
        heatmapBandwidth={2.5}
        heatmapTopAltitude={0.01}
        heatmapBaseAltitude={0.005}
        heatmapColorFn={() => getColor}
        hexPolygonResolution={1}
        hexPolygonMargin={0.2}
      />
    </ResizablePanel>
  )
}

export default GlobeComponent