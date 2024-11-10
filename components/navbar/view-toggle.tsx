import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';

const ViewToggleButton: React.FC = () => {
    const t = useTranslations('navbar');
    const [isGlobe, setIsGlobe] = useState(true);

    const handleToggle = () => {
        setIsGlobe(!isGlobe);
    };

    return (
        <Button variant={'outline'} className='bg-muted p-1 gap-0' onClick={handleToggle}>
            <span className={`px-2 h-full flex items-center justify-center rounded-sm hover:transition-colors hover:duration-500 ${isGlobe ? 'bg-background' : ''}`}>{t('viewToggle.globe')}</span>
            <span className={`px-2 h-full flex items-center justify-center rounded-sm hover:transition-colors hover:duration-500 ${!isGlobe ? 'bg-background' : ''}`}>{t('viewToggle.map')}</span>
        </Button>
    );
};

export default ViewToggleButton;
