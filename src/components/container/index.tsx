'use client';
import { OilSpills } from '@/@types/oilspills';
import dynamic from 'next/dynamic';

const Container = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => <></>,
});
  
interface ContainerClientProps {
  data: OilSpills;
}

export default function ContainerClient({ data }: ContainerClientProps) {
  return <Container data={data} />;
}
