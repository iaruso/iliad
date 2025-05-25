'use client'

import { useSearchParams } from 'next/navigation'
import DetailsLoading from '@/components/details/loading'
import ContainerLoading from '@/components/container/loading'
import { Skeleton } from '@/components/ui-custom/skeleton'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui-custom/resizable'

export default function Loading() {
  const searchParams = useSearchParams()
  const hasOilspill = !!searchParams.get('oilspill')

  return (
    <div className='flex flex-col w-full h-full'>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          id='content-panel'
          className='flex-1 flex flex-col overflow-hidden relative'
          defaultSize={72}
        >
          <div className='flex-1 w-full' />
          <div className='absolute top-2 right-2 flex flex-col gap-2 !w-8 z-10'>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className='h-8 w-8' />
            ))}
          </div>
          <div className='w-full h-12 border-t bg-background'>
            <div className='flex items-center p-2 h-12 gap-2'>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className='h-8 w-8' />
              ))}
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-8 flex-1' />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className='pointer-events-none cursor-default' />
        <ResizablePanel maxSize={32} minSize={28} defaultSize={28} className='min-w-[420px]'>
          <div className='flex flex-col h-full'>
            {hasOilspill ? <DetailsLoading /> : <ContainerLoading />}
            <div className='border-t h-12 flex items-center py-2 px-2 justify-between gap-2'>
              <div className='flex items-start gap-2'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-7' />
              </div>
              <div className='flex items-center gap-1.5'>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className='h-6 w-6' />
                ))}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
