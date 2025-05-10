import { PageSearchParamName, SizeSearchParamName } from '@/@types/search-params';
import { PAGE_SIZE } from '@/lib/constants';
import { useRouter } from '@/i18n/navigation';
import { PaginationState } from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

interface UsePaginationProps {
  totalPages: number;
  defaultPageSize?: number;
  pageSearchParamName?: PageSearchParamName;
  sizeSearchParamName?: SizeSearchParamName;
}

export function usePagination({
  totalPages,
  defaultPageSize = 10,
  pageSearchParamName = 'page',
  sizeSearchParamName = 'size',
}: UsePaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pageParam = Number(searchParams.get(pageSearchParamName));
  const sizeParam = Number(searchParams.get(sizeSearchParamName));

  const initialPageSize = PAGE_SIZE.includes(sizeParam)
    ? sizeParam
    : defaultPageSize;
  const initialPageIndex =
    pageParam > 0 && pageParam <= totalPages ? pageParam - 1 : 0;

  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  }));

  const handlePageTransition = (pageIndex: number, pageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(pageSearchParamName, (pageIndex + 1).toString());
    params.set(sizeSearchParamName, pageSize.toString());
    startTransition(() =>
      router.replace(`?${params.toString()}`, { scroll: false }),
    );
  };

  useEffect(() => {
    const currentSize = pagination.pageSize;

    if (pageParam > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set(pageSearchParamName, '1');
      params.set(sizeSearchParamName, currentSize.toString());
      startTransition(() =>
        router.replace(`?${params.toString()}`, { scroll: false }),
      );
    }
  }, [
    pagination,
    totalPages,
    searchParams,
    router,
    pageParam,
    pageSearchParamName,
    sizeSearchParamName,
  ]);

  return { pagination, setPagination, handlePageTransition, isPending };
}
