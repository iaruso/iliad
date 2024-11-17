'use client';
import React, { useEffect, useState } from 'react';
import Logo from '@/public/logo.webp';
import { Button } from '../ui/button';
import Link from 'next/link';
import Search from './search';
import ViewToggleButton from './view-toggle';
import GUIButton from './gui';
import AddData from './add';
import LanguageSwitcher from './language';
import ThemeSwitcher from './theme';
import Content from '../content/content';

interface NavbarProps {
    data: any;
    selectedState: string;
    setSelectedState: React.Dispatch<React.SetStateAction<string>>;
}

const Navbar: React.FC<NavbarProps> = ({ data, selectedState, setSelectedState }) => {
    const [isGUIEnabled, setIsGUIEnabled] = useState(true);

    const handleToggle = () => {
        setIsGUIEnabled(!isGUIEnabled);
    };
    
    useEffect(() => {
        console.log('GUI Enabled:', isGUIEnabled);
    }, [isGUIEnabled]);

    return (
        <div className='relative'>
            <Content isGUIEnabled={isGUIEnabled} data={data} selectedState={selectedState} setSelectedState={setSelectedState}/>
            <nav className='w-full h-12 px-2 py-1 flex items-center justify-center border-t bg-background'>
                <div className='flex-1 h-full max-w-screen-lg flex items-center gap-1.5'>
                    <img src={Logo.src} alt='logo' className='h-8 w-8 mr-1' />
                    <Search />
                    {/* <Link href='/explore'>
                        <Button
                            variant={'outline'}
                            className=''
                        >
                            Explore mode
                        </Button>
                    </Link> */}
                    <ViewToggleButton />
                    <GUIButton isGUIEnabled={isGUIEnabled} onToggle={handleToggle} />
                    <AddData />
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
