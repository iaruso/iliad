/* eslint-disable @typescript-eslint/no-explicit-any */
import { OilSpillData, OilSpills } from '@/@types/oilspills';
import { GlobePoint } from '@/@types/globe';
import * as THREE from 'three';
import { TextureLoader, Vector2, ShaderMaterial } from 'three'
import { dayNightShader } from '@/lib/shaders'
import { getSunPosition } from '@/lib/solar'

type Density = 'single' | 'original';

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

export function prepareGlobeData(dataset: OilSpills, detail: Density = 'original'): GlobePrepared {
  const result: GlobePrepared = {};
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

function computeConvexHull(points: THREE.Vector2[]): THREE.Vector2[] {
  const hull = [];
  const leftMost = points.reduce((left, p) => (p.x < left.x ? p : left), points[0]);
  let current = leftMost;

  do {
    hull.push(current);
    let next = points[0];

    for (let i = 1; i < points.length; i++) {
      if (next === current) {
        next = points[i];
        continue;
      }

      const cross = (next.x - current.x) * (points[i].y - current.y) - 
                    (next.y - current.y) * (points[i].x - current.x);
      if (cross < 0) {
        next = points[i];
      }
    }

    current = next;
  } while (current !== leftMost);

  return hull;
}

export function createGlobeConvex(
  globeRef: any,
  group: { id: string; points: GlobePoint[] },
  dataWeightMultiplier: number
): THREE.Object3D {
  const flatPoints = group.points.map(p => new THREE.Vector2(p.longitude, p.latitude));
  const hull2D = computeConvexHull(flatPoints);
  if (hull2D.length < 3) return new THREE.Object3D();

  const center = hull2D.reduce((acc, pt) => acc.add(pt), new THREE.Vector2(0, 0)).divideScalar(hull2D.length);
  const relativePoints = hull2D.map(p => new THREE.Vector2(p.x - center.x, p.y - center.y));
  const shape = new THREE.Shape(relativePoints);
  const shapeGeometry2D = new THREE.ShapeGeometry(shape);
  const positionAttr = shapeGeometry2D.getAttribute('position');

  const positions3D: THREE.Vector3[] = [];
  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const lng = center.x + x;
    const lat = center.y + y;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const vec3 = globeRef.current.getCoords(lat, lng, 0.000001);
    if (!vec3 || !Number.isFinite(vec3.x) || !Number.isFinite(vec3.y) || !Number.isFinite(vec3.z)) continue;
    positions3D.push(vec3);
  }

  if (positions3D.length < 3) return new THREE.Object3D();

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(positions3D.length * 3);
  for (let i = 0; i < positions3D.length; i++) {
    vertices[i * 3] = positions3D[i].x;
    vertices[i * 3 + 1] = positions3D[i].y;
    vertices[i * 3 + 2] = positions3D[i].z;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(shapeGeometry2D.getIndex());
  geometry.computeVertexNormals();

  const color = group.points[0].color || '#ff0000';
  const fillMaterial = new THREE.MeshLambertMaterial({
    color,
    transparent: true,
    opacity: 0,
    side: THREE.FrontSide,
  });
  const mesh = new THREE.Mesh(geometry, fillMaterial);

  const contourPoints = hull2D.map(p => globeRef.current.getCoords(p.y, p.x, 0.0000011));
  contourPoints.push(contourPoints[0]);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(contourPoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: Math.max(group.points[0].density, 0.1),
  });
  const line = new THREE.LineLoop(lineGeometry, lineMaterial);

  const groupObj = new THREE.Group();
  groupObj.add(mesh);
  groupObj.add(line);

  for (const point of group.points) {
    const { latitude, longitude, density, color } = point;
    const position = globeRef.current.getCoords(latitude, longitude, 0.0000012);
    const radius = Math.min(Math.sqrt(Math.min(density ?? 1, 1)) * 0.01, 0.2) * dataWeightMultiplier * 0.1;
    const dotGeometry = new THREE.SphereGeometry(radius, 8, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: color || '#ff0000',
      transparent: true,
      opacity: 1,
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.copy(position);
    groupObj.add(dot);
  }

  return groupObj;
}

type LoadGlobeMaterialOptions = {
  textureQuality: 'low' | 'mid' | 'high'
  dayNight: boolean
  date?: Date
}

export async function loadGlobeMaterial({
  textureQuality,
  dayNight,
  date = new Date()
}: LoadGlobeMaterialOptions): Promise<ShaderMaterial> {
  const loader = new TextureLoader()
  loader.setCrossOrigin('anonymous')

  const tex = (name: string) =>
    `/earth-${name}${textureQuality === 'low' ? '-lq' : textureQuality === 'mid' ? '' : '-hq'}.webp`

  const sunPosition = getSunPosition(date)

  if (!dayNight) {
    const dayTex = await loader.loadAsync(tex('day'))
    dayTex.needsUpdate = true

    return new ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTex },
        sunPosition: { value: sunPosition },
        globeRotation: { value: new Vector2() }
      },
      vertexShader: dayNightShader.vertexShader,
      fragmentShader: dayNightShader.fragmentShader
    })
  }

  const [dayTex, nightTex, noLightsTex] = await Promise.all([
    loader.loadAsync(tex('day')),
    loader.loadAsync(tex('night')),
    loader.loadAsync(tex('night-no-lights'))
  ])

  dayTex.needsUpdate = true
  nightTex.needsUpdate = true
  noLightsTex.needsUpdate = true

  return new ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTex },
      nightTexture: { value: nightTex },
      noLightsTexture: { value: noLightsTex },
      sunPosition: { value: sunPosition },
      globeRotation: { value: new Vector2() }
    },
    vertexShader: dayNightShader.vertexShader,
    fragmentShader: dayNightShader.fragmentShader
  })
}

export function formatMinutes(minutes: number, withMinutes = true): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${withMinutes ? `${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}` : ''}`;
}
