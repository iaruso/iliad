import { FC, ReactNode } from 'react';
import Chart from './chart';
import {
  ArrowDown,
  EqualApproximately,
  ArrowUp,
  CircleDot
} from 'lucide-react';
import { TooltipWrapper } from '@/components/ui-custom/tooltip-wrapper'
import ChartRadar from './chart-radar';
import ChartArea from './chart-area';
import { cn } from '@/lib/utils';
interface StatsCardProps {
  className?: string;
  label: string;
  detail: string | ReactNode;
  tooltip: string;
  data: number[] | undefined;
  min: number;
  tooltipMin: string;
  max: number;
  tooltipMax: string;
  avg: number;
  tooltipAvg: string;
  chartType?: 'chart' | 'radar' | 'area';
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
  chartType = 'chart'
}) => {
  return (
    <div className={cn(`flex flex-col border border-border/80 rounded-md relative bg-accent/10`, className)}>
      <div className='flex flex-col absolute top-0 p-2 w-full pointer-events-none select-none z-[1]'>
        <span className='text-xs text-foreground font-medium'>{label}</span>
        <span className='text-[10px] text-muted-foreground -mt-0.5'>{detail}</span>
      </div>
      <div className='flex w-full flex-1 justify-center items-center'>
        { data ? (
          <TooltipWrapper
            trigger={
              chartType === 'chart' ? (
                <Chart data={data} min={min} max={max} avg={avg}/>
              ) : chartType === 'radar' ? (
                <ChartRadar data={data} avg={avg}/>
              ) : (
                <ChartArea min={min} avg={avg} max={max}/>
              )
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
      {chartType === 'chart' ? (
        <div className='absolute bottom-0 left-0 right-0 w-full grid grid-cols-3 gap-1 h-8 p-1'>
          <div className='border border-border/80 rounded-md flex bg-background'>
            <TooltipWrapper
              trigger={
                <>
                  <ArrowDown className='!size-3' strokeWidth={2}/>
                  <span className='truncate'>{min}</span>
                </>
              }
              triggerClassName='p-0.5 text-[10px] flex items-center gap-0.5 justify-center text-muted-foreground w-full h-full'
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
                  <span className='truncate'>{avg}</span>
                </>
              }
              triggerClassName='p-0.5 text-[10px] flex items-center gap-0.5 justify-center text-foreground font-medium w-full h-full'
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
                  <span className='truncate'>{max}</span>
                </div>
              }
              triggerClassName='p-0.5 text-[10px] flex items-center gap-0.5 justify-center text-muted-foreground w-full h-full'
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
                  <ArrowUp className={`!size-3`} strokeWidth={2} style={{ transform: `rotate(${avg.toFixed(0)}deg)` }}/>
                ) : (
                  <CircleDot className='!size-3' strokeWidth={2}/>
                )}
                <span className='truncate'>{avg}{chartType === 'radar' ? 'º' : ''}</span>
              </div>
            }
            triggerClassName='p-0.5 text-[10px] flex items-center gap-0.5 justify-center text-foreground font-medium w-full h-full rounded-md'
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