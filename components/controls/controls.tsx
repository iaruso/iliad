import React from 'react';
import { Button } from '../ui/button';
import { PlusIcon, MinusIcon, EnterFullScreenIcon, ExitFullScreenIcon, Crosshair1Icon, CameraIcon, InfoCircledIcon } from '@radix-ui/react-icons';

const Controls: React.FC = () => {

    return (
        <div className='flex items-center justify-end gap-1.5  ml-auto'>
            <Button variant={'icon'} size={'icon'} disabled>
                <PlusIcon className='w-4 h-4'/>
            </Button>
            <Button variant={'icon'} size={'icon'} disabled>
                <MinusIcon className='w-4 h-4'/>
            </Button>
            <Button variant={'icon'} size={'icon'} disabled>
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                    <path d='M4.25 8.5H11.75L8 14.5L4.25 8.5Z' fill='currentColor' className='opacity-60'/>
                    <path d='M4.25 7.5H11.75L8 1.5L4.25 7.5Z' fill='currentColor'/>
                </svg>
            </Button>
            <Button variant={'icon'} size={'icon'}>
                <EnterFullScreenIcon className='w-4 h-4'/>
            </Button>
            <Button variant={'icon'} size={'icon'} disabled>
                <Crosshair1Icon className='w-4 h-4'/>
            </Button>
            <Button variant={'icon'} size={'icon'} disabled>
                <CameraIcon className='w-4 h-4'/>
            </Button>
            <Button variant={'icon'} size={'icon'}>
                <InfoCircledIcon className='w-4 h-4'/>
            </Button>
        </div>
    );
};

export default Controls;