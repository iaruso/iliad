import { GlobePoint, FormattedGlobeStructure } from "@/@types/globe";

type Density = "single" | "low" | "medium" | "high";

export function formatGlobeData(data: FormattedGlobeStructure[], density: Density): FormattedGlobeStructure[] {
  if (!Array.isArray(data) || data.length === 0) throw new Error("O array de dados está vazio.");

  const clusterSizes = { single: 1, low: 16, medium: 32, high: 64 };
  const numClusters = clusterSizes[density] || 1;

  return data.map((item) => {
    const oilValues = item?.oilsByDensity ? Object.values(item.oilsByDensity).filter(Boolean) : [];
    const allOilPoints = oilValues.reduce<GlobePoint[]>((acc, arr) => acc.concat(Array.isArray(arr) ? arr : []), []);

    if (!Array.isArray(allOilPoints) || allOilPoints.length === 0) return item;

    const clustered = allOilPoints.length <= numClusters ? allOilPoints : kMeansClustering(allOilPoints, numClusters);

    return {
      ...item,
      oilsByDensity: {
        cluster: clustered,
      },
    };
  });
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

      centroids.forEach((centroid, index) => {
        const dist = haversineDistance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = index;
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