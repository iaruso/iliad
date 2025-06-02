import type { OilSpills } from '@/@types/oilspills';
import { getOilSpills, getOilSpillByID } from '@/actions/oilspills';
import { notFound } from 'next/navigation';

export async function fetchOilspillData({
  oilspill,
  page,
  size,
  id,
  areaRange,
  durationRange,
  frequencyRange,
  sortField,
  sortDirection,
  startDate,
  endDate
}: {
  oilspill?: string;
  page: number;
  size: number;
  id?: string;
  areaRange?: string;
  durationRange?: string;
  frequencyRange?: string;
  sortField?: 'latitude' | 'longitude' | 'area' | 'points';
  sortDirection?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}): Promise<OilSpills> {
  if (oilspill) {
    try {
      const single = await getOilSpillByID({ oilspill: oilspill.toLowerCase() });
      if (!single) throw notFound();
      const coordinates = extractCoordinatesFromSingleOilSpill(single.data ?? []);
      return {
        single: true,
        data: [
          {
            ...single,
            coordinates,
          },
        ],
      };
    } catch {
      throw notFound();
    }
  }

  return await getOilSpills({
    page,
    size,
    id: id?.toLowerCase(),
    areaRange,
    durationRange,
    frequencyRange,
    sortField,
    sortDirection,
    startDate,
    endDate,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractCoordinatesFromSingleOilSpill(data: any[]): [number, number] {
  for (const entry of data) {
    for (const actor of entry.actors ?? []) {
      const geom = actor.geometry;
      if (geom?.type === 'Point' && Array.isArray(geom.coordinates)) {
        const [lng, lat] = geom.coordinates;
        if (typeof lng === 'number' && typeof lat === 'number') {
          return [lng, lat];
        }
      }
      if (geom?.type === 'Polygon' && Array.isArray(geom.coordinates)) {
        const ring = geom.coordinates[0];
        // Corrige: só tenta desestruturar se ring[0] for array
        if (Array.isArray(ring) && Array.isArray(ring[0]) && ring[0].length >= 2) {
          const [lng, lat] = ring[0];
          if (typeof lng === 'number' && typeof lat === 'number') {
            return [lng, lat];
          }
        }
        // Caso edge: se ring já for [lng, lat]
        if (Array.isArray(ring) && ring.length >= 2 && typeof ring[0] === 'number' && typeof ring[1] === 'number') {
          return [ring[0], ring[1]];
        }
      }
    }
  }
  return [0, 0];
}
