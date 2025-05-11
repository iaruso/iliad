export type OilSpillStats = {
  timestamp?: string;
  area: number;
  points: number;
  density: number;
  compaction: number;
  dispersionRadius: number;
  dispersionDistance: number;
  bearing: number;
}

export type OilSpill = {
  _id: string;
  coordinates?: [number, number][];
  area?: number;
  points?: number;
  data: OilSpillData;
  stats: OilSpillStats[] | OilSpillStats;
  single?: boolean;
  duration: number;
  frequency: number;
}

export type OilSpillData = {
  timestamp: string;
  actors: Actor[];
}

export type Actor = {
  name?: string;
  density: number;
  color: string;
  type: ActorType;
  url?: string;
  scale: number;
  geometry: ActorGeometry;
}

export type ActorType = 'Object' | 'Oil';

export type ActorGeometry = {
  type: 'Point' | 'Polygon';
  coordinates: ActorCoordinates[];
}

export type ActorCoordinates = [number, number] | [number, number, number];

export type OilSpills = {
  page?: number;
  size?: number;
  items?: number;
  totalPages?: number;
  single?: boolean;
  data: OilSpill[];
}