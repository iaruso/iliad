export type StatValue = {
  min: number
  max: number
  average: number
  minAbs?: number
  maxAbs?: number
  data?: number[] | { value: [number, number, number] }[]
}

export type FormattedStats = {
  area: StatValue
  duration?: StatValue
  frequency?: StatValue
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

function roundSmart(n: number): number {
  const rounded = +n.toFixed(2)
  return Number.isInteger(rounded) ? Math.round(rounded) : rounded
}

function formatBandedPerEntryFromStats(
  statsArray: { min: number; average: number; max: number }[]
): { value: [number, number, number] }[] {
  return statsArray
    .map((s) => ({
      value: [
        roundSmart(s.min),
        roundSmart(s.average),
        roundSmart(s.max),
      ] as [number, number, number],
    }))
    .sort((a, b) => a.value[0] - b.value[0])
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

    const isBanded = key === 'dispersionRadius' || key === 'dispersionDistance'

    return {
      min: roundSmart(Math.min(...mins)),
      max: roundSmart(Math.max(...maxs)),
      average: roundSmart(avg(avgs)),
      minAbs: roundSmart(Math.min(...merged)),
      maxAbs: roundSmart(Math.max(...merged)),
      data: isBanded ? formatBandedPerEntryFromStats(all) : sorted,
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
    bearing: getStatsWithAbs('bearing'),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatSingleOilspillStats(stats: any[]): FormattedStats {
  const getFieldStats = (key: keyof FormattedStats): StatValue => {
    const values = stats.map(s => s[key]).filter((v): v is number => typeof v === 'number')

    return {
      min: roundSmart(Math.min(...values)),
      max: roundSmart(Math.max(...values)),
      average: roundSmart(avg(values)),
      data: values.map(roundSmart)
    }
  }

  return {
    area: getFieldStats('area'),
    points: getFieldStats('points'),
    density: getFieldStats('density'),
    perimeter: getFieldStats('perimeter'),
    compaction: getFieldStats('compaction'),
    dispersionRadius: getFieldStats('dispersionRadius'),
    dispersionDistance: getFieldStats('dispersionDistance'),
    bearing: getFieldStats('bearing'),
  }
}


export function formatRadarData(data: number[]) {
  const step = 15
  const numBuckets = 360 / step
  const counts = new Array(numBuckets).fill(0)

  data.forEach((value) => {
    let normalized = value % 360
    if (normalized < 0) normalized += 360
    const index = Math.floor(normalized / step)
    counts[index]++
  })

  const propagated = counts.map((value, index) => {
    if (value !== 0) return value
    const previousIndex = (index - 1 + numBuckets) % numBuckets
    return counts[previousIndex]
  })

  const max = Math.max(...counts)

  return propagated.map((value, i) => {
    const from = i * step
    const to = from + step
    return {
      subject: `Deg${from}_${to}`,
      A: value > 0 ? Math.max(value, 3) : value,
      B: 0,
      fullMark: max,
    }
  })
}