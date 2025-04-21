/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
  createContext,
  FC,
  ReactNode,
  useRef,
  useState,
  useContext
} from 'react';
import { ShaderMaterial } from 'three';
import { DateRange } from 'react-aria-components';

export interface GlobeContextProps {
  groupedGlobeData: Record<string, any[]>;
  setGroupedGlobeData: (data: Record<string, any[]>) => void;
  isGlobeReady: boolean;
  setIsGlobeReady: (isReady: boolean) => void;
  globeRef: React.MutableRefObject<any>;
  globeMaterial: ShaderMaterial | null;
  setGlobeMaterial: (material: any) => void;
  zoomControl: number;
  setZoomControl: (control: number) => void;
  currentLocation: { lat: number; lng: number; date: Date } | null;
  setCurrentLocation: (location: { lat: number; lng: number; date: Date } | null) => void;
  textureQuality: 'low' | 'high';
  setTextureQuality: (quality: 'low' | 'high') => void;
  dayNight: boolean;
  setDayNight: (dayNight: boolean) => void;
  altitude: number;
  setAltitude: (altitude: number) => void;
  dataDetail: 'single' | 'low' | 'medium' | 'high';
  setDataDetail: (detail: 'single' | 'low' | 'medium' | 'high') => void;
  date: Date;
  setDate: (date: Date) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  timelineSpeed: number;
  setTimelineSpeed: (speed: number) => void;
  dateRange: DateRange | null;
  setDateRange: (range: DateRange | null) => void;
  supportsWebGPU: boolean;
  viewType: 'heatmap' | 'points';
  setViewType: (view: 'heatmap' | 'points') => void;
  labelsVisible: boolean;
  setLabelsVisible: (visible: boolean) => void;
}

export const GlobeContext = createContext<GlobeContextProps | undefined>(undefined);

export const GlobeProvider: FC<{ children: ReactNode; supportsWebGPU: boolean }> = ({
  children,
  supportsWebGPU
}) => {
  const [groupedGlobeData, setGroupedGlobeData] = useState<Record<string, any[]>>({});
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const globeRef = useRef<any>(undefined);
  const [zoomControl, setZoomControl] = useState<number>(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number, date: Date } | null>(null);
  const [textureQuality, setTextureQuality] = useState<'low' | 'high'>('low');
  const [dayNight, setDayNight] = useState(true);
  const [altitude, setAltitude] = useState(2.5);
  const [dataDetail, setDataDetail] = useState<'single' | 'low' | 'medium' | 'high'>('single');
  const [date, setDate] = useState(new Date());
  const [playing, setPlaying] = useState(false);
  const [timelineSpeed, setTimelineSpeed] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [globeMaterial, setGlobeMaterial] = useState<ShaderMaterial | null>(null);
  const [viewType, setViewType] = useState<'heatmap' | 'points'>('points');
  const [labelsVisible, setLabelsVisible] = useState(true);

  return (
    <GlobeContext.Provider
      value={{
        groupedGlobeData,
        setGroupedGlobeData,
        isGlobeReady,
        setIsGlobeReady,
        globeRef,
        globeMaterial,
        setGlobeMaterial,
        zoomControl,
        setZoomControl,
        currentLocation,
        setCurrentLocation,
        textureQuality,
        setTextureQuality,
        dayNight,
        setDayNight,
        altitude,
        setAltitude,
        dataDetail,
        setDataDetail,
        date,
        setDate,
        playing,
        setPlaying,
        timelineSpeed,
        setTimelineSpeed,
        dateRange,
        setDateRange,
        supportsWebGPU,
        viewType,
        setViewType,
        labelsVisible,
        setLabelsVisible
      }}
    >
      {children}
    </GlobeContext.Provider>
  );
};

export const useGlobe = () => {
  const ctx = useContext(GlobeContext);
  if (!ctx) throw new Error('GlobeContext missing');
  return ctx;
};