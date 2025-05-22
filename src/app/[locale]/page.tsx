import { FC } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/navbar';
import { redirect } from '@/i18n/navigation';
import { GlobeProvider } from '@/context/globe-context';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui-custom/resizable';
import { headers } from 'next/headers';
import { validateAndSetParams } from '@/lib/pagination';
import { fetchOilspillData } from '@/lib/helpers/oilspill';
import type { Locale } from 'next-intl';
import type { OilSpills } from '@/@types/oilspills';
import Globe from '@/components/globe/globe';
import Controls from '@/components/controls';
import Timeline from '@/components/timeline';

const OilSpillInfo = dynamic(() => import('@/components/oilspill-info'), {
  loading: () => <div className='p-4'></div>,
});

const Container = dynamic(() => import('@/components/container'), {
  loading: () => <div className='p-4'></div>,
});

type Params = Promise<{ locale: Locale }>;
type SearchParams = Promise<{
  page?: string;
  size?: string;
  id?: string;
  areaRange?: string;
  durationRange?: string;
  frequencyRange?: string;
  sortField?: 'latitude' | 'longitude' | 'area' | 'points';
  sortDirection?: 'asc' | 'desc';
  oilspill?: string;
}>;

interface MainPageProps {
  params: Params;
  searchParams: SearchParams;
}

const MainPage: FC<MainPageProps> = async ({ params, searchParams }) => {
  const { locale } = await params;
  const {
    page,
    size,
    id,
    areaRange,
    durationRange,
    frequencyRange,
    sortField,
    sortDirection,
    oilspill,
  } = await searchParams;

  const { validPage: PAGE, validSize: SIZE } = validateAndSetParams(page, size);

  if (oilspill) {
    const params = new URLSearchParams();
    params.set('oilspill', oilspill);
  } else if (SIZE !== Number(size) || PAGE !== Number(page)) {
    const params = new URLSearchParams();
    params.set('page', PAGE.toString());
    params.set('size', SIZE.toString());
    if (id) params.set('id', id);
    if (areaRange) params.set('areaRange', areaRange);
    if (durationRange) params.set('durationRange', durationRange);
    if (frequencyRange) params.set('frequencyRange', frequencyRange);
    if (sortField) params.set('sortField', sortField);
    if (sortDirection) params.set('sortDirection', sortDirection);
    redirect({ href: `?${params.toString()}`, locale });
  }

  const oilSpills: OilSpills = await fetchOilspillData({
    oilspill,
    page: PAGE,
    size: SIZE,
    id,
    areaRange,
    durationRange,
    frequencyRange,
    sortField,
    sortDirection,
  });

  const supportsWebGPU = (await headers()).get('X-Supports-WebGPU');

  return (
    <ResizablePanelGroup direction='horizontal'>
      <GlobeProvider supportsWebGPU={supportsWebGPU === 'true'}>
        <ResizablePanel
          id='content-panel'
          className='flex-1 flex flex-col overflow-hidden dark:bg-black relative'
          defaultSize={72}
        >
          <Globe data={oilSpills} />
          <Controls />
          <Timeline isSingle={oilSpills.single} />
        </ResizablePanel>
        <ResizableHandle className='pointer-events-none cursor-default' />
        <ResizablePanel maxSize={32} minSize={28} defaultSize={28}>
          <div className='flex flex-col h-full'>
            <>
              {oilspill ? (
                <OilSpillInfo data={oilSpills.data[0]} />
              ) : (
                <Container data={oilSpills} />
              )}
            </>
            <Navbar />
          </div>
        </ResizablePanel>
      </GlobeProvider>
    </ResizablePanelGroup>
  );
};

export default MainPage;
