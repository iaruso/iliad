'use client'
import { Skeleton } from '@/components/ui-custom/skeleton'

const DetailsLoading = () => (
  <>
    <div className='flex items-center gap-2 h-12 p-2 border-b'>
      <Skeleton className='h-8 w-8' />
      <Skeleton className='h-8 w-26' />
      <Skeleton className='h-8 w-10 ml-auto' />
      <Skeleton className='h-8 w-12' />
      <Skeleton className='h-8 w-12' />
      <Skeleton className='h-8 w-30' />
    </div>
    <div className='flex flex-col flex-1 h-0 overflow-y-auto'>
      <div className='p-2 border-t text-sm flex-1 h-0 gap-2 w-full min-h-96 overflow-auto flex flex-col border-none'>
        <div className='flex gap-2 flex-1 h-0'>
          <div className='flex flex-col gap-2 w-2/5'>
            <Skeleton className='w-full flex-1'/>
            <Skeleton className='w-full flex-1'/>
          </div>
          <div className='flex flex-col gap-2 flex-1'>
            <div className='flex-1 max-h-24 grid grid-cols-3 gap-2'>
              <Skeleton className='flex-1 w-full'/>
              <Skeleton className='flex-1 w-full'/>
              <Skeleton className='flex-1 w-full'/>
            </div>
            <div className='flex flex-col gap-2 flex-1 h-0'>
              <Skeleton className='flex-1 w-full'/>
              <Skeleton className='flex-1 w-full'/>
              <Skeleton className='flex-1 w-full'/>
            </div>
          </div>
        </div>
      </div>
      <div className='flex-1 h-0 grid p-2 pt-0 gap-2 grid-rows-2'>
        <Skeleton className='flex-1 w-full'/>
        <Skeleton className='flex-1 w-full'/>
      </div>
    </div>
  </>
)

export default DetailsLoading
