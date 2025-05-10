
import { OilSpills } from '@/@types/oilspills';
import { GlobePoint, FormattedGlobeStructure } from '@/@types/globe';

export function formatGlobeStructure(dataset: OilSpills): FormattedGlobeStructure[] {
  return (dataset?.data ?? []).map((oilSpill) => {
    const formatted: FormattedGlobeStructure = {
      _id: oilSpill?._id?.toString?.() || '',
      objects: [],
      oilsByDensity: {},
    };

    const entries = Array.isArray(oilSpill?.data) ? oilSpill.data : oilSpill?.data ? [oilSpill.data] : [];

    for (const entry of entries) {
      for (const actor of entry?.actors ?? []) {
        const { type, density, geometry, color } = actor;
        if (!geometry?.type || !geometry?.coordinates) continue;

        const points: GlobePoint[] = [];

        if (geometry.type === 'Point') {
          const [lng, lat] = geometry.coordinates ?? [];
          if (typeof lat === 'number' && typeof lng === 'number') {
            points.push({ latitude: lat, longitude: lng, type, density, color });
          }
        } else if (geometry.type === 'Polygon') {
          if (Array.isArray(geometry.coordinates)) {
            for (const ring of geometry.coordinates) {
              if (Array.isArray(ring)) {
                for (const coord of ring) {
                  if (Array.isArray(coord) && coord.length >= 2) {
                    const [lng, lat] = coord;
                    if (typeof lat === 'number' && typeof lng === 'number') {
                      points.push({ latitude: lat, longitude: lng, type, density, color });
                    }
                  }
                }
              }
            }
          }
        }

        if (type !== 'Oil') {
          formatted.objects.push(...points);
        } else {
          const key = density?.toString?.() ?? 'unknown';
          formatted.oilsByDensity[key] ||= [];
          formatted.oilsByDensity[key].push(...points);
        }
      }
    }

    return formatted;
  });
}