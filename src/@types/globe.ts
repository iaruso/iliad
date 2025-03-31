// eslint-disable-entire-file @typescript-eslint/no-explicit-any
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