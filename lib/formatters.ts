interface GlobePoint {
  properties: {
    latitude: number;
    longitude: number;
    name: string;
    weight: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

type Density = "single" | "low" | "medium" | "high";

export function formatGlobeData(data: GlobePoint[], density: Density): GlobePoint[] {
  if (data.length === 0) {
    throw new Error("O array de dados está vazio.");
  }

  // Define o número de clusters baseado na densidade
  const clusterSizes = { single: 1, low: 16, medium: 32, high: 64 };
  const numClusters = clusterSizes[density];

  // Se já temos poucos pontos, retorna todos
  if (data.length <= numClusters) {
    return data;
  }

  // K-Means para agrupar os pontos próximos
  const clusters = kMeansClustering(data, numClusters);

  return clusters;
}

// Função para agrupar pontos próximos usando K-Means
function kMeansClustering(data: GlobePoint[], k: number): GlobePoint[] {
  const centroids = data.slice(0, k).map(p => ({ ...p })); // Escolhe os primeiros K pontos como centróides iniciais
  let clusters: GlobePoint[][] = Array.from({ length: k }, () => []);

  let hasChanged = true;

  while (hasChanged) {
    clusters = Array.from({ length: k }, () => []);

    // Atribui cada ponto ao cluster mais próximo
    for (const point of data) {
      let closestIndex = 0;
      let minDist = Infinity;

      centroids.forEach((centroid, index) => {
        const dist = haversineDistance(point.properties, centroid.properties);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = index;
        }
      });

      clusters[closestIndex].push(point);
    }

    // Recalcula os centróides
    hasChanged = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;

      const newCentroid = calculateClusterCenter(clusters[i]);
      if (
        newCentroid.properties.latitude !== centroids[i].properties.latitude ||
        newCentroid.properties.longitude !== centroids[i].properties.longitude
      ) {
        hasChanged = true;
      }
      centroids[i] = newCentroid;
    }
  }

  return centroids;
}

// Função para calcular o centro de um cluster
function calculateClusterCenter(cluster: GlobePoint[]): GlobePoint {
  let latSum = 0, lonSum = 0, totalWeight = 0;

  for (const point of cluster) {
    latSum += point.properties.latitude * point.properties.weight;
    lonSum += point.properties.longitude * point.properties.weight;
    totalWeight += point.properties.weight;
  }

  return {
    properties: {
      latitude: latSum / totalWeight,
      longitude: lonSum / totalWeight,
      name: "Cluster Center",
      weight: totalWeight / cluster.length * 4e-2 // Ajusta o peso para a visualização
    }
  };
}

// Função para calcular a distância entre dois pontos (Haversine)
function haversineDistance(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const aCalc = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c; // Distância em km
}