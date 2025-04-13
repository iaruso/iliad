"use client";
import { FC, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { OilSpills } from '@/@types/oilspills';
import { 
  Settings2,
  Plus
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { useSearchParams, useRouter } from "next/navigation";
import { AlignCellProps } from "@/@types/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePagination } from "@/hooks/use-pagination";
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
} from "@tanstack/react-table";
import useOilSpillsTableColumns from '@/hooks/use-oilspills-tablecolumns';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem
 } from '@/components/ui/dropdown-menu';

interface ContainerProps {
  data: OilSpills;
}

const orderableColumns = [
  "latitude",
  "longitude",
  "area"
];

const Container: FC<ContainerProps> = ({ data }) => {
  const t = useTranslations("globe");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();

  const paramIdFilter = searchParams.get("id")?.toLowerCase() ?? "";
  const [idFilter, setIdFilter] = useState<string>(paramIdFilter);
  const paramMinArea = searchParams.get("minArea");
  const [minArea, setMinArea] = useState<string>(paramMinArea ?? "");
  const paramMaxArea = searchParams.get("maxArea");
  const [maxArea, setMaxArea] = useState<string>(paramMaxArea ?? "");
  
  const activeFilters = [
    idFilter.trim().length >= 3 ? 1 : 0,
    minArea !== "" ? 1 : 0,
    maxArea !== "" ? 1 : 0
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
        params.set("id", mergedUpdates.id);
      } else {
        params.delete("id");
      }
  
      if (!isNaN(parsedMin!)) {
        params.set("minArea", parsedMin!.toString());
      } else {
        params.delete("minArea");
      }
  
      if (!isNaN(parsedMax!)) {
        params.set("maxArea", parsedMax!.toString());
      } else {
        params.delete("maxArea");
      }

      if (mergedUpdates.field) {
        params.set("sortField", mergedUpdates.field);
      } else {
        params.delete("sortField");
      }

      if (mergedUpdates.direction) {
        params.set("sortDirection", mergedUpdates.direction);
      } else {
        params.delete("sortDirection");
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

  // const resetFilters = useCallback(() => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   params.delete("id");
  //   params.delete("minArea");
  //   params.delete("maxArea");
  //   params.delete("sortField");
  //   params.delete("sortDirection");
  //   setIdFilter("");
  //   setMinArea("");
  //   setMaxArea("");
  //   router.replace(`?${params.toString()}`, { scroll: false });
  // }, [router, searchParams]);

  const { pagination, setPagination, handlePageTransition, isPending } =
    usePagination({
      totalPages: data.totalPages,
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
    <div className='flex flex-col h-full'>
      <div className='flex-1'>
        <div className='flex flex-col border-b'>
          <div className='flex items-center gap-2 h-12 p-2 border-b'>
            <Input
              placeholder='Search...'
              value={idFilter}
              onChange={(e) => handleIdFilterChange(e.target.value)}
              className='flex-1 h-8 px-2'
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1"
                >
                  <Settings2 className="h-4 w-4" />
                  Filters
                  <span className="text-[10px] rounded-sm h-4 w-4 border flex items-center justify-center bg-muted/50">
                    {activeFilters}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-2">
                <div className="text-sm font-medium">Filter by Area</div>
                <Input
                  placeholder="Min area"
                  value={minArea}
                  onChange={(e) => handleMinAreaChange(e.target.value)}
                  type="number"
                />
                <Input
                  placeholder="Max area"
                  value={maxArea}
                  onChange={(e) => handleMaxAreaChange(e.target.value)}
                  type="number"
                />
                <div className='text-sm font-medium'>Columns</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' className='w-full h-8'>
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {table.
                      getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className='cursor-pointer'
                            onClick={() => column.toggleVisibility()}
                          >
                            {column.getIsVisible() ? "Hide" : "Show"}{" "}
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      }
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </PopoverContent>
            </Popover>
            <Button
              variant='outline'
              className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1'
              disabled
            >
              <Plus className='h-4 w-4' />
              Add
            </Button>
          </div>
          <Table className='border-b border-border/50' divClassName='h-[441px] overflow-y-auto'>
            <TableHeader className='sticky top-0 z-10 bg-background'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="relative hover:bg-transparent border-border/50"
                >
                  <TableHead
                    className="p-0 h-10"
                    key={"link-head"}
                    aria-label="Search Engine Link"
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
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className='border-border/50 !h-10'
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    <TableCell key={`linkCell${row.id}`} className="p-0 !h-10">
                      <Link
                        href={`/control-room/sessions/${row.original.sessionId}`}
                      />
                    </TableCell>
                    {row.getVisibleCells().map((cell) =>
                      isPending ? (
                        <TableCell key={cell.id} className="p-0">
                          <Skeleton className="m-2 h-6" />
                        </TableCell>
                      ) : (
                        <TableCell
                          className='text-xs font-medium'
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
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 w-full text-center"
                  >
                    {t(`table.body.noResults`)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <DataTablePagination
            className={`${data.items < 10 && 'border-t border-border/50'}`}
            table={table}
            onPaginationChange={handlePageTransition}
          />
        </div>
        
        
      </div>
      <Navbar />
    </div>
  );
};

export default Container;