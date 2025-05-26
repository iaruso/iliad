
'use client';
import { useSearchParams } from 'next/navigation';
import DetailsLoading from '@/components/details/loading'
import ContainerLoading from '@/components/container/loading'

export default function LoadingClient() {
  const searchParams = useSearchParams();
  const hasOilspill = searchParams.get('oilspill');

  return (
    <>
    {hasOilspill ? <DetailsLoading /> : <ContainerLoading />}
    </>
  );
}
