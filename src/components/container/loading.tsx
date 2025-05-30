'use client'
import { Skeleton } from '@/components/ui-custom/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui-custom/table'

const ContainerLoading = ({ size = 10 }: { size?: number }) => (
  <>
    <div className='flex items-center gap-2 h-12 p-2 border-b'>
      <Skeleton className='h-8 flex-1' />
      <Skeleton className='h-8 w-24' />
      <Skeleton className='h-8 w-8' />
      <Skeleton className='h-8 w-8' />
    </div>

    <div className='h-[28.5rem] w-full'>
      <Table className='border-b border-border/50' divClassName='h-[28.5rem] overflow-y-auto w-full'>
        <TableHeader className='sticky h-10 top-0 z-20 bg-background'>
          <TableRow className='relative hover:bg-transparent !border-none border-border/50'>
            <TableHead className='p-0 h-10' aria-label='Search Engine Link' />
            {[...Array(8)].map((_, i) => (
              <TableHead key={i} className='!h-10 p-0'>
                <Skeleton className='m-2 h-5 min-w-16' />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className='[&>tr:last-child]:border-b-1'>
          {[...Array(size)].map((_, i) => (
            <TableRow key={i} className='border-border/50 !h-10 relative'>
              <TableCell className='p-0 !h-10 absolute inset-0' />
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
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-8 w-8' />
          ))}
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
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='flex-1 w-full' />
            ))}
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
)

export default ContainerLoading
