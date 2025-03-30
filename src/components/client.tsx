"use client";
import React, { useEffect, useState, createContext, ReactNode } from 'react';
import jsonData from '@/public/vc_cloudpoints_timeline.json';

export const AppContext = createContext({
  data: jsonData,
  selectedState: '0',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedState: (state: string) => {}
});

interface ClientApplicationProps {
  children: ReactNode;
}

export default function ClientApplication({ children }: ClientApplicationProps) {
  const [data, setData] = useState<typeof jsonData>(jsonData);
  const [selectedState, setSelectedState] = useState('0');

  useEffect(() => {
    setData(jsonData);
  }, []);

  return (
    <AppContext.Provider value={{ data, selectedState, setSelectedState }}>
      {children}
    </AppContext.Provider>
  );
}
