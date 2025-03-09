import "server-only"
import { readFile } from "fs/promises"
import { join } from "path"

interface GlobePoint {
  lat: number
  lng: number
  weight: number
}

interface PolygonData {
  type: string
  coordinates: [number, number][]
}

export async function getGlobeData(): Promise<GlobePoint[]> {
  const filePath = join(process.cwd(), "public", "vc_cloudpoints_timeline.json")
  const fileContents = await readFile(filePath, "utf-8")
  const data = JSON.parse(fileContents)

  const stateData = data?.["@definitions"]?.["@actors"]?.["OilShape"]?.["@state"]?.[0]?.polygon

  if (!stateData) return []

  const parsedPolygon = JSON.parse(stateData) as PolygonData

  if (parsedPolygon?.type !== "MultiPoint" || !Array.isArray(parsedPolygon?.coordinates)) {
    return []
  }

  return parsedPolygon.coordinates.map(([lng, lat]: [number, number]) => ({
    lat,
    lng,
    weight: 0.5 + Math.random() * 0.5, // Peso variável
  }))
}
