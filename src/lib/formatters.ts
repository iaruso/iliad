/* eslint-disable @typescript-eslint/no-explicit-any */
import { OilSpills } from '@/@types/oilspills';
import { GlobePoint } from '@/@types/globe';
import * as THREE from 'three';
import { TextureLoader, Vector2, ShaderMaterial } from 'three'
import { dayNightShader } from '@/lib/shaders'
import { getSunPosition } from '@/lib/solar'

type Density = 'single' | 'original';

export type GlobePrepared = Record<
  string,
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

export function prepareGlobeData(dataset: OilSpills, detail: Density = 'original'): GlobePrepared {
  const result: GlobePrepared = {};
  for (const spill of dataset.data ?? []) {
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

export function prepareActorData(dataset: OilSpills): Record<string, { id: string; actor: any; coordinates: [number, number][] }[]> {
  const result: Record<string, { id: string; actor: any; coordinates: [number, number][] }[]> = {};
  for (const spill of dataset.data ?? []) {
    const _id = spill._id?.toString?.() || 'unknown';
    const entries = Array.isArray(spill?.data) ? spill.data : spill?.data ? [spill.data] : [];

    for (const entry of entries) {
      const timestamp = entry.timestamp ?? '';
      if (!toDate(timestamp)) continue;
      result[timestamp] ||= [];

      const firstActor = Array.isArray(entry.actors) && entry.actors.length > 0 ? entry.actors[0] : null;
      if (!firstActor) continue;

      let coordinates: [number, number][] = [];
      let actorForOutput: any = firstActor;

      if (firstActor.geometry?.type === 'Point' && Array.isArray(firstActor.geometry.coordinates)) {
        const [lng, lat] = firstActor.geometry.coordinates;
        if (typeof lat === 'number' && typeof lng === 'number') {
          coordinates = [[lng, lat]];
        }
      } else if (firstActor.geometry?.type === 'Polygon' && Array.isArray(firstActor.geometry.coordinates)) {
        const ring = firstActor.geometry.coordinates[0];
        if (Array.isArray(ring) && ring.length > 0) {
          const validCoords = ring.filter(
            (coord: any) => Array.isArray(coord) && coord.length >= 2 && typeof coord[0] === 'number' && typeof coord[1] === 'number'
          );
          if (validCoords.length > 0) {
            const centroid = validCoords.reduce(
              (acc, [lng, lat]) => {
                acc.lng += lng;
                acc.lat += lat;
                return acc;
              },
              { lng: 0, lat: 0 }
            );
            const count = validCoords.length;
            const centroidLng = centroid.lng / count;
            const centroidLat = centroid.lat / count;
            coordinates = [[centroidLng, centroidLat]];
            actorForOutput = {
              ...firstActor,
              geometry: {
                type: 'Point',
                coordinates: [centroidLng, centroidLat]
              }
            };
          }
        }
      }

      result[timestamp].push({
        id: _id,
        actor: actorForOutput,
        coordinates,
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
  dataWeightMultiplier: number,
  mode: 'points' | 'convex' = 'convex'
): THREE.Object3D {
  const groupObj = new THREE.Group();
  const color = group.points[0]?.color || '#ff0000';

  if (mode === 'convex') {
    const flatPoints = group.points.map(p => new THREE.Vector2(p.longitude, p.latitude));
    const hull2D = computeConvexHull(flatPoints);
    if (hull2D.length >= 3) {
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
      if (positions3D.length >= 3) {
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

        const fillMaterial = new THREE.MeshLambertMaterial({
          color,
          transparent: true,
          opacity: 0.25,
          side: THREE.FrontSide,
        });
        const mesh = new THREE.Mesh(geometry, fillMaterial);
        groupObj.add(mesh);
      }

      const contourPoints = hull2D.map(p => globeRef.current.getCoords(p.y, p.x, 0.0000011));
      contourPoints.push(contourPoints[0]);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(contourPoints);
      const lineMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: Math.max(group.points[0].density ?? 1, 0.3),
      });
      const line = new THREE.LineLoop(lineGeometry, lineMaterial);
      groupObj.add(line);
    }
  }

  if (mode === 'points') {
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
