import * as solar from 'solar-calculator';
import { Vector2 } from 'three';

export const sunPositionAt = (dt: Date): [number, number] => {
  const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
  const t = solar.century(dt);
  const longitude = (day - +dt) / 864e5 * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};

function getSolarDeclination(month: number): number {
  const days = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const dayOfYear = days[month] + 15;
  return 23.44 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
}

export function getSunPosition(date: Date): Vector2 {
  const sunLon = (date.getUTCHours() / 24) * 360 - 180;
  const sunLat = getSolarDeclination(date.getUTCMonth());
  return new Vector2(sunLon, sunLat);
}