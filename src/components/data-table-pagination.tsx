"use client";

import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { PAGE_SIZE } from "@/lib/constants";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

interface DataTablePaginationProps<TData> {
  className?: string;
  table: Table<TData>;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
}

export function DataTablePagination<TData>({
  className,
  table,
  onPaginationChange,
}: Readonly<DataTablePaginationProps<TData>>) {
  const t = useTranslations("pagination");

  const handlePageChange = (pageIndex: number) => {
    table.setPageIndex(pageIndex);
    onPaginationChange(pageIndex, table.getState().pagination.pageSize);
  };

  // const handlePageSizeChange = (pageSize: number) => {
  //   table.setPageSize(pageSize);
  //   table.setPageIndex(0);
  //   onPaginationChange(0, pageSize);
  // };

  return (
    <div className={`p-2 flex items-center justify-end h-12 ${className}`}>
      <div className="flex items-center gap-4 justify-between w-full">
        {/* <div className="flex items-center gap-2">
          <p className="text-sm">{t("itemsPerPage")}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-fit gap-0.5 pl-2 pr-[calc(0.5rem-3px)]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
        <div className="flex w-fit items-center justify-center text-xs">
          {t("page")} {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t("goToFirst")}</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              handlePageChange(table.getState().pagination.pageIndex - 1)
            }
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t("goToPrevious")}</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              handlePageChange(table.getState().pagination.pageIndex + 1)
            }
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t("goToNext")}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t("goToLast")}</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
