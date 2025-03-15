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
      weight: totalWeight / cluster.length * 4e-4 // Ajusta o peso para a visualização
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



// Sun position calculation
// Solar position calculation
export const sunPositionAt = (dt: Date) => {
  const day = new Date(dt).setUTCHours(0, 0, 0, 0)
  const t = century(dt)
  const longitude = ((day - dt.getTime()) / 864e5) * 360 - 180
  return [longitude - equationOfTime(t) / 4, declination(t)]
}

// Solar calculation functions
function century(date: Date): number {
  return (date.getTime() / 86400000.0 + 2440587.5 - 2451545.0) / 36525.0
}

function declination(t: number): number {
  return 23.45 * Math.sin(2 * Math.PI * (t * 36525.0 + 0.375))
}

function equationOfTime(t: number): number {
  const epsilon = obliquityCorrection(t)
  const l0 = geomMeanLongSun(t)
  const e = eccentricityEarthOrbit(t)
  const m = geomMeanAnomalySun(t)

  let y = Math.tan(deg2rad(epsilon) / 2.0)
  y *= y

  const sin2l0 = Math.sin(2.0 * deg2rad(l0))
  const sinm = Math.sin(deg2rad(m))
  const cos2l0 = Math.cos(2.0 * deg2rad(l0))
  const sin4l0 = Math.sin(4.0 * deg2rad(l0))
  const sin2m = Math.sin(2.0 * deg2rad(m))

  const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m
  return rad2deg(Etime) * 4.0
}

function obliquityCorrection(t: number): number {
  const e0 = 23.439 - 0.00000036 * t
  return e0
}

function geomMeanLongSun(t: number): number {
  let L0 = 280.46646 + t * (36000.76983 + t * 0.0003032)
  while (L0 > 360.0) L0 -= 360.0
  while (L0 < 0.0) L0 += 360.0
  return L0
}

function eccentricityEarthOrbit(t: number): number {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
}

function geomMeanAnomalySun(t: number): number {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t)
}

function deg2rad(angleDeg: number): number {
  return (Math.PI * angleDeg) / 180.0
}

function rad2deg(angleRad: number): number {
  return (180.0 * angleRad) / Math.PI
}