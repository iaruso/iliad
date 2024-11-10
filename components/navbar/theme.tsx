import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <>
            {theme === 'dark' ? (
                <Button onClick={() => setTheme('light')} variant={'icon_outline'} size={'icon'}>
                    <MoonIcon />
                </Button>
            ) : (
                <Button onClick={() => setTheme('dark')} variant={'icon_outline'} size={'icon'}>
                    <SunIcon />
                </Button>
            )}
        </>
    );
};

export default ThemeSwitcher;