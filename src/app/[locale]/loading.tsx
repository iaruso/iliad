import { FC } from 'react'
import { Skeleton } from '@/components/ui-custom/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui-custom/table'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui-custom/resizable'
import { validateAndSetParams } from '@/lib/pagination'

type SearchParams = Promise<{
  page?: string;
  size?: string;
  oilspill?: string;
}>;

interface LoadingProps {
  searchParams: SearchParams;
}

const Loading: FC<LoadingProps> = async({ searchParams }) => {
  const params = (await searchParams) || {};
  const { page, size, oilspill } = params;
  const { validSize: SIZE } = validateAndSetParams(page, size);
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
        <ResizablePanel maxSize={32} minSize={28} defaultSize={28}>
          <div className='flex flex-col h-full'>
            <>
              {oilspill ? (
                <div className='flex-1 flex flex-col gap-2 w-full min-h-96 overflow-auto'>
                  <Skeleton className='h-24' />
                  <Skeleton className='h-24' />
                  <Skeleton className='h-24' />
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-2 h-12 p-2 border-b'>
                    <Skeleton className='h-8 flex-1' />
                    <Skeleton className='h-8 w-24' />
                    <Skeleton className='h-8 w-8' />
                    <Skeleton className='h-8 w-8' />
                  </div>
                  <div className='h-[calc(440px+1rem)] w-full'>
                    <Table className='border-b border-border/50' divClassName='h-[calc(440px+1rem)] overflow-y-auto w-full'>
                      <TableHeader className='sticky h-10 top-0 z-20 bg-background'>
                        <TableRow
                          className='relative hover:bg-transparent !border-none border-border/50'
                        >
                          <TableHead  
                            className='p-0 h-10'
                            key={'link-head'}
                            aria-label='Search Engine Link'
                          />
                          {[...Array(8)].map((_, i) => (
                            <TableHead
                              key={i}
                              className={`!h-10 p-0`}
                            >
                              <Skeleton className='m-2 h-5 min-w-16' />
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody className={`[&>tr:last-child]:border-b-1`}>
                        {[...Array(SIZE || 10)].map((_, i) => (
                          <TableRow
                            key={i}
                            className={`border-border/50 !h-10 relative`}
                          >
                            <TableCell key={`linkCell${i}`} className='p-0 !h-10 absolute inset-0'/>
                            {[...Array(8)].map((_, j) => (
                              <TableCell key={j} className='p-0'>
                                <Skeleton className='m-2 h-5 min-w-16' />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className='p-2 flex items-center justify-end h-12 border-t'>
                    <div className='flex items-center gap-2 justify-end w-full'>
                      <div className='flex items-center gap-2 mr-auto'>
                        <Skeleton className='h-8 w-13' />
                        <Skeleton className='h-8 w-16' />
                      </div>
                      <Skeleton className='h-8 w-17' />
                      <div className='flex items-center gap-2'>
                        <Skeleton className='h-8 w-8' />
                        <Skeleton className='h-8 w-8' />
                        <Skeleton className='h-8 w-8' />
                        <Skeleton className='h-8 w-8' />
                      </div>
                    </div>
                  </div>
                  <div className='p-2 border-t text-sm flex-1 h-0 gap-2 w-full min-h-96 overflow-auto flex flex-col'>
                    <div className='flex gap-2 flex-1 h-0'>
                      <div className='flex flex-col border border-border/80 rounded-md relative bg-accent/10 overflow-hidden w-2/5'>
                        <Skeleton className='flex-1 w-full' />
                      </div>
                      <div className='flex flex-col gap-2 flex-1'>
                        <div className='flex-1 max-h-24 grid grid-cols-3 gap-2'>
                          <Skeleton className='flex-1 w-full' />
                          <Skeleton className='flex-1 w-full' />
                          <Skeleton className='flex-1 w-full' />
                        </div>
                        <div className='flex-1 h-0 grid grid-cols-2 gap-2'>
                          <Skeleton className='flex-1 w-full' />
                          <Skeleton className='flex-1 w-full' />
                        </div>
                      </div>
                    </div>
                    <div className='grid gap-2 grid-rows-2 flex-1 h-0'>
                      <div className='flex-1 grid gap-2 grid-cols-2'>
                        <Skeleton className='flex-1 w-full' />
                        <Skeleton className='flex-1 w-full' />
                      </div>
                      <div className='flex-1 grid grid-cols-2 gap-2'>
                        <Skeleton className='flex-1 w-full' />
                        <Skeleton className='flex-1 w-full' />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
            <div className='border-t h-12 flex items-center py-2 pr-2 pl-4 justify-between gap-2'>
              <div className='flex items-start gap-2'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-7' />
              </div>
              <div className='flex items-center gap-1.5'>
                <Skeleton className='h-6 w-6' />
                <Skeleton className='h-6 w-6' />
                <Skeleton className='h-6 w-6' />
                <Skeleton className='h-6 w-6' />
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default Loading