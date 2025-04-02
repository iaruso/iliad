"use client";
import { FC, useState } from 'react';
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


interface ContainerProps {
  data: OilSpills;
}

const Container: FC<ContainerProps> = ({ data }) => {
  const t = useTranslations("globe");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // const [activeFilters, setActiveFilters] = useState(0);

  const { pagination, setPagination, handlePageTransition, isPending } =
    usePagination({
      totalPages: data.totalPages,
    });

    const { oilSpillsColumns: columns } = useOilSpillsTableColumns();

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
              className='flex-1 h-8 px-2'
              disabled
            />
            <Button
              variant='outline'
              className='h-8 pr-2 pl-[calc(0.5rem-1px)]'
              disabled
            >
              <Settings2 className='h-4 w-4' />
              Filters
              <span className='text-[10px] rounded-sm h-4 w-4 border flex items-center justify-center bg-muted/50'>0</span>
            </Button>
            <Button
              variant='outline'
              className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1'
              disabled
            >
              <Plus className='h-4 w-4' />
              Add
            </Button>
          </div>
          <div className='h-[400px]'>
            <Table className='border-b border-border/50'>
              <TableHeader className='sticky top-0 z-10 bg-background shad'>
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
                          className='!h-10'
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
          </div>
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