import Container from '@/components/container';
import Globe from '@/components/globe/globe';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { AppProvider } from '@/components/context';
import { getGlobeData } from '@/lib/data';
 
export default async function HomePage() {
  const globeData = await getGlobeData();
  return (
    <AppProvider>
      <ResizablePanelGroup direction='horizontal'>
        <Globe initialData={globeData} />
        <ResizableHandle/>
        <ResizablePanel maxSize={32} minSize={16} defaultSize={24}>
          <Container />
        </ResizablePanel>
      </ResizablePanelGroup>
    </AppProvider>
  );
}