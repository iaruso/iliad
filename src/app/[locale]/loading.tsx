import { Skeleton } from '@/components/ui-custom/skeleton'

export default function Loading() {
  return (
    <div className='flex flex-col p-2 w-full h-full'>
      <Skeleton className='w-full h-full' />
    </div>
  )
}