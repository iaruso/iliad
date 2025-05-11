export type StatValue = {
  min: number
  max: number
  average: number
  minAbs?: number
  maxAbs?: number
  data?: number[] // ordenado
}

export type FormattedStats = {
  area: StatValue
  duration: StatValue
  frequency: StatValue
  points: StatValue
  density: StatValue
  perimeter: StatValue
  compaction: StatValue
  dispersionRadius: StatValue
  dispersionDistance: StatValue
  bearing: StatValue
}

type RawStat = {
  min: number
  max: number
  average: number
}

type OilspillMinEntry = {
  area: number
  duration: number
  frequency: number
  points: number
  stats: Record<string, RawStat>
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

// 🍯 Arredonda com 2 casas, mas devolve number
function roundSmart(n: number): number {
  const rounded = +n.toFixed(2)
  return Number.isInteger(rounded) ? Math.round(rounded) : rounded
}

export function formatOilspillStats(data: OilspillMinEntry[]): FormattedStats {
  const getSimpleField = (key: keyof OilspillMinEntry): StatValue => {
    const values = data.map(d => d[key]).filter((v): v is number => typeof v === 'number')
    const sorted = [...values].sort((a, b) => a - b).map(roundSmart)

    return {
      min: roundSmart(Math.min(...values)),
      max: roundSmart(Math.max(...values)),
      average: roundSmart(avg(values)),
      data: sorted
    }
  }

  const getStatsWithAbs = (key: keyof OilspillMinEntry['stats']): StatValue => {
    const all = data.map(d => d.stats[key])
    const mins = all.map(s => s.min)
    const maxs = all.map(s => s.max)
    const avgs = all.map(s => s.average)
    const merged = [...mins, ...maxs, ...avgs].filter(v => typeof v === 'number')
    const sorted = [...merged].sort((a, b) => a - b).map(roundSmart)

    return {
      min: roundSmart(Math.min(...mins)),
      max: roundSmart(Math.max(...maxs)),
      average: roundSmart(avg(avgs)),
      minAbs: roundSmart(Math.min(...merged)),
      maxAbs: roundSmart(Math.max(...merged)),
      data: sorted
    }
  }

  return {
    area: getSimpleField('area'),
    duration: getSimpleField('duration'),
    frequency: getSimpleField('frequency'),
    points: getSimpleField('points'),
    density: getStatsWithAbs('density'),
    perimeter: getStatsWithAbs('perimeter'),
    compaction: getStatsWithAbs('compaction'),
    dispersionRadius: getStatsWithAbs('dispersionRadius'),
    dispersionDistance: getStatsWithAbs('dispersionDistance'),
    bearing: getStatsWithAbs('bearing')
  }
}
