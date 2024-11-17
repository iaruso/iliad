import React from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '../ui/input';

const Search: React.FC = () => {
    const t = useTranslations('navbar');
    return (
        <Input placeholder={t('search.placeholder')} value={'NAO-3424'} readOnly className='pointer-events-none'/>
    );
};

export default Search;
