import * as THREE from 'three';
import type { GlobePoint } from '@/@types/globe';

const blurTexture = new THREE.TextureLoader().load('/blur-circle.webp');

export function createCustomSmudge(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globeRef: any,
  group: { id: string; points: GlobePoint[] },
  dataWeightMultiplier = 1
): THREE.Object3D {
   const groupObj = new THREE.Group();

  for (const point of group.points) {
    const { latitude, longitude, density = 1, color = '#ff3030' } = point;

    const clampedDensity = Math.min(Math.max(density, 0), 1);
    const pos = globeRef.current.getCoords(latitude, longitude, 0.0000013);
    const radius = 0.3 * Math.sqrt(clampedDensity) * dataWeightMultiplier;

    const opacity = Math.min(Math.max(density, 0.2), 0.6);

    const geometry = new THREE.PlaneGeometry(radius, radius);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      map: blurTexture,
      alphaMap: blurTexture,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);
    mesh.lookAt(new THREE.Vector3(0, 0, 0));
    groupObj.add(mesh);
  }

  return groupObj;
}
