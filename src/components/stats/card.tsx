import { FC, ReactNode } from 'react';
import {
  ArrowDown,
  EqualApproximately,
  ArrowUp,
  CircleDot,
  CircleDashed,
  Grip
} from 'lucide-react';
import { TooltipWrapper } from '@/components/ui-custom/tooltip-wrapper'
import ChartRadar from './chart-radar';
import ChartArea from './chart-area';
import ChartTree from './chart-tree';
import ChartStep from './chart-step';
import { cn } from '@/lib/utils';
import ChartCircularity from './chart-circularity';
import ChartDots from './chart-dots';
import ChartBanded from './chart-banded';
interface StatsCardProps {
  className?: string;
  label: string;
  detail: string | ReactNode;
  tooltip: string;
  data: number[] | { value: [number, number, number] }[] | undefined;
  min: number;
  tooltipMin: string;
  max: number;
  tooltipMax: string;
  avg: number;
  tooltipAvg: string;
  chartType?: 'radar' | 'area' | 'tree' | 'circularity' | 'step' | 'dots' | 'banded';
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
  chartType
}) => {
  const radarMedian =
  chartType === 'radar' && Array.isArray(data) && data.length > 0
    ? (() => {
        const sorted = [...(data as number[])].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      })()
    : 0;

  return (
    <div className={cn(`flex flex-col border border-border/80 rounded-md relative bg-accent/10 overflow-hidden`, className)}>
      <div className='flex flex-col absolute top-0 p-2 w-full pointer-events-none select-none z-[1]'>
        <span className='text-xs text-foreground font-medium'>{label}</span>
        <span className='text-[10px] text-muted-foreground -mt-0.5'>{detail}</span>
      </div>
      <div className='flex w-full flex-1 justify-center items-center h-full'>
        {data ? (
          <TooltipWrapper
            trigger={
              (() => {
                switch (chartType) {
                  case 'radar':
                    return <ChartRadar data={data as number[]} median={radarMedian} />;
                  case 'tree':
                    return <ChartTree data={data as number[]} />;
                  case 'circularity':
                    return <ChartCircularity min={min} max={max} avg={avg} />;
                  case 'step':
                    return <ChartStep data={data as number[]} min={min} max={max} avg={avg} />;
                  case 'dots':
                    return <ChartDots min={min} avg={avg} max={max} />;
                  case 'banded':
                    return <ChartBanded data={data as { value: [number, number, number] }[]} />;
                  case 'area':
                  default:
                    return <ChartArea min={min} avg={avg} max={max} />;
                }
              })()
            }
            triggerClassName='flex w-full h-full rounded-md'
            content={
              <p className='text-xs w-full'>
                {tooltip}
              </p>
            }
          />
        ) : (
          <span className='text-[10px] mt-8 text-muted-foreground'>No data</span>
        )}
      </div>
      { chartType === 'tree' || chartType === 'step' || chartType === 'banded' ? (
        <div className='absolute bottom-0 right-0 w-fit grid grid-cols-3 gap-1 h-8 p-1'>
          <div className='border border-border/80 rounded-md flex bg-background'>
            <TooltipWrapper
              trigger={
                <>
                  <ArrowDown className='!size-3' strokeWidth={2}/>
                  <span className='truncate pt-[1px]'>{min}</span>
                </>
              }
              triggerClassName='p-0.5 px-1 text-[10px] flex items-center gap-0.5 justify-center text-muted-foreground w-full h-full'
              content={
                <p className='text-xs w-full'>
                  {tooltipMin}
                </p>
              }
            />
          </div>
          <div className='border border-border/80 rounded-md flex bg-background'>
            <TooltipWrapper
              trigger={
                <>
                  <EqualApproximately className='!size-3' strokeWidth={2}/>
                  <span className='truncate pt-[1px]'>{avg}</span>
                </>
              }
              triggerClassName='p-0.5 px-1 text-[10px] flex items-center gap-0.5 justify-center text-foreground font-medium w-full h-full'
              content={
                <p className='text-xs w-full'>
                  {tooltipAvg}
                </p>
              }
            />
          </div>
          <div className='border border-border/80 rounded-md flex bg-background'>
            <TooltipWrapper
              trigger={
                <div className='flex items-center gap-0.5'>
                  <ArrowUp className='!size-3' strokeWidth={2}/>
                  <span className='truncate pt-[1px]'>{max}</span>
                </div>
              }
              triggerClassName='p-0.5 px-1 text-[10px] flex items-center gap-0.5 justify-center text-muted-foreground w-full h-full'
              content={
                <p className='text-xs w-full'>
                  {tooltipMax}
                </p>
              }
            />
          </div>
        </div>
      ) : (
        <div className='absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-background border h-6'>
          <TooltipWrapper
            trigger={
              <div className='flex items-center gap-0.5'>
                { chartType === 'radar' ? (
                  <ArrowUp className={`!size-3`} strokeWidth={2} style={{ transform: `rotate(${radarMedian.toFixed(0)}deg)` }}/>
                ) : chartType === 'circularity' ? (
                  <CircleDashed className='!size-3' strokeWidth={2}/>
                ) : chartType === 'dots' ? (
                  <Grip className='!size-3' strokeWidth={2}/>
                ) : (
                  <CircleDot className='!size-3' strokeWidth={2}/>
                )}
                <span className='truncate pt-[1px]'>{chartType === 'radar' ? `${radarMedian.toFixed(2)}º` : avg}</span>
              </div>
            }
            triggerClassName='p-0.5 px-1 text-[10px] flex items-center gap-0.5 justify-center text-foreground font-medium w-full h-full rounded-md'
            content={
              <p className='text-xs w-full'>
                {tooltipAvg}{chartType === 'radar' ? 'º' : ''}
              </p>
            }
          />
        </div>
      )}
    </div>
  )
}

export default StatsCard