import * as d3 from 'd3';

const colorScale = d3
  .scaleLinear<string>()
  .domain([0, 0.3, 0.6, 1])
  .range(['rgba(255,0,0,0)', '#113c6d', '#6b2d5c', '#f2b705'])
  .interpolate(d3.interpolateCubehelix.gamma(2.0));

export const getColor = (value: number): string => {
  const clampedValue = Math.max(0, Math.min(1, value));
  return colorScale(clampedValue);
};