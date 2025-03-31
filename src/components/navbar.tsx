import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/navbar/theme-toggle';
import LocaleToggle from '@/components/navbar/locale-toggle';
import { SettingsDialog } from '@/components/navbar/settings';


const Navbar: React.FC = () => {
  const t = useTranslations('navbar');
  return (
    <nav className='border-t h-12 flex items-center py-2 px-3 justify-between gap-2'>
      <div className='flex items-start gap-2'>
      <h1 className='font-[550] select-none line-clamp-1'>{t('app')}</h1>
      <Badge variant='version' className='tabular-nums'>0.3.1</Badge>
      </div>
      <div className='flex items-center gap-1.5'>
        <ThemeToggle/>
        <LocaleToggle/>
        <SettingsDialog/>
      </div>
    </nav>
  );
};

export default Navbar;