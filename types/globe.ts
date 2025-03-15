// eslint-disable-entire-file @typescript-eslint/no-explicit-any
export interface GlobePoint {
  properties: {
    latitude: number
    longitude: number
    name: string
    weight: number
    [key: string]: any;
  }
  [key: string]: any;
}