import type { OilSpills } from '@/@types/oilspills';
import { getOilSpills, getOilSpillByID } from '@/actions/oilspills';

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
    const single = await getOilSpillByID({ oilspill: oilspill.toLowerCase() });
    if (!single) return { data: [] };

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
        if (Array.isArray(ring) && ring.length) {
          const [lng, lat] = ring[0];
          if (typeof lng === 'number' && typeof lat === 'number') {
            return [lng, lat];
          }
        }
      }
    }
  }
  return [0, 0];
}
