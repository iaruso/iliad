'use client';
import { OilSpills } from '@/@types/oilspills';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => <></>,
});

interface GlobeClientProps {
  data: OilSpills;
}

export default function GlobeClient({ data }: GlobeClientProps) {
  return <Globe data={data} />;
}
