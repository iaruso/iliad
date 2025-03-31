// eslint-disable-entire-file @typescript-eslint/no-explicit-any
export interface GlobePoint {
  properties: {
    latitude: number
    longitude: number
    density: number
    type?: string
    [key: string]: any;
  }
  [key: string]: any;
}