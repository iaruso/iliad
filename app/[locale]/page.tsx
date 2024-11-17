'use client';
import Globe from "@/components/globe/globe";
import React, { useContext } from 'react';
import { AppContext } from '@/components/client';

export default function Home() {
  const { data, selectedState } = useContext(AppContext);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="home-container">
      <Globe data={data} selectedState={selectedState} />
    </div>
  );
}

