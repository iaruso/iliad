import * as d3 from 'd3';

const colorScale = d3
    .scaleLinear<string>()
    .domain([0, 0.5, 10])
    .range(['rgba(255,0,0,0)', 'rgba(255,0,0,0.7)', 'rgba(255,0,0,1)'])
    .interpolate(d3.interpolateCubehelix.gamma(1.5))

export const getColor = (value: number): string => {
  const clampedValue = Math.max(0, Math.min(1, value))
  return colorScale(clampedValue)
}