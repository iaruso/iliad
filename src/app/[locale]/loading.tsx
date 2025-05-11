import { Skeleton } from '@/components/ui-custom/skeleton'

export default function Loading() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-4 w-1/2' />
    </div>
  )
}