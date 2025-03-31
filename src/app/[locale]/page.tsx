import { FC } from 'react';
import Container from '@/components/container';
import Globe from '@/components/globe/globe';
import Timeline from '@/components/timeline';
import { GlobeProvider } from '@/context/globe-context';
import { redirect } from "@/i18n/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import Controls from '@/components/controls';
import { AppProvider } from '@/components/context';
import { validateAndSetParams } from '@/lib/pagination';
import { headers } from 'next/headers'
import { Locale } from 'next-intl';
import { OilSpills } from '@/@types/oilspills';
import { getOilSpills } from '@/actions/oilspills';

type Params = Promise<{ locale: Locale }>;
type SearchParams = Promise<{
  page: string;
  size: string;
}>;

interface MainPageProps {
  params: Params;
  searchParams: SearchParams;
}
 
const MainPage: FC<MainPageProps> = async ({
  params,
  searchParams,
}) => {
  const { locale } = await params;
  const {
    page,
    size,
  } = await searchParams;

  const { validPage: PAGE, validSize: SIZE } = validateAndSetParams(page, size);

  if (SIZE !== Number(size) || PAGE !== Number(page)) {
    const params = new URLSearchParams();
    params.set("page", PAGE.toString());
    params.set("size", SIZE.toString());
    redirect({ href: `?${params.toString()}`, locale: locale });
  }

  let oilSpills: OilSpills;
  
  try {
    oilSpills = await getOilSpills({
      page: PAGE,
      size: SIZE
    });
  } catch (error) {
    throw new Error(error as string);
  }

  const supportsWebGPU = (await headers()).get('X-Supports-WebGPU')

  return (
    <AppProvider>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          id='content-panel'
          className='flex-1 flex flex-col overflow-hidden dark:bg-black relative'
          defaultSize={76}
        >
          <GlobeProvider supportsWebGPU={supportsWebGPU === 'true'}>
            <Globe initialData={oilSpills}/>
            <Controls />
            <Timeline />
          </GlobeProvider>
        </ResizablePanel>
        <ResizableHandle/>
        <ResizablePanel maxSize={32} minSize={16} defaultSize={24}>
          <Container />
        </ResizablePanel>
      </ResizablePanelGroup>
    </AppProvider>
  );
}

export default MainPage;