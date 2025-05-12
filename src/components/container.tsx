'use client';
import { FC, useCallback, useState, useContext } from 'react';
import { GlobeContext, GlobeContextProps } from '@/context/globe-context';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { OilSpills } from '@/@types/oilspills';
import { 
  Settings2,
  Plus,
  RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui-custom/input';
import { Button } from '@/components/ui-custom/button';
import { Skeleton } from '@/components/ui-custom/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import Stats from '@/components/stats';
import { AlignCellProps } from '@/@types/table';
import TablePagination from '@/components/table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui-custom/table';
import { usePagination } from '@/hooks/use-pagination';
import ButtonTooltip from '@/components/ui-custom/button-tooltip';
import { Label } from '@/components/ui-custom/label';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import useOilSpillsTableColumns from '@/hooks/use-oilspills-table-columns';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
 } from '@/components/ui-custom/dropdown-menu';
import PopoverTooltip from '@/components/ui-custom/popover-tooltip';

interface ContainerProps {
  data: OilSpills;
}

const orderableColumns = [
  'latitude',
  'longitude',
  'area',
  'points'
];

const Container: FC<ContainerProps> = ({ data }) => {
  const { 
      date,
      groupedGlobeData
    } = useContext(GlobeContext) as GlobeContextProps;

  const t = useTranslations('globe.search');
  const tTable = useTranslations('globe.table');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const paramIdFilter = searchParams.get('id')?.toLowerCase() ?? '';
  const [idFilter, setIdFilter] = useState<string>(paramIdFilter);
  const paramMinArea = searchParams.get('minArea');
  const [minArea, setMinArea] = useState<string>(paramMinArea ?? '');
  const paramMaxArea = searchParams.get('maxArea');
  const [maxArea, setMaxArea] = useState<string>(paramMaxArea ?? '');
  
  const activeFilters = [
    idFilter.trim().length >= 3 ? 1 : 0,
    minArea !== '' ? 1 : 0,
    maxArea !== '' ? 1 : 0
  ].reduce(
    (acc, curr) => acc + curr,
    0
  );

  const updateFilters = useCallback(
    (updates: {
      id?: string;
      minArea?: string;
      maxArea?: string;
      field?: string;
      direction?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
  
      const currentFilters = {
        id: paramIdFilter || undefined,
        minArea: paramMinArea || undefined,
        maxArea: paramMaxArea || undefined,
        field: params.get('sortField') || undefined,
        direction: params.get('sortDirection') || undefined,
      };
  
      const mergedUpdates = {
        ...currentFilters,
        ...updates,
      };
  
      const parsedMin = mergedUpdates.minArea ? parseFloat(mergedUpdates.minArea) : undefined;
      const parsedMax = mergedUpdates.maxArea ? parseFloat(mergedUpdates.maxArea) : undefined;
  
      if (mergedUpdates.id !== undefined && mergedUpdates.id.trim().length >= 3) {
        params.set('id', mergedUpdates.id);
      } else {
        params.delete('id');
      }
  
      if (!isNaN(parsedMin!)) {
        params.set('minArea', parsedMin!.toString());
      } else {
        params.delete('minArea');
      }
  
      if (!isNaN(parsedMax!)) {
        params.set('maxArea', parsedMax!.toString());
      } else {
        params.delete('maxArea');
      }

      if (mergedUpdates.field) {
        params.set('sortField', mergedUpdates.field);
      } else {
        params.delete('sortField');
      }

      if (mergedUpdates.direction) {
        params.set('sortDirection', mergedUpdates.direction);
      } else {
        params.delete('sortDirection');
      }
  
      const newParamsString = params.toString();
      const currentParamsString = searchParams.toString();
      if (newParamsString !== currentParamsString) {
        router.replace(`?${newParamsString}`, { scroll: false });
      }
    },
    [searchParams, router, paramIdFilter, paramMinArea, paramMaxArea]
  );

  const handleIdFilterChange = (value: string) => {
    setIdFilter(value);
    updateFilters({ id: value });
  }

  const handleMinAreaChange = (value: string) => {
    setMinArea(value);
    updateFilters({ minArea: value });
  };
  
  const handleMaxAreaChange = (value: string) => {
    setMaxArea(value);
    updateFilters({ maxArea: value });
  };

  const handleOrderFilterChange = (field: string, direction: string) => {
    updateFilters({ field, direction });
  }

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    params.delete('minArea');
    params.delete('maxArea');
    params.delete('sortField');
    params.delete('sortDirection');
    setIdFilter('');
    setMinArea('');
    setMaxArea('');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const { pagination, setPagination, handlePageTransition, isPending } =
    usePagination({
      totalPages: data.totalPages || 0,
    });

  const { oilSpillsColumns: columns } = useOilSpillsTableColumns(handleOrderFilterChange);

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
  });

  return (
    <>
      <div className='flex items-center gap-2 h-12 p-2 border-b'>
        <Input
          placeholder={t('placeholder')}
          value={idFilter}
          onChange={(e) => handleIdFilterChange(e.target.value)}
          className='flex-1 h-8 px-2'
        />
        <PopoverTooltip
          button={
            <Button
              variant='outline'
              className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1.5 group'
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
            <>
              <Label className='text-sm font-medium'>
                {
                  t.rich('filters.options.areaRange.label', {
                    sup: (chunks) => <sup>{chunks}</sup>
                  })
                }
              </Label>
              <div className='flex items-center gap-2'>
                <Input
                  className='input-number h-8 px-2'
                  placeholder={t('filters.options.areaRange.min')}
                  value={minArea}
                  onChange={(e) => handleMinAreaChange(e.target.value)}
                  type='number'
                />
                <span className='text-sm font-medium text-muted-foreground'>-</span>
                <Input
                  className='input-number h-8 px-2'
                  placeholder={t('filters.options.areaRange.max')}
                  value={maxArea}
                  onChange={(e) => handleMaxAreaChange(e.target.value)}
                  type='number'
                />
              </div>
              <Label className='text-sm font-medium'>{t('filters.options.columns.label')}</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='w-full h-8'>
                    {t('filters.options.columns.placeholder')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {table.
                    getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                      <DropdownMenuItem
                        key={column.id}
                        className={`cursor-pointer capitalize ${!column.getIsVisible() && '!text-muted-foreground bg-muted'}`}
                        onClick={() => column.toggleVisibility()}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {tTable(`header.${column.id === '_id' ? 'id' : column.id}`)}
                      </DropdownMenuItem>
                      );
                    }
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
          className='w-64 flex flex-col gap-2'
        />
        <ButtonTooltip
          button={
            <Button
              disabled
              variant='outline'
              className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1'
            >
              <Plus className='!size-4' />
            </Button>
          }
          tooltip={t('add.tooltip')}
        />
        <ButtonTooltip
          button={
            <Button
              variant='outline'
              onClick={resetFilters}
              disabled={activeFilters === 0}
              className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1'
            >
              <RotateCcw className='!size-4' />
            </Button>
          }
          tooltip={t('reset.tooltip')}
        />
      </div>
      { data.data.length > 0 && !data.single ? (
        <>
          <Table className='border-b border-border/50' divClassName='h-[440px] overflow-y-auto scrollbar-gutter-stable-both-edges -ml-2 w-[calc(100%+1rem)]'>
            <TableHeader className='sticky top-0 z-10 bg-background'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className='relative hover:bg-transparent border-border/50'
                >
                  <TableHead
                    className='p-0 h-10'
                    key={'link-head'}
                    aria-label='Search Engine Link'
                  />
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`!h-10 ${orderableColumns.includes(header.id) ? 'p-0' : ''}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className={`${table.getRowModel().rows?.length > 9 && '[&>tr:last-child]:!border-transparent'} [&>tr:last-child]:border-b-1`}>
              {table.getRowModel().rows?.length && (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={`border-border/50 !h-10 relative ${
                      Object.entries(groupedGlobeData).some(([timestamp, spills]) => {
                        const ts = new Date(timestamp.replace(' ', 'T')).getTime();
                        const hourStart = date.getTime();
                        const hourEnd = hourStart + 60 * 60 * 1000;

                        return (
                          ts >= hourStart &&
                          ts < hourEnd &&
                          spills.some((spill) => spill.id === row.original._id)
                        );
                      })
                        ? 'bg-muted/20 text-foreground'
                        : ''
                    }`}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    <TableCell key={`linkCell${row.id}`} className='p-0 !h-10 absolute inset-0'>
                      <Link
                        className='cursor-pointer absolute inset-0 w-full h-full'
                        href={`?oilspill=${row.original._id}`}
                      />
                    </TableCell>
                    {row.getVisibleCells().map((cell) =>
                      isPending ? (
                        <TableCell key={cell.id} className='p-0'>
                          <Skeleton className='m-2 h-5 min-w-16' />
                        </TableCell>
                      ) : (
                        <TableCell
                          className={`text-xs font-medium ${
                            orderableColumns.includes(cell.column.id) ? 'px-2' : ''
                          }`}
                          key={cell.id}
                          align={
                            (
                            cell.column.columnDef.meta as {
                              align: AlignCellProps;
                            }
                            )?.align
                          }
                          >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            className={`${(data.items ?? 0) < 10 && 'border-t border-border/50'}`}
            table={table}
            onPaginationChange={handlePageTransition}
            items={data.items || 0}
          />
          <Stats
            data={data}
            type='multiple'
          />
        </>
      ) : (
        <div className='flex items-center justify-center h-[488px]'>
          <p className='text-sm text-muted-foreground'>
            {tTable('body.noData')}
          </p>
        </div>
      )}
    </>
  );
};

export default Container;