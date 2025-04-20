/* eslint-disable @typescript-eslint/no-explicit-any */
import { OilSpillData, OilSpills } from '@/@types/oilspills';
import { GlobePoint } from '@/@types/globe';

type Density = 'single' | 'low' | 'medium' | 'high';

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

function toDate(ts: string): Date | null {
  if (typeof ts !== 'string') return null;
  const d = new Date(ts.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

function interpolateValue(a: number, b: number, factor: number): number {
  return a + (b - a) * factor;
}

function interpolatePoints(p1: GlobePoint, p2: GlobePoint, factor: number): GlobePoint {
  return {
    latitude: interpolateValue(p1.latitude, p2.latitude, factor),
    longitude: interpolateValue(p1.longitude, p2.longitude, factor),
    density: interpolateValue(p1.density ?? 1, p2.density ?? 1, factor),
    type: p1.type,
    color: p1.color ?? p2.color,
  };
}

function getFlatPoints(entry: any): GlobePoint[] {
  const points: GlobePoint[] = [];

  for (const actor of entry.actors ?? []) {
    const { type, density, geometry, color } = actor;
    if (!geometry) continue;

    if (geometry.type === 'Point') {
      const [lon, lat] = geometry.coordinates;
      if (typeof lat === 'number' && typeof lon === 'number') {
        points.push({ latitude: lat, longitude: lon, density, type, color });
      }
    }

    if (geometry.type === 'Polygon') {
      for (const ring of geometry.coordinates) {
        for (const [lon, lat] of ring) {
          if (typeof lat === 'number' && typeof lon === 'number') {
            points.push({ latitude: lat, longitude: lon, density, type, color });
          }
        }
      }
    }
  }

  return points;
}

function interpolateOilspillData(dataset: OilSpills): OilSpills {
  const newData: OilSpills = { 
    ...dataset, 
    data: [] 
  };

  for (const spill of dataset.data ?? []) {
    const entries = Array.isArray(spill.data) ? spill.data : spill.data ? [spill.data] : [];
    const sorted = [...entries]
      .map(e => ({ entry: e, date: toDate(e.timestamp) }))
      .filter(e => e.date !== null)
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime())
      .map(e => e.entry);

    const existingTimestamps = new Set(sorted.map(e => e.timestamp));
    const interpolated: any[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      const ta = toDate(a.timestamp);
      const tb = toDate(b.timestamp);

      if (!ta || !tb) continue;

      const steps = Math.floor((tb.getTime() - ta.getTime()) / (15 * 60 * 1000));
      if (steps < 1) continue;

      const pointsA = getFlatPoints(a);
      const pointsB = getFlatPoints(b);

      interpolated.push(a); // keep original

      for (let step = 1; step < steps; step++) {
        const factor = step / steps;
        const midTimestamp = new Date(ta.getTime() + step * 15 * 60 * 1000);
        const tsString = midTimestamp.toISOString().replace('T', ' ').slice(0, 19);

        if (existingTimestamps.has(tsString)) continue;

        const interpolatedActors = pointsA.map((p, idx) => {
          const q = pointsB[idx] || p;
          const point = interpolatePoints(p, q, factor);
          return {
            type: point.type,
            density: point.density,
            color: point.color,
            geometry: {
              type: 'Point',
              coordinates: [point.longitude, point.latitude],
            },
          };
        });

        interpolated.push({
          timestamp: tsString,
          actors: interpolatedActors,
        });
      }
    }

    if (sorted.length > 0) {
      interpolated.push(sorted[sorted.length - 1]);
    }

    newData.data?.push({
      ...spill,
      data: interpolated.map(entry => ({
        timestamp: entry.timestamp as string,
        actors: entry.actors as any[],
      })) as unknown as OilSpillData,
    });
  }

  return newData;
}

export function prepareGlobeData(dataset: OilSpills, detail: Density = 'high'): GlobePrepared {
  const result: GlobePrepared = {};
  const numClusters = clusterSizes[detail] ?? 1;
  const interpolatedDataset = interpolateOilspillData(dataset);

  for (const spill of interpolatedDataset.data ?? []) {
    const _id = spill._id?.toString?.() || 'unknown';
    const entries = Array.isArray(spill?.data) ? spill.data : spill?.data ? [spill.data] : [];

    for (const entry of entries) {
      const timestamp = entry.timestamp ?? '';
      if (!toDate(timestamp)) continue;
      result[timestamp] ||= [];

      const oilsByDensity: Record<string, GlobePoint[]> = {};

      for (const actor of entry.actors ?? []) {
        const { type, density, geometry, color } = actor;
        if (!geometry?.type || !geometry?.coordinates) continue;

        const points: GlobePoint[] = [];

        if (geometry.type === 'Point') {
          const [lng, lat] = geometry.coordinates ?? [];
          if (typeof lat === 'number' && typeof lng === 'number') {
            points.push({ latitude: lat, longitude: lng, type, density, color });
          }
        }

        if (geometry.type === 'Polygon') {
          for (const ring of geometry.coordinates ?? []) {
            for (const coord of ring ?? []) {
              if (Array.isArray(coord) && coord.length >= 2) {
                const [lng, lat] = coord;
                if (typeof lat === 'number' && typeof lng === 'number') {
                  points.push({ latitude: lat, longitude: lng, type, density, color });
                }
              }
            }
          }
        }

        if (type === 'Oil') {
          const key = density?.toString?.() ?? 'unknown';
          oilsByDensity[key] ||= [];
          oilsByDensity[key].push(...points);
        }
      }

      const densities: Record<string, { color: string; points: GlobePoint[] }> = {};

      for (const [densityKey, points] of Object.entries(oilsByDensity)) {
        if (points.length === 0) continue;

        let pointsToUse = points;

        if (detail === 'single') {
          const highest = points.reduce((a, b) => (b.density ?? 0) > (a.density ?? 0) ? b : a);
          pointsToUse = [highest];
        } else if (points.length > numClusters) {
          pointsToUse = kMeansClustering(points, numClusters);
        }

        densities[densityKey] = {
          color: points[0].color ?? '#ffffff',
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
