'use client'

import {
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  CircleDotDashed,
  BookOpenText,
  ListFilter
} from 'lucide-react'
import { PAGE_SIZE } from '@/lib/constants'
import { Button } from '@/components/ui-custom/button'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import DropdownTooltip from '@/components/ui-custom/dropdown-tooltip'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui-custom/tooltip'
import { useTranslations } from 'next-intl'
import type { Table } from '@tanstack/react-table'

interface Props<TData> {
  className?: string
  table: Table<TData>
  onPaginationChange: (pageIndex: number, pageSize: number) => void
  items: number
}

export default function DataTablePagination<TData>({
  className,
  table,
  onPaginationChange,
  items
}: Props<TData>) {
  const t = useTranslations('pagination')

  const handlePageChange = (pageIndex: number) => {
    table.setPageIndex(pageIndex)
    onPaginationChange(pageIndex, table.getState().pagination.pageSize)
  }

  const handlePageSizeChange = (pageSize: number) => {
    table.setPageSize(pageSize)
    table.setPageIndex(0)
    onPaginationChange(0, pageSize)
  }

  return (
    <div className={`p-2 flex items-center justify-end h-12 border-t ${className}`}>
      <div className='flex items-center gap-2 justify-end w-full'>
        <div className='flex items-center gap-2 mr-auto'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className='focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-md'>
                <div className='flex items-center gap-1 px-2 rounded-md border h-8 user-select-none cursor-default'>
                  <BookOpenText className='size-4' strokeWidth={2} />
                  <p className='text-xs font-medium'>{table.getState().pagination.pageIndex + 1}/{table.getPageCount()}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-xs font-medium'>
                  {t('pageOf', {
                    page: `${table.getState().pagination.pageIndex + 1}`,
                    total: `${table.getPageCount()}`
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className='focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-md'>
                <div className='flex items-center gap-1 px-2 rounded-md border h-8 user-select-none cursor-default'>
                  <CircleDotDashed className='size-4' strokeWidth={2} />
                  <p className='text-xs font-medium'>{Math.min(table.getState().pagination.pageSize, items)}/{items}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-xs font-medium'>
                  {t('itemsOutOf', {
                    items: `${table.getState().pagination.pageSize > items ? items : table.getState().pagination.pageSize}`,
                    total: `${items}`
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <DropdownTooltip
          button={
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-fit gap-0.5 pl-2 pr-[calc(0.5rem-3px)] [&>svg]:h-4 [&>svg]:w-4'
            >
              <ListFilter strokeWidth={2} className='mr-0.5' />
              <span className='text-xs font-medium'>{table.getState().pagination.pageSize}</span>
              <ChevronDown className='h-4 w-4' strokeWidth={2} />
            </Button>
          }
          tooltip={t('itemsPerPage', { items: `${table.getState().pagination.pageSize}` })}
          className='min-w-0 w-[calc(var(--radix-popper-anchor-width)-1px)]'
          content={
            <>
              {PAGE_SIZE.map((pageSize) => (
                <Button
                  key={pageSize}
                  variant='ghost'
                  className='w-full justify-start text-xs font-medium px-2 !h-8'
                  onClick={() => handlePageSizeChange(pageSize)}
                >
                  {pageSize}
                </Button>
              ))}
            </>
          }
        />
        <div className='flex items-center gap-2'>
          <ButtonTooltip
            button={
              <Button
                variant='outline'
                className='hidden h-8 w-8 p-0 lg:flex'
                onClick={() => handlePageChange(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label={t('goToFirst')}
              >
                <ChevronsLeft className='h-4 w-4' />
              </Button>
            }
            tooltip={t('goToFirst')}
          />
          <ButtonTooltip
            button={
              <Button
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
                aria-label={t('goToPrevious')}
              >
                <span className='sr-only'>{t('goToPrevious')}</span>
                <ChevronLeft className='h-4 w-4' />
              </Button>
            }
            tooltip={t('goToPrevious')}
          />
          <ButtonTooltip
            button={
              <Button
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
                disabled={!table.getCanNextPage()}
                aria-label={t('goToNext')}
              >
                <span className='sr-only'>{t('goToNext')}</span>
                <ChevronRight className='h-4 w-4' />
              </Button>
            }
            tooltip={t('goToNext')}
          />
          <ButtonTooltip
            button={
              <Button
                variant='outline'
                className='hidden h-8 w-8 p-0 lg:flex'
                onClick={() => handlePageChange(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                aria-label={t('goToLast')}
              >
                <ChevronsRight className='h-4 w-4' />
              </Button>
            }
            tooltip={t('goToLast')}
          />
        </div>
      </div>
    </div>
  )
}