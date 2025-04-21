'use client';
import { useEffect } from 'react';

export default function OceanCanvas() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const canvasDiv = document.getElementById('canvas');
      if (canvasDiv) {
        import('@/components/simulations/components/main.js');
      } else {
        console.warn('div#canvas não encontrado no DOM');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div id="canvas" style={{ width: '100vw', height: '100vh' }} />
      <div id="camera" />
    </>
  );
}
