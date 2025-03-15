"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { ResizablePanel } from "@/components/ui/resizable"
import { getPanelElement } from "react-resizable-panels"
import * as d3 from "d3"
import { Loader2, Clock } from "lucide-react"
import ThreeGlobe from "three-globe"
import { TextureLoader, ShaderMaterial, type Material, Vector2 } from "three"
import { formatGlobeData } from "@/lib/formatters"

interface GlobePoint {
  properties: {
    latitude: number
    longitude: number
    name: string
    weight: number
    [key: string]: any;
  }
  [key: string]: any;
}
  

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

// Custom shader for day/night cycle
const dayNightShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;
    varying vec3 vNormal;
    varying vec2 vUv;

    float toRad(in float a) {
      return a * PI / 180.0;
    }

    vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
      float theta = toRad(90.0 - c.x);
      float phi = toRad(90.0 - c.y);
      return vec3( // x,y,z
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);
      mat3 rotX = mat3(
        1, 0, 0,
        0, cos(invLat), -sin(invLat),
        0, sin(invLat), cos(invLat)
      );
      mat3 rotY = mat3(
        cos(invLon), 0, sin(invLon),
        0, 1, 0,
        -sin(invLon), 0, cos(invLon)
      );
      vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.1, 0.1, intensity);
      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `,
}

// Solar position calculation
const sunPosAt = (dt: Date) => {
  const day = new Date(dt).setUTCHours(0, 0, 0, 0)
  const t = century(dt)
  const longitude = ((day - dt.getTime()) / 864e5) * 360 - 180
  return [longitude - equationOfTime(t) / 4, declination(t)]
}

// Solar calculation functions
function century(date: Date): number {
  return (date.getTime() / 86400000.0 + 2440587.5 - 2451545.0) / 36525.0
}

function declination(t: number): number {
  return 23.45 * Math.sin(2 * Math.PI * (t * 36525.0 + 0.375))
}

function equationOfTime(t: number): number {
  const epsilon = obliquityCorrection(t)
  const l0 = geomMeanLongSun(t)
  const e = eccentricityEarthOrbit(t)
  const m = geomMeanAnomalySun(t)

  let y = Math.tan(deg2rad(epsilon) / 2.0)
  y *= y

  const sin2l0 = Math.sin(2.0 * deg2rad(l0))
  const sinm = Math.sin(deg2rad(m))
  const cos2l0 = Math.cos(2.0 * deg2rad(l0))
  const sin4l0 = Math.sin(4.0 * deg2rad(l0))
  const sin2m = Math.sin(2.0 * deg2rad(m))

  const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m
  return rad2deg(Etime) * 4.0
}

function obliquityCorrection(t: number): number {
  const e0 = 23.439 - 0.00000036 * t
  return e0
}

function geomMeanLongSun(t: number): number {
  let L0 = 280.46646 + t * (36000.76983 + t * 0.0003032)
  while (L0 > 360.0) L0 -= 360.0
  while (L0 < 0.0) L0 += 360.0
  return L0
}

function eccentricityEarthOrbit(t: number): number {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
}

function geomMeanAnomalySun(t: number): number {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t)
}

function deg2rad(angleDeg: number): number {
  return (Math.PI * angleDeg) / 180.0
}

function rad2deg(angleRad: number): number {
  return (180.0 * angleRad) / Math.PI
}

// Time simulation speed (minutes per frame)
const VELOCITY = 60 // Increased for more noticeable movement

const GlobeComponent = ({ initialData = [] }: { initialData?: GlobePoint[] }) => {
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
    const panelElement = getPanelElement("content-panel")
    containerRef.current = panelElement as HTMLDivElement
  }, [])

  // Handle resizing of the globe
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
    window.addEventListener("resize", handleResize)
    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => {
      window.removeEventListener("resize", handleResize)
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
    .range(["rgba(255,0,0,0)", "rgba(255,0,0,0.7)", "rgba(255,0,0,1)"])
    .interpolate(d3.interpolateCubehelix.gamma(1.5))

  const getColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(1, value))
    return colorScale(clampedValue)
  }

  // Memoize data to avoid unnecessary re-renders
  const memoizedGData = useMemo(() => initialData, [initialData])
  const memoizedGDataFormatted = useMemo(() => formatGlobeData(memoizedGData, "single"), [memoizedGData])

  // Initialize day/night shader material
  useEffect(() => {
    const textureLoader = new TextureLoader()
    textureLoader.setCrossOrigin('anonymous') // Set crossOrigin on the loader

    // Load day and night textures
    Promise.all([textureLoader.loadAsync("/earth-day.jpg"), textureLoader.loadAsync("/earth-night.jpg")])
      .then(([dayTexture, nightTexture]) => {
        // No need to set crossOrigin on the textures themselves
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
        console.error("Failed to load textures:", error)
      })
  }, [])

  // Simulate time passing for day/night cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setDt((prevDt) => {
        const newDt = new Date(prevDt)
        newDt.setMinutes(newDt.getMinutes() + VELOCITY)
        return newDt
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Update sun position when time changes
  useEffect(() => {
    if (globeMaterial?.uniforms) {
      const [lng, lat] = sunPosAt(dt)
      globeMaterial.uniforms.sunPosition.value.set(lng, lat)
    }
  }, [dt, globeMaterial])

  // Handle globe rotation for shader
  const handleGlobeRotation = useCallback(
    ({ lng, lat }: { lng: number; lat: number }) => {
      if (globeMaterial?.uniforms) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat)
      }
    },
    [globeMaterial],
  )

  console.log(memoizedGDataFormatted)

  const getLabelStyle = (weight: number) => ({
    background: `linear-gradient(45deg, rgba(255,0,0,0.75), rgba(0,0,255,0.75))`,
    padding: "4px 8px",
    borderRadius: "4px"
  });

  return (
    <ResizablePanel id="content-panel" className="flex-1 overflow-hidden" defaultSize={76}>
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
          antialias: true,
          alpha: true,
          powerPreference: "default",
        }}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial as Material | undefined}
        bumpImageUrl={'/earth-bump.webp'}
        backgroundImageUrl="/night-sky.png"
        showAtmosphere={true}
        atmosphereAltitude={0.15}
        atmosphereColor="rgba(65, 105, 225, 0.5)"
        showGraticules={true}
        // heatmapsData={[memoizedGData]}
        // heatmapPointLat="lat"
        // heatmapPointLng="lng"
        // heatmapPointWeight="weight"
        // heatmapBandwidth={2.5}
        // heatmapTopAltitude={0.01}
        // heatmapBaseAltitude={0.005}
        // heatmapColorFn={() => getColor}
        hexPolygonResolution={3}
        hexPolygonMargin={0.2}
        onZoom={handleGlobeRotation}
      labelsData={memoizedGDataFormatted as GlobePoint[]}
      labelLat={(d) => (d as GlobePoint).properties.latitude}
      labelLng={(d) => (d as GlobePoint).properties.longitude}
      labelText={(d) => (d as GlobePoint).properties.name}
      labelSize={(d) => Math.sqrt((d as GlobePoint).properties.weight) * 4e-4}
      labelDotRadius={(d) => Math.sqrt((d as GlobePoint).properties.weight)}
      labelColor={() => "rgba(255, 0, 0, 0.75)"}
      labelResolution={2}
      />
      <div className="absolute bottom-2 left-2 text-cyan-300 font-mono bg-black/60 px-2 py-1 rounded flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        {dt.toLocaleString()}
      </div>
    </ResizablePanel>
  )
}

export default GlobeComponent

