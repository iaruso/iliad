import "server-only";
import { readFile } from "fs/promises";
import { join } from "path";

export interface GlobePoint {
  properties: {
    latitude: number;
    longitude: number;
    density: number;
    type?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export async function getGlobeData(): Promise<GlobePoint[]> {
  const filePath = join(process.cwd(), "public", "dataset.json");
  const fileContents = await readFile(filePath, "utf-8");
  const dataset = JSON.parse(fileContents);

  const result: GlobePoint[] = [];

  for (const entry of dataset.data ?? []) {
    for (const actor of entry.actors ?? []) {
      const { type, density, geometry } = actor;

      if (!geometry?.type || !geometry?.coordinates) continue;

      if (geometry.type === "Point") {
        const [lng, lat] = geometry.coordinates;
        result.push({
          properties: {
            latitude: lat,
            longitude: lng,
            density,
            ...(type !== "Oil" && { type }),
          },
        });
      }

      if (geometry.type === "Polygon") {
        const coordinates: [number, number][][] = geometry.coordinates;

        for (const ring of coordinates) {
          for (const [lng, lat] of ring) {
            result.push({
              properties: {
                latitude: lat,
                longitude: lng,
                density,
                ...(type !== "Oil" && { type }),
              },
            });
          }
        }
      }
    }
  }

  return result;
}
