export interface GlobeLocation {
  _id?: string;
  area?: number;
  latitude: number;
  longitude: number;
}

export interface GlobePoint {
  _id?: string
  latitude: number
  longitude: number
  density: number
  color?: string
  type?: string
}

export interface FormattedGlobeStructure {
  _id: string;
  objects: GlobePoint[];
  oilsByDensity: {
    [density: string]: GlobePoint[];
  };
}