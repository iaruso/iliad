import { OilSpills } from "@/@types/oilspills";
import { GlobePoint } from "@/@types/globe";

type Density = "single" | "low" | "medium" | "high";

export type GlobePrepared = Record<
  string, // timestamp
  {
    id: string;
    densities: Record<
      string,
      {
        color: string;
        points: GlobePoint[];
      }
    >;
  }[]
>;

const clusterSizes = { single: 1, low: 16, medium: 32, high: 64 };

export function prepareGlobeData(dataset: OilSpills, detail: Density = "high"): GlobePrepared {
  const result: GlobePrepared = {};
  const numClusters = clusterSizes[detail] ?? 1;

  for (const spill of dataset.data ?? []) {
    const _id = spill._id?.toString?.() || "unknown";

    const entries = Array.isArray(spill?.data) ? spill.data : spill?.data ? [spill.data] : [];

    for (const entry of entries) {
      const timestamp = entry.timestamp ?? "unknown";
      result[timestamp] ||= [];

      const oilsByDensity: Record<string, GlobePoint[]> = {};

      for (const actor of entry.actors ?? []) {
        const { type, density, geometry, color } = actor;
        if (!geometry?.type || !geometry?.coordinates) continue;

        const points: GlobePoint[] = [];

        if (geometry.type === "Point") {
          const [lng, lat] = geometry.coordinates ?? [];
          if (typeof lat === "number" && typeof lng === "number") {
            points.push({ latitude: lat, longitude: lng, type, density, color });
          }
        }

        if (geometry.type === "Polygon") {
          for (const ring of geometry.coordinates ?? []) {
            for (const coord of ring ?? []) {
              if (Array.isArray(coord) && coord.length >= 2) {
                const [lng, lat] = coord;
                if (typeof lat === "number" && typeof lng === "number") {
                  points.push({ latitude: lat, longitude: lng, type, density, color });
                }
              }
            }
          }
        }

        if (type === "Oil") {
          const key = density?.toString?.() ?? "unknown";
          oilsByDensity[key] ||= [];
          oilsByDensity[key].push(...points);
        }
      }

      const densities: Record<string, { color: string; points: GlobePoint[] }> = {};

      for (const [densityKey, points] of Object.entries(oilsByDensity)) {
        if (points.length === 0) continue;

        let pointsToUse = points;

        if (detail === "single") {
          const highest = points.reduce((a, b) => (b.density ?? 0) > (a.density ?? 0) ? b : a);
          pointsToUse = [highest];
        } else if (points.length > numClusters) {
          pointsToUse = kMeansClustering(points, numClusters);
        }

        densities[densityKey] = {
          color: points[0].color ?? "#ffffff",
          points: pointsToUse,
        };
      }

      result[timestamp].push({
        id: _id,
        densities,
      });
    }
  }

  return result;
}

function kMeansClustering(data: GlobePoint[], k: number): GlobePoint[] {
  const centroids = data.slice(0, k).map((p) => ({ ...p }));
  let clusters: GlobePoint[][] = Array.from({ length: k }, () => []);
  let hasChanged = true;

  while (hasChanged) {
    clusters = Array.from({ length: k }, () => []);
    for (const point of data) {
      let closestIndex = 0;
      let minDist = Infinity;
      centroids.forEach((c, i) => {
        const dist = haversineDistance(point, c);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = i;
        }
      });
      clusters[closestIndex].push(point);
    }

    hasChanged = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      const newCentroid = calculateClusterCenter(clusters[i]);
      if (
        newCentroid.latitude !== centroids[i].latitude ||
        newCentroid.longitude !== centroids[i].longitude
      ) {
        hasChanged = true;
        centroids[i] = newCentroid;
      }
    }
  }

  return centroids;
}

function calculateClusterCenter(cluster: GlobePoint[]): GlobePoint {
  let latSum = 0, lonSum = 0, totalWeight = 0;

  for (const point of cluster) {
    const weight = point.density ?? 1;
    latSum += point.latitude * weight;
    lonSum += point.longitude * weight;
    totalWeight += weight;
  }

  return {
    latitude: latSum / totalWeight,
    longitude: lonSum / totalWeight,
    density: totalWeight / cluster.length * 0.04,
  };
}

function haversineDistance(a: GlobePoint, b: GlobePoint) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const aCalc = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c;
}
