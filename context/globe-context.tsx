'use client';
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { DateRange } from 'react-aria-components';

export interface GlobeContextProps {
  isGlobeReady: boolean;
  setIsGlobeReady: (isReady: boolean) => void;
  globeRef: React.MutableRefObject<any>;
  setGlobeMaterial: (material: any) => void;
  zoomControl: number;
  setZoomControl: (control: number) => void;
  currentLocation: { lat: number; lng: number; date: Date } | null;
  setCurrentLocation: (location: { lat: number; lng: number; date: Date } | null) => void;
  altitude: number;
  setAltitude: (altitude: number) => void;
  dataDetail: 'single' | 'low' | 'medium' | 'high';
  setDataDetail: (detail: 'single' | 'low' | 'medium' | 'high') => void;
  moment: 'start' | 'end';
  setMoment: (moment: 'start' | 'end') => void;
  timelineSpeed: number;
  setTimelineSpeed: (speed: number) => void;
  dateRange: DateRange | null;
  setDateRange: (range: DateRange | null) => void;
  supportsWebGPU: boolean;
  viewType: 'heatmap' | 'points';
  setViewType: (view: 'heatmap' | 'points') => void;
}

export const GlobeContext = createContext<GlobeContextProps | undefined>(undefined);

export const GlobeProvider: FC<{ children: ReactNode; supportsWebGPU: boolean }> = ({
  children,
  supportsWebGPU
}) => {
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const globeRef = useRef<any>(undefined);
  const [zoomControl, setZoomControl] = useState<number>(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number, date: Date } | null>(null);
  const [altitude, setAltitude] = useState(2.5);
  const [dataDetail, setDataDetail] = useState<'single' | 'low' | 'medium' | 'high'>('single');
  const [moment, setMoment] = useState<'start' | 'end'>('start');
  const [timelineSpeed, setTimelineSpeed] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [globeMaterial, setGlobeMaterial] = useState<any>(null);
  const [viewType, setViewType] = useState<'heatmap' | 'points'>(supportsWebGPU ? 'heatmap' : 'points');

  return (
    <GlobeContext.Provider
      value={{
        isGlobeReady,
        setIsGlobeReady,
        globeRef,
        setGlobeMaterial,
        zoomControl,
        setZoomControl,
        currentLocation,
        setCurrentLocation,
        altitude,
        setAltitude,
        dataDetail,
        setDataDetail,
        moment,
        setMoment,
        timelineSpeed,
        setTimelineSpeed,
        dateRange,
        setDateRange,
        supportsWebGPU,
        viewType,
        setViewType
      }}
    >
      {children}
    </GlobeContext.Provider>
  );
};
