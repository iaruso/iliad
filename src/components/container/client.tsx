'use client'
import { type FC, useCallback, useState, useContext, useMemo } from 'react'
import { GlobeContext, type GlobeContextProps } from '@/context/globe-context'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { OilSpills } from '@/@types/oilspills'
import { Settings2, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui-custom/input'
import { Button } from '@/components/ui-custom/button'
import { Skeleton } from '@/components/ui-custom/skeleton'
import { useSearchParams, useRouter } from 'next/navigation'
import Stats from '@/components/stats'
import type { AlignCellProps } from '@/@types/table'
import TablePagination from '@/components/table-pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui-custom/table'
import { usePagination } from '@/hooks/use-pagination'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import { Label } from '@/components/ui-custom/label'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import useOilSpillsTableColumns from '@/hooks/use-oilspills-table-columns'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui-custom/dropdown-menu'
import PopoverTooltip from '@/components/ui-custom/popover-tooltip'
import { useDebounceCallback } from 'usehooks-ts'
import AddDialogButton from '@/components/add'

interface ContainerProps {
  data: OilSpills
}

const orderableColumns = ['latitude', 'longitude', 'area', 'points', 'duration', 'frequency']

const Container: FC<ContainerProps> = ({ data }) => {
  const { date, groupedGlobeData } = useContext(GlobeContext) as GlobeContextProps

  const t = useTranslations('globe.search')
  const tTable = useTranslations('globe.table')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const router = useRouter()
  const searchParams = useSearchParams()

  const paramIdFilter = searchParams.get('id')?.toLowerCase() ?? ''
  const [idFilter, setIdFilter] = useState<string>(paramIdFilter)

  const paramAreaRange = searchParams.get('areaRange')
  const initialMinArea = paramAreaRange?.split('_')[0] || ''
  const initialMaxArea = paramAreaRange?.split('_')[1] || ''
  const [minArea, setMinArea] = useState<string>(initialMinArea)
  const [maxArea, setMaxArea] = useState<string>(initialMaxArea)
  const [areaRange, setAreaRange] = useState<string>(paramAreaRange ?? '')

  const paramDurationRange = searchParams.get('durationRange')
  const initialMinDuration = paramDurationRange?.split('_')[0] || ''
  const initialMaxDuration = paramDurationRange?.split('_')[1] || ''
  const [minDuration, setMinDuration] = useState<string>(initialMinDuration)
  const [maxDuration, setMaxDuration] = useState<string>(initialMaxDuration)
  const [durationRange, setDurationRange] = useState<string>(paramDurationRange ?? '')

  const paramFrequencyRange = searchParams.get('frequencyRange')
  const initialMinFrequency = paramFrequencyRange?.split('_')[0] || ''
  const initialMaxFrequency = paramFrequencyRange?.split('_')[1] || ''
  const [minFrequency, setMinFrequency] = useState<string>(initialMinFrequency)
  const [maxFrequency, setMaxFrequency] = useState<string>(initialMaxFrequency)
  const [frequencyRange, setFrequencyRange] = useState<string>(paramFrequencyRange ?? '')

  const paramStartDate = searchParams.get('startDate')
  const paramEndDate = searchParams.get('endDate')

  const activeFilters = useMemo(() => {
    let count = 0
    if (idFilter.trim().length >= 3) count++
    if (areaRange !== '') count++
    if (durationRange !== '') count++
    if (frequencyRange !== '') count++
    if (paramStartDate || paramEndDate) count++
    return count
  }, [idFilter, areaRange, durationRange, frequencyRange, paramStartDate, paramEndDate])

  const updateFilters = useCallback(
    (updates: {
      id?: string
      areaRange?: string
      durationRange?: string
      frequencyRange?: string
      field?: string
      direction?: string
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.id !== undefined) {
        if (updates.id.trim().length >= 3) {
          params.set('id', updates.id)
        } else {
          params.delete('id')
        }
      }

      if (updates.areaRange !== undefined) {
        if (updates.areaRange.trim() !== '') {
          params.set('areaRange', updates.areaRange)
        } else {
          params.delete('areaRange')
        }
      }

      if (updates.durationRange !== undefined) {
        if (updates.durationRange.trim() !== '') {
          params.set('durationRange', updates.durationRange)
        } else {
          params.delete('durationRange')
        }
      }

      if (updates.frequencyRange !== undefined) {
        if (updates.frequencyRange.trim() !== '') {
          params.set('frequencyRange', updates.frequencyRange)
        } else {
          params.delete('frequencyRange')
        }
      }

      if (updates.field !== undefined) {
        if (updates.field) {
          params.set('sortField', updates.field)
        } else {
          params.delete('sortField')
        }
      }

      if (updates.direction !== undefined) {
        if (updates.direction) {
          params.set('sortDirection', updates.direction)
        } else {
          params.delete('sortDirection')
        }
      }

      const newParamsString = params.toString()
      const currentParamsString = searchParams.toString()
      if (newParamsString !== currentParamsString) {
        router.replace(`?${newParamsString}`, { scroll: false })
      }
    },
    [searchParams, router],
  )

  const debouncedUpdateFilters = useDebounceCallback(updateFilters, 350)

  const handleIdFilterChange = useCallback(
    (value: string) => {
      setIdFilter(value)
      debouncedUpdateFilters({ id: value })
    },
    [debouncedUpdateFilters],
  )

  const handleMinAreaChange = useCallback(
    (value: string) => {
      setMinArea(value)
      const newRange = value + '_' + (maxArea || '')
      setAreaRange(newRange)
      debouncedUpdateFilters({ areaRange: newRange })
    },
    [maxArea, debouncedUpdateFilters],
  )

  const handleMaxAreaChange = useCallback(
    (value: string) => {
      setMaxArea(value)
      const newRange = (minArea || '') + '_' + value
      setAreaRange(newRange)
      debouncedUpdateFilters({ areaRange: newRange })
    },
    [minArea, debouncedUpdateFilters],
  )

  const handleMinDurationChange = useCallback(
    (value: string) => {
      setMinDuration(value)
      const newRange = value + '_' + (maxDuration || '')
      setDurationRange(newRange)
      debouncedUpdateFilters({ durationRange: newRange })
    },
    [maxDuration, debouncedUpdateFilters],
  )

  const handleMaxDurationChange = useCallback(
    (value: string) => {
      setMaxDuration(value)
      const newRange = (minDuration || '') + '_' + value
      setDurationRange(newRange)
      debouncedUpdateFilters({ durationRange: newRange })
    },
    [minDuration, debouncedUpdateFilters],
  )

  const handleMinFrequencyChange = useCallback(
    (value: string) => {
      setMinFrequency(value)
      const newRange = value + '_' + (maxFrequency || '')
      setFrequencyRange(newRange)
      debouncedUpdateFilters({ frequencyRange: newRange })
    },
    [maxFrequency, debouncedUpdateFilters],
  )

  const handleMaxFrequencyChange = useCallback(
    (value: string) => {
      setMaxFrequency(value)
      const newRange = (minFrequency || '') + '_' + value
      setFrequencyRange(newRange)
      debouncedUpdateFilters({ frequencyRange: newRange })
    },
    [minFrequency, debouncedUpdateFilters],
  )

  const handleOrderFilterChange = useCallback(
    (field: string, direction: string) => {
      updateFilters({ field, direction })
    },
    [updateFilters],
  )

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('id')
    params.delete('areaRange')
    params.delete('durationRange')
    params.delete('frequencyRange')
    params.delete('sortField')
    params.delete('sortDirection')
    params.delete('startDate')
    params.delete('endDate')

    setIdFilter('')
    setMinArea('')
    setMaxArea('')
    setAreaRange('')
    setMinDuration('')
    setMaxDuration('')
    setDurationRange('')
    setMinFrequency('')
    setMaxFrequency('')
    setFrequencyRange('')
    
    router.replace(`?${params.toString()}`, { scroll: false })
  // eslint-disable-line react-hooks/exhaustive-deps
  }, [router, searchParams])

  const { pagination, setPagination, handlePageTransition, isPending } = usePagination({
    totalPages: data.totalPages || 0,
  })

  const { oilSpillsColumns: columns } = useOilSpillsTableColumns(handleOrderFilterChange)

  const table = useReactTable({
    data: data.data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    manualPagination: true,
    pageCount: data.totalPages,
    rowCount: data.items,
  })

  return (
    <>
      <div className='flex items-center gap-2 h-12 p-2 border-b'>
        <Input
          id='search-id'
          placeholder={t('placeholder')}
          value={idFilter}
          onChange={(e) => handleIdFilterChange(e.target.value)}
          className='flex-1 h-8 px-2'
        />
        <div className='flex' data-joyride='data-filters'>
          <PopoverTooltip
            button={
              <Button
                variant='outline'
                className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1.5 group'
                aria-label={t('filters.tooltip')}
              >
                <Settings2 className='h-4 w-4' />
                {t('filters.label')}
                <span className='text-[9.5px] font-semibold rounded-sm h-4.5 w-4.5 border flex items-center justify-center bg-muted/50 group-hover:bg-background'>
                  {activeFilters}
                </span>
              </Button>
            }
            tooltip={t('filters.tooltip')}
            content={
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4 justify-between'>
                  <Label className='text-sm font-medium'>
                    {t.rich('filters.options.areaRange.label', {
                      sup: (chunks) => <sup>{chunks}</sup>,
                    })}
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      className='input-number h-8 px-2 w-12'
                      placeholder={t('filters.options.min')}
                      value={minArea}
                      onChange={(e) => handleMinAreaChange(e.target.value)}
                      type='number'
                    />
                    <span className='text-sm font-medium text-muted-foreground'>-</span>
                    <Input
                      className='input-number h-8 px-2 w-12'
                      placeholder={t('filters.options.max')}
                      value={maxArea}
                      onChange={(e) => handleMaxAreaChange(e.target.value)}
                      type='number'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-4 justify-between'>
                  <Label className='text-sm font-medium'>
                    {t.rich('filters.options.durationRange.label', {
                      sup: (chunks) => <sup>{chunks}</sup>,
                    })}
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      className='input-number h-8 px-2 w-12'
                      placeholder={t('filters.options.min')}
                      value={minDuration}
                      onChange={(e) => handleMinDurationChange(e.target.value)}
                      type='number'
                    />
                    <span className='text-sm font-medium text-muted-foreground'>-</span>
                    <Input
                      className='input-number h-8 px-2 w-12'
                      placeholder={t('filters.options.max')}
                      value={maxDuration}
                      onChange={(e) => handleMaxDurationChange(e.target.value)}
                      type='number'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-4 justify-between'>
                  <Label className='text-sm font-medium'>
                    {t.rich('filters.options.frequencyRange.label', {
                      sup: (chunks) => <sup>{chunks}</sup>,
                    })}
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      className='input-number h-8 px-2 w-12'
                      placeholder={t('filters.options.min')}
                      value={minFrequency}
                      onChange={(e) => handleMinFrequencyChange(e.target.value)}
                      type='number'
                    />
                    <span className='text-sm font-medium text-muted-foreground'>-</span>
                    <Input
                      className='input-number h-8 px-2 w-12'
                      placeholder={t('filters.options.max')}
                      value={maxFrequency}
                      onChange={(e) => handleMaxFrequencyChange(e.target.value)}
                      type='number'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-4 justify-between'>
                  <Label className='text-sm font-medium'>{t('filters.options.columns.label')}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        className='h-8'
                        aria-label={t('filters.options.columns.placeholder')}
                      >
                        {t('filters.options.columns.placeholder')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => (
                          <DropdownMenuItem
                            key={column.id}
                            className={`cursor-pointer capitalize ${!column.getIsVisible() && '!text-muted-foreground bg-muted'}`}
                            onClick={() => column.toggleVisibility()}
                            onSelect={(event) => event.preventDefault()}
                          >
                            {tTable(`header.${column.id === '_id' ? 'id' : column.id}`)}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            }
            className='w-fit flex flex-col gap-2'
            
          />
        </div>
        <ButtonTooltip
          button={
            <Button
              variant='outline'
              onClick={resetFilters}
              disabled={activeFilters === 0}
              className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1'
              aria-label={t('reset.tooltip')}
            >
              <RotateCcw className='!size-4' />
            </Button>
          }
          tooltip={t('reset.tooltip')}
        />
        <AddDialogButton/>
      </div>
      {data.data.length > 0 && !data.single ? (
        <>
          <Table
            className='border-b border-border/50'
            divClassName='h-[28.5rem] overflow-y-auto w-[calc(100%)]'
            data-joyride='data-table'
          >
            <TableHeader className='sticky h-10 top-0 z-20 bg-background'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='relative hover:bg-transparent !border-none border-border/50'>
                  <TableHead className='p-0 h-10' key={'link-head'} aria-label='Search Engine Link' />
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`!h-10 ${orderableColumns.includes(header.id) ? 'p-0' : ''}`}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              className={`${table.getRowModel().rows?.length > 9 && '[&>tr:last-child]:!border-transparent'} [&>tr:last-child]:border-b-1`}
            >
              {table.getRowModel().rows?.length &&
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`border-border/50 !h-10 relative ${
                      Object.entries(groupedGlobeData).some(([timestamp, spills]) => {
                        const ts = new Date(timestamp.replace(' ', 'T')).getTime()
                        const hourStart = date.getTime()
                        const hourEnd = hourStart + 60 * 60 * 1000

                        return ts >= hourStart && ts < hourEnd && spills.some((spill) => spill.id === row.original._id)
                      })
                        ? 'bg-muted/20 text-foreground'
                        : ''
                    }`}
                    data-state={row.getIsSelected() && 'selected'}
                    data-joyride={index === 0 ? 'data-row' : 'none'}
                  >
                    <TableCell key={`linkCell${row.id}`} className='p-0 !h-10 absolute inset-0'>
                      <Link
                        className='cursor-pointer absolute inset-0 w-full h-full'
                        href={`?oilspill=${row.original._id}`}
                        aria-label={row.original._id}
                      />
                    </TableCell>
                    {row.getVisibleCells().map((cell) =>
                      isPending ? (
                        <TableCell key={cell.id} className='p-0'>
                          <Skeleton className='m-2 h-5 min-w-16' />
                        </TableCell>
                      ) : (
                        <TableCell
                          className={`text-xs font-medium ${orderableColumns.includes(cell.column.id) ? 'px-2' : ''}`}
                          key={cell.id}
                          align={
                            (
                              cell.column.columnDef.meta as {
                                align: AlignCellProps
                              }
                            )?.align
                          }
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            className={`${(data.items ?? 0) < 10 && 'border-t border-border/50'}`}
            table={table}
            onPaginationChange={handlePageTransition}
            items={data.items || 0}
          />
          <>
            { data.data.length > 1 ? (
              <>
                <Stats data={data} type='multiple' />
              </>
            ) : (
              <div className='flex-1 flex justify-center items-center border-t' data-joyride='data-stats'>
                <span className='text-muted-foreground text-sm'>{t('noStats')}</span>
              </div>
            )}
          </>
        </>
      ) : (
        <div className='flex flex-col items-center justify-center h-0 flex-1'>
          <p className='text-sm text-muted-foreground'>{tTable('body.noData')}</p>
        </div>
      )}
    </>
  )
}

export default Container
