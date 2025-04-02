import { GlobePoint, FormattedGlobeStructure } from "@/@types/globe";

type Density = "single" | "low" | "medium" | "high";

export function formatGlobeData(data: FormattedGlobeStructure[], density: Density): FormattedGlobeStructure[] {
  if (!Array.isArray(data) || data.length === 0) throw new Error("O array de dados está vazio.");

  const clusterSizes = { single: 1, low: 16, medium: 32, high: 64 };
  const numClusters = clusterSizes[density] || 1;

  return data.map((item) => {
    const newOilsByDensity: Record<string, GlobePoint[]> = {};

    if (density === "single") {
      // Juntar todos os pontos
      const allOilPoints = Object.values(item.oilsByDensity ?? {}).flat();
      if (!allOilPoints.length) return item;

      // Ponto de densidade mais alta
      const highestDensityPoint = allOilPoints.reduce((prev, curr) =>
        (curr.density ?? 0) > (prev.density ?? 0) ? curr : prev
      );

      return {
        ...item,
        oilsByDensity: {
          cluster: [highestDensityPoint],
        },
      };
    }

    // Clustering por densidade
    for (const [densityKey, points] of Object.entries(item.oilsByDensity ?? {})) {
      if (!Array.isArray(points) || points.length === 0) continue;

      const clustered =
        points.length <= numClusters ? points : kMeansClustering(points, numClusters);

      newOilsByDensity[densityKey] = clustered;
    }

    return {
      ...item,
      oilsByDensity: newOilsByDensity,
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