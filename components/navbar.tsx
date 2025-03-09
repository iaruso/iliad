import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Locale } from '@/types/locale';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/navbar/theme-toggle';
import LocaleToggle from '@/components/navbar/locale-toggle';
import Info from '@/components/navbar/info';


const Navbar: React.FC = () => {
  const t = useTranslations('navbar');
  const locale = useLocale() as Locale;
  return (
    <nav className='border-t h-12 flex items-center py-2 px-3 justify-between'>
      <h1 className='font-[550] select-none'>{t('app')}</h1>
      <div className='flex items-center gap-1.5'>
        <Badge variant='version'>v.0.2.0</Badge>
        <ThemeToggle/>
        <LocaleToggle locale={locale}/>
        <Info/>
      </div>
    </nav>
  );
};

export default Navbar;