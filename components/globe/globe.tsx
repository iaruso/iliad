'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Earth from '@/public/earth.webp';
import Bump from '@/public/earth_bump.webp';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface GlobeComponentProps {
    data: any;
    selectedState: string;
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ data, selectedState }) => {
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
    const [isGlobeReady, setIsGlobeReady] = useState(false);
    const [gData, setGData] = useState<any[]>([]);

    // Handle resizing of the globe
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Process the JSON data and update the heatmap data
    useEffect(() => {
        if (!data) {
            console.error("Data is undefined or null");
            return;
        }
        try {
            const stateData = data?.["@definitions"]?.["@actors"]?.["OilShape"]?.["@state"]?.[selectedState]?.polygon;
            if (stateData) {
                const parsedPolygon = JSON.parse(stateData);
                if (parsedPolygon?.type === "MultiPoint" && Array.isArray(parsedPolygon?.coordinates)) {
                    const formattedData = parsedPolygon.coordinates.map(([lng, lat]: [number, number]) => ({
                        lat: selectedState === '8' ? lat + 5 : lat, // To simulate movement in the globe
                        lng,
                        weight: 1,
                    }));
                    setGData(formattedData);
                } else {
                    console.error("Parsed polygon data is not a valid MultiPoint or coordinates are missing");
                }
            } else {
                console.error(`No polygon data found for the OilShape state: ${selectedState}`);
            }
        } catch (error) {
            console.error("Error parsing polygon data:", error);
        }
    }, [selectedState, data]);

    const memoizedGData = useMemo(() => gData, [gData]);

    // Theme-based background color
    const { resolvedTheme } = useTheme();
    const bg = resolvedTheme === 'dark' ? '240 10% 3.9%' : '0 0% 100%';

    return (
        <div className="h-0">
            {!isGlobeReady && <div>Loading Globe...</div>}
            <Globe
                onGlobeReady={() => setIsGlobeReady(true)}
                rendererConfig={{
                    antialias: false,
                    powerPreference: 'high-performance',
                }}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl={Earth.src}
                bumpImageUrl={Bump.src}
                atmosphereColor="lightskyblue"
                atmosphereAltitude={0.05}
                showGraticules={true}
                heatmapsData={[memoizedGData]}
                heatmapPointLat="lat"
                heatmapPointLng="lng"
                heatmapPointWeight="weight"
                heatmapBandwidth={1.0}
                heatmapTopAltitude={0}
                heatmapColorSaturation={0.4}
                backgroundColor={`hsl(${bg})`}
                hexPolygonResolution={1}
            />
        </div>
    );
};

export default GlobeComponent;
