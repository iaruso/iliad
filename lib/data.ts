import "server-only"
import { readFile } from "fs/promises"
import { join } from "path"

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
    properties: {
      name: "OilShape",
      latitude: lat,
      longitude: lng,
      weight: 1 + Math.random() * 4, // Variable weight between 5 and 50
    }
  }))
}
