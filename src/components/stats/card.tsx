import { FC, ReactNode } from 'react';
import {
  ArrowDown,
  EqualApproximately,
  ArrowUp,
  CircleDot,
  Hexagon,
  Grip
} from 'lucide-react';
import { TooltipWrapper } from '@/components/ui-custom/tooltip-wrapper';
import ChartRadar from './chart-radar';
import ChartArea from './chart-area';
import ChartTree from './chart-tree';
import ChartStep from './chart-step';
import { cn } from '@/lib/utils';
import ChartCircularity from './chart-circularity';
import ChartDots from './chart-dots';
import ChartBanded from './chart-banded';
import { formatMinutes } from '@/lib/formatters';

interface StatsCardProps {
  className?: string;
  label: string;
  detail: string | ReactNode;
  tooltip: string;
  data?: number[] | { value: [number, number, number] }[] | undefined;
  min?: number;
  tooltipMin?: string | ReactNode;
  max?: number;
  tooltipMax?: string | ReactNode;
  avg?: number;
  tooltipAvg?: string | ReactNode;
  chartType?: 'radar' | 'area' | 'tree' | 'circularity' | 'step' | 'dots' | 'banded';
  chartValueType?: 'time';
}

const chartComponents = {
  radar: (data: any) => <ChartRadar data={data as number[]} median={getMedian(data as number[])} />,
  tree: (data: any) => <ChartTree data={data as number[]} />,
  circularity: (_: any, min: number, max: number, avg: number) => <ChartCircularity min={min} max={max} avg={avg} />,
  step: (data: any, min: number, max: number, avg: number) => <ChartStep data={data as number[]} min={min} max={max} avg={avg} />,
  dots: (_: any, min: number, max: number, avg: number) => <ChartDots min={min} avg={avg} max={max} />,
  banded: (data: any) => <ChartBanded data={data as { value: [number, number, number] }[]} />,
  area: (_: any, min: number, max: number, avg: number) => <ChartArea min={min} avg={avg} max={max} />
};

function getMedian(data: number[]) {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

const StatsCard: FC<StatsCardProps> = ({
  className,
  label,
  detail,
  tooltip,
  data,
  min,
  tooltipMin,
  max,
  tooltipMax,
  avg,
  tooltipAvg,
  chartType = 'area',
  chartValueType
}) => {
  const radarMedian = chartType === 'radar' ? getMedian(data as number[]) : 0;
  const showStatsRow = ['tree', 'step', 'banded'].includes(chartType);

  const renderChart = () => {
    const Chart = chartComponents[chartType] || chartComponents.area;
    return Chart(data, min ?? 0, max ?? 0, avg ?? 0);
  };

  const renderStatsRow = () => (
    <div className='absolute bottom-0 right-0 w-fit grid grid-cols-3 gap-1 h-8 p-1'>
      {[
        { Icon: ArrowDown, value: min, tooltip: tooltipMin, className: 'text-muted-foreground' },
        { Icon: EqualApproximately, value: avg, tooltip: tooltipAvg, className: 'text-foreground font-medium' },
        { Icon: ArrowUp, value: max, tooltip: tooltipMax, className: 'text-muted-foreground' }
      ].map(({ Icon, value, tooltip, className }, i) => (
        <div key={i} className='border border-border/80 rounded-md flex bg-background'>
          <TooltipWrapper
            trigger={
              <div className='flex items-center gap-1'>
                <Icon className='!size-2.5' strokeWidth={2} />
                <span className='truncate pt-[1px]'>
                  {chartValueType === 'time' ? formatMinutes(value ?? 0, false) : value}
                </span>
              </div>
            }
            triggerClassName={`p-0.5 px-1 text-[10px] flex items-center gap-1 justify-center ${className} w-full h-full`}
            content={<p className='text-xs w-full'>{tooltip}</p>}
          />
        </div>
      ))}
    </div>
  );

  const renderSingleStat = () => (
    <div className='absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-background border h-6'>
      <TooltipWrapper
        trigger={
          <div className='flex items-center gap-1'>
            {chartType === 'radar' ? (
              <ArrowUp className='!size-2.5' strokeWidth={2} style={{ transform: `rotate(${radarMedian.toFixed(0)}deg)` }} />
            ) : chartType === 'circularity' ? (
              <Hexagon className='!size-2.5' strokeWidth={2} />
            ) : chartType === 'dots' ? (
              <Grip className='!size-2.5' strokeWidth={2} />
            ) : (
              <CircleDot className='!size-2.5' strokeWidth={2} />
            )}
            <span className='truncate pt-[1px]'>
              {chartType === 'radar' ? `${radarMedian.toFixed(2)}` : avg}
            </span>
          </div>
        }
        triggerClassName='p-0.5 px-1 text-[10px] flex items-center gap-1 justify-center text-foreground font-medium w-full h-full rounded-md'
        content={<p className='text-xs w-full'>{tooltipAvg}</p>}
      />
    </div>
  );

  return (
    <div className={cn('flex flex-col border border-border/80 rounded-md relative bg-accent/10 overflow-hidden', className)}>
      <div className='flex flex-col absolute top-0 p-2 w-full pointer-events-none select-none z-[1]'>
        <span className='text-xs text-foreground font-medium'>{label}</span>
        <span className='text-[10px] text-muted-foreground -mt-0.5 line-clamp-1 truncate'>{detail}</span>
      </div>
      <div className='flex w-full flex-1 justify-center items-center h-full'>
        {data || min || max || avg ? (
          <TooltipWrapper
            trigger={renderChart()}
            triggerClassName='flex w-full h-full rounded-md'
            content={<p className='text-xs w-full'>{tooltip}</p>}
          />
        ) : (
          <span className='text-[10px] mt-8 text-muted-foreground'>No data</span>
        )}
      </div>
      {showStatsRow ? renderStatsRow() : renderSingleStat()}
    </div>
  );
};

export default StatsCard;
