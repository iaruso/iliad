/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, ReactNode } from 'react';
import Chart from './chart';
import {
  ArrowDown,
  EqualApproximately,
  ArrowUp,
  Info
} from 'lucide-react';

interface StatsCardProps {
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
}

const StatsCard: FC<StatsCardProps> = ({
  label,
  detail,
  tooltip,
  data,
  min,
  tooltipMin,
  max,
  tooltipMax,
  avg,
  tooltipAvg
}) => {
  return (
    <div className='flex flex-col w-full border border-border/50 rounded-md overflow-hidden relative h-[8rem] bg-accent/10'>
      <div className='flex flex-col absolute top-0 p-2 w-full'>
        <span className='text-xs text-foreground'>{label}</span>
        <span className='text-[0.7rem] text-muted-foreground -mt-0.5'>{detail}</span>
      </div>
      <div className='flex w-full h-24 pointer-events-none'>
        { data ? (
          <Chart data={data} min={min} max={max} avg={avg}/>
        ) : (
          <></>
        )}
      </div>
      <div className='border-t border-border/50 w-full grid grid-cols-3 h-8'>
        <div className='border-r border-border/50 p-0.5 text-xs flex items-center gap-0.5 justify-center text-muted-foreground'>
          <ArrowDown className='!size-3' strokeWidth={2}/>
          <span className='truncate'>{min}</span>
        </div>
        <div className='border-r border-border/50 p-0.5 text-xs flex items-center gap-0.5 justify-center text-foreground font-semibold'>
          <EqualApproximately className='!size-3' strokeWidth={2.5}/>
          <span className='truncate'>{avg}</span>
        </div>
        <div className='p-0.5 text-xs flex items-center gap-0.5 justify-center text-muted-foreground'>
          <ArrowUp className='!size-3' strokeWidth={2}/>
          <span className='truncate'>{max}</span>
        </div>
      </div>
    </div>
  )
}

export default StatsCard