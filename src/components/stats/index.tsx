'use client'

/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { FC, ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { formatMinutes } from '@/lib/formatters'
import { formatOilspillStats, type FormattedStats, formatSingleOilspillStats } from '@/lib/stats'
import StatsCard from './card'

interface StatsProps {
  className?: string
  data: {
    data?: any[]
    stats?: any[]
  }
  type: 'single' | 'multiple'
}

type CardConfig = {
  key: keyof FormattedStats
  label: string
  detail: ReactNode
  tooltip: string
  chartType: string
  chartValueType?: string
  formatValue?: (val: number) => number | string
  className?: string
}

const Stats: FC<StatsProps> = ({ className, data, type }) => {
  const t = useTranslations('globe.stats')
  const stats: FormattedStats =
    type === 'multiple' ? formatOilspillStats(data.data ?? []) : formatSingleOilspillStats(data.stats ?? [])

  const isSingle = type === 'single'
  const hasDurationFrequency = stats.duration && stats.frequency

  const cardConfigs: CardConfig[] = [
    {
      key: 'area',
      label: t('area.label'),
      detail: t.rich('area.detail', { sup: (chunks) => <sup>{chunks}</sup> }),
      tooltip: t('area.tooltip.info'),
      chartType: 'tree',
      className: isSingle ? 'w-full flex-1' : 'w-2/5',
    },
    {
      key: 'density',
      label: t('density.label'),
      detail: t.rich('density.detail', { sup: (chunks) => <sup>{chunks}</sup> }),
      tooltip: t('density.tooltip.info'),
      chartType: 'area',
    },
    {
      key: 'bearing',
      label: t('bearing.label'),
      detail: t('bearing.detail'),
      tooltip: t('bearing.tooltip.info'),
      chartType: 'radar',
    },
    {
      key: 'compaction',
      label: t('compaction.label'),
      detail: t('compaction.detail'),
      tooltip: t('compaction.tooltip.info'),
      chartType: 'circularity',
      formatValue: (val) => val * 100,
    },
    {
      key: 'perimeter',
      label: t('perimeter.label'),
      detail: t('perimeter.detail'),
      tooltip: t('perimeter.tooltip.info'),
      chartType: 'step',
      className: isSingle ? 'flex-1 h-0' : '',
    },
    {
      key: 'points',
      label: t('points.label'),
      detail: t('points.detail'),
      tooltip: t('points.tooltip.info'),
      chartType: 'dots',
      className: isSingle ? 'w-full flex-1' : 'h-full',
    },
    {
      key: 'dispersionRadius',
      label: t('dispersionRadius.label'),
      detail: t('dispersionRadius.detail'),
      tooltip: t('dispersionRadius.tooltip.info'),
      chartType: isSingle ? 'step' : 'banded',
      className: isSingle ? 'flex-1 h-0' : '',
    },
    {
      key: 'dispersionDistance',
      label: t('dispersionDistance.label'),
      detail: t('dispersionDistance.detail'),
      tooltip: t('dispersionDistance.tooltip.info'),
      chartType: isSingle ? 'step' : 'banded',
      className: isSingle ? 'flex-1 h-0' : '',
    },
  ]

  if (hasDurationFrequency) {
    cardConfigs.push(
      {
        key: 'duration',
        label: t('duration.label'),
        detail: t('duration.detail'),
        tooltip: t('duration.tooltip.info'),
        chartType: 'step',
        chartValueType: 'time',
        formatValue: formatMinutes,
      },
      {
        key: 'frequency',
        label: t('frequency.label'),
        detail: t('frequency.detail'),
        tooltip: t('frequency.tooltip.info'),
        chartType: 'step',
        chartValueType: 'time',
        formatValue: formatMinutes,
      },
    )
  }

  const renderCard = (config: CardConfig) => {
    const statData = stats[config.key]
    if (!statData) return null

    const formatVal = config.formatValue || ((val) => val)

    return (
      <StatsCard
        key={config.key}
        className={config.className}
        label={config.label}
        detail={config.detail}
        tooltip={config.tooltip}
        data={statData.data}
        min={statData.min || undefined}
        max={statData.max || undefined}
        avg={statData.average || undefined}
        tooltipMin={['density', 'bearing', 'compaction', 'points'].includes(config.key) ? undefined : (
          statData.min !== undefined
            ? t.rich(`${config.key}.tooltip.min`, {
                min: formatVal(statData.min),
                sup: (chunks) => <sup>{chunks}</sup>,
              })
            : undefined
        )}
        tooltipMax={['density', 'bearing', 'compaction', 'points'].includes(config.key) ? undefined : (
          statData.max !== undefined
            ? t.rich(`${config.key}.tooltip.max`, {
                max: formatVal(statData.max),
                sup: (chunks) => <sup>{chunks}</sup>,
              })
            : undefined
        )}
        tooltipAvg={t.rich(`${config.key}.tooltip.avg`, {
          avg: formatVal(statData.average),
          sup: (chunks) => <sup>{chunks}</sup>,
        })}
        chartType={config.chartType as 'area' | 'step' | 'banded' | 'radar' | 'tree' | 'circularity' | 'dots' | undefined}
        chartValueType={config.chartValueType as 'time' | undefined}
      />
    )
  }

  const getCard = (key: string) => cardConfigs.find((c) => c.key === key) as CardConfig
  const areaCard = renderCard(getCard('area'))
  const pointsCard = renderCard(getCard('points'))
  const densityCard = renderCard(getCard('density'))
  const bearingCard = renderCard(getCard('bearing'))
  const compactionCard = renderCard(getCard('compaction'))
  const perimeterCard = renderCard(getCard('perimeter'))
  const dispersionRadiusCard = renderCard(getCard('dispersionRadius'))
  const dispersionDistanceCard = renderCard(getCard('dispersionDistance'))
  const durationCard = hasDurationFrequency ? renderCard(getCard('duration')) : null
  const frequencyCard = hasDurationFrequency ? renderCard(getCard('frequency')) : null

  if (isSingle) {
    return (
      <div
        className={`p-2 border-t text-sm flex-1 h-0 gap-2 w-full min-h-96 overflow-auto flex flex-col ${className}`}
        data-joyride='data-stats'
      >
        <div className='flex gap-2 flex-1 h-0'>
          <div className='flex flex-col gap-2 w-2/5'>
            {areaCard}
            {pointsCard}
          </div>
          <div className='flex flex-col gap-2 flex-1'>
            <div className='max-h-24 grid grid-cols-3 gap-2'>
              {densityCard}
              {bearingCard}
              {compactionCard}
            </div>
            <div className='flex flex-col gap-2 flex-1 h-0'>
              {perimeterCard}
              {dispersionRadiusCard}
              {dispersionDistanceCard}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`p-2 border-t text-sm flex-1 h-0 gap-2 w-full min-h-96 overflow-auto flex flex-col ${className}`}
      data-joyride='data-stats'
    >
      <div className='flex gap-2 flex-1 h-0'>
        {areaCard}
        <div className='flex flex-col gap-2 flex-1'>
          <div className='max-h-24 grid grid-cols-3 gap-2'>
            {densityCard}
            {bearingCard}
            {compactionCard}
          </div>
          {hasDurationFrequency && (
            <div className='flex-1 h-0 grid grid-cols-2 gap-2'>
              {durationCard}
              {frequencyCard}
            </div>
          )}
        </div>
      </div>
      <div className='grid gap-2 grid-rows-2 flex-1 h-0'>
        <div className='flex-1 grid gap-2 grid-cols-2'>
          {perimeterCard}
          {pointsCard}
        </div>
        <div className='flex-1 grid grid-cols-2 gap-2'>
          {dispersionRadiusCard}
          {dispersionDistanceCard}
        </div>
      </div>
    </div>
  )
}

export default Stats
