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
import { getOilSpills, getOilSpillByID } from '@/actions/oilspills';

type Params = Promise<{ locale: Locale }>;
type SearchParams = Promise<{
  page?: string;
  size?: string;
  id?: string;
  minArea?: string;
  maxArea?: string;
  sortField?: 'latitude' | 'longitude' | 'area';
  sortDirection?: 'asc' | 'desc';
  oilspill?: string;
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
    id,
    minArea,
    maxArea,
    sortField,
    sortDirection,
    oilspill
  } = await searchParams;

  const { validPage: PAGE, validSize: SIZE } = validateAndSetParams(page, size);
  
  if (oilspill) {
    const params = new URLSearchParams();
    params.set("oilspill", oilspill);
  } else if (SIZE !== Number(size) || PAGE !== Number(page)) {
    const params = new URLSearchParams();
    params.set("page", PAGE.toString());
    params.set("size", SIZE.toString());
    if (id) params.set("id", id);
    if (minArea) params.set("minArea", minArea);
    if (maxArea) params.set("maxArea", maxArea);
    if (sortField) params.set("sortField", sortField);
    if (sortDirection) params.set("sortDirection", sortDirection);
    redirect({ href: `?${params.toString()}`, locale: locale });
  }

  let oilSpills: OilSpills;

  try {
    if (oilspill) {
      const single = await getOilSpillByID({ oilspill: oilspill.toLowerCase() });
  
      if (!single) {
        oilSpills = { data: [] };
      } else {
        // tenta extrair a primeira coordenada válida
        let coordinates: [number, number] = [0, 0];
        let found = false;
  
        for (const entry of single.data ?? []) {
          for (const actor of entry.actors ?? []) {
            const geom = actor.geometry;
  
            if (geom?.type === "Point" && Array.isArray(geom.coordinates)) {
              const [lng, lat] = geom.coordinates;
              if (typeof lng === "number" && typeof lat === "number") {
                coordinates = [lng, lat];
                found = true;
                break;
              }
            }
  
            if (geom?.type === "Polygon" && Array.isArray(geom.coordinates)) {
              const ring = geom.coordinates[0];
              if (Array.isArray(ring) && ring.length) {
                const [lng, lat] = ring[0];
                if (typeof lng === "number" && typeof lat === "number") {
                  coordinates = [lng, lat];
                  found = true;
                  break;
                }
              }
            }
          }
          if (found) break;
        }
  
        oilSpills = {
          single: true,
          data: [
            {
              ...single,
              coordinates
            },
          ],
        };
      }
    } else {
      oilSpills = await getOilSpills({
        page: PAGE,
        size: SIZE,
        id: id?.toLowerCase(),
        minArea,
        maxArea,
        sortField,
        sortDirection,
      });
    }
  } catch (error) {
    throw new Error(error as string);
  }

  const supportsWebGPU = (await headers()).get('X-Supports-WebGPU');

  return (
    <AppProvider>
      <ResizablePanelGroup direction='horizontal'>
        <GlobeProvider supportsWebGPU={supportsWebGPU === 'true'}>
          <ResizablePanel
            id='content-panel'
            className='flex-1 flex flex-col overflow-hidden dark:bg-black relative'
            defaultSize={72}
          >
            <Globe data={oilSpills}/>
            <Controls />
            <Timeline isSingle={oilSpills.single}/>
          </ResizablePanel>
          <ResizableHandle/>
          <ResizablePanel maxSize={36} minSize={28} defaultSize={28}>
            <Container data={oilSpills}/>
          </ResizablePanel>
        </GlobeProvider>
      </ResizablePanelGroup>
    </AppProvider>
  );
}

export default MainPage;