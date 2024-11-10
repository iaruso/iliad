import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import { PlusIcon } from '@radix-ui/react-icons';


const AddData: React.FC = () => {
    const t = useTranslations('navbar');
    return (
        <Button variant={'outline'} disabled>
            {t('addData.placeholder')}
            <PlusIcon className='w-4 h-4'/>
        </Button>
    );
};

export default AddData;
