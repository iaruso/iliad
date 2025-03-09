import React from 'react';
import Navbar from '@/components/navbar';

const Container: React.FC = () => {
  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1'></div>
      <Navbar />
    </div>
  );
};

export default Container;