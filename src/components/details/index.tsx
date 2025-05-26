'use client';
import { OilSpill } from '@/@types/oilspills';
import dynamic from 'next/dynamic';

const Details = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => <></>,
});
  
interface DetailsClientProps {
  data: OilSpill;
}

export default function DetailsClient({ data }: DetailsClientProps) {
  return <Details data={data} />;
}
