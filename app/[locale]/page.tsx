import Container from '@/components/container';
import Globe from '@/components/globe/globe';
import Timeline from '@/components/timeline';
import { GlobeProvider } from '@/context/globe-context';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import Controls from '@/components/controls';
import { AppProvider } from '@/components/context';
import { getGlobeData } from '@/lib/data';
import { headers } from 'next/headers'
 
export default async function HomePage() {
  const supportsWebGPU = (await headers()).get('X-Supports-WebGPU')
  const globeData = await getGlobeData();
  return (
    <AppProvider>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          id='content-panel'
          className='flex-1 flex flex-col overflow-hidden dark:bg-black relative'
          defaultSize={76}
        >
          <GlobeProvider supportsWebGPU={supportsWebGPU === 'true'}>
            <Globe initialData={globeData}/>
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