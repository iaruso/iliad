import type { OilSpills } from '@/@types/oilspills';
import { getOilSpills, getOilSpillByID } from '@/actions/oilspills';

export async function fetchOilspillData({
  oilspill,
  page,
  size,
  id,
  minArea,
  maxArea,
  sortField,
  sortDirection
}: {
  oilspill?: string;
  page: number;
  size: number;
  id?: string;
  minArea?: string;
  maxArea?: string;
  sortField?: 'latitude' | 'longitude' | 'area' | 'points';
  sortDirection?: 'asc' | 'desc';
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
    minArea,
    maxArea,
    sortField,
    sortDirection,
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
