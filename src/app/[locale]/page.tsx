import { FC } from 'react';
import Navbar from '@/components/navbar';
import { redirect } from '@/i18n/navigation';
import { GlobeProvider } from '@/context/globe-context';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui-custom/resizable';
import { validateAndSetParams } from '@/lib/pagination';
import { fetchOilspillData } from '@/lib/helpers/oilspill';
import type { Locale } from 'next-intl';
import type { OilSpills } from '@/@types/oilspills';
import Controls from '@/components/controls';
import Timeline from '@/components/timeline';
import Globe from '@/components/globe';
import Container from '@/components/container';
import Details from '@/components/details';

interface MainPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    page?: string
    size?: string
    id?: string
    areaRange?: string
    durationRange?: string
    frequencyRange?: string
    sortField?: 'latitude' | 'longitude' | 'area' | 'points'
    sortDirection?: 'asc' | 'desc'
    startDate?: string
    endDate?: string
    oilspill?: string
  }>;
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
    startDate,
    endDate,
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
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
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
    startDate,
    endDate,
  });

  return (
    <ResizablePanelGroup direction='horizontal' data-joyride='default'>
      <GlobeProvider>
        <ResizablePanel
          id='content-panel'
          className='flex-1 flex flex-col overflow-hidden dark:bg-black relative'
          defaultSize={72}
        >
          <div className='flex-1 w-full flex'>
            <Globe data={oilSpills} />
          </div>
          <Controls />
          <Timeline />
        </ResizablePanel>
        <ResizableHandle className='pointer-events-none cursor-default' role='separator' />
        <ResizablePanel maxSize={32} minSize={28} defaultSize={28} className='min-w-[420px]'>
          <div className='flex flex-col h-full'>
            <div className='flex flex-col flex-1 h-0' data-joyride='data'>
              {oilspill ? (
                <Details data={oilSpills.data[0]} />
              ) : (
                <Container data={oilSpills} />
              )}
            </div>
            <Navbar />
          </div>
        </ResizablePanel>
      </GlobeProvider>
    </ResizablePanelGroup>
  );
};

export default MainPage;
