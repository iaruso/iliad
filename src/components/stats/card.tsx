import { FC } from 'react';
import Chart from './chart';

interface StatsCardProps {
  label: string;
  data: number[] | undefined;
  min: number;
  max: number;
  avg: number;
}

const StatsCard: FC<StatsCardProps> = ({
  label,
  data,
  min,
  max,
  avg
}) => {
  return (
    <div className='flex flex-col w-full border rounded-md overflow-hidden relative h-[8rem] bg-accent/10'>
      <span className='absolute left-2 top-2 text-sm text-foreground'>{label}</span>
      <div className='flex w-full h-24'>
        { data ? (
          <Chart data={data} min={min} max={max} avg={avg}/>
        ) : (
          <></>
        )}
      </div>
      <div className='border-t w-full grid grid-cols-3 h-8'>
        <span className='border-r p-1 text-xs flex items-center justify-center text-muted-foreground'>{min}</span>
        <span className='border-r p-1 text-xs  flex items-center justify-center text-foreground/70 font-medium'>{avg}</span>
        <span className='p-1 text-xs flex items-center justify-center text-foreground'>{max}</span>
      </div>
    </div>
  )
}

export default StatsCard