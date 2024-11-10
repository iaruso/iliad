import React from 'react';
import { useTranslations } from 'next-intl';
import Controls from '../controls/controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ContentProps {
    isGUIEnabled: boolean;
}

const Content: React.FC<ContentProps> = ({ isGUIEnabled }) => {
    const t = useTranslations('content');
    return (
        <div className='w-full h-fit px-2 absolute bottom-14 flex justify-center items-center'>
            <Tabs defaultValue="globe" className="w-full max-w-screen-lg flex flex-col gap-1.5">
                <div className='flex gap-1.5'>
                    <TabsList className={`${!isGUIEnabled && 'hidden'} w-full justify-start`}>
                        <TabsTrigger value="info">{t('info.title')}</TabsTrigger>
                        <TabsTrigger value="timeline" disabled>{t('timeline.title')}</TabsTrigger>
                        <TabsTrigger value="globe">{t('globe.title')}</TabsTrigger>
                        <TabsTrigger value="particles" disabled>{t('particles.title')}</TabsTrigger>
                        <TabsTrigger value="area" disabled>{t('area.title')}</TabsTrigger>
                    </TabsList>
                    <Controls/>
                </div>
                <div className={`${!isGUIEnabled && 'hidden'} border rounded-md bg-muted h-[20dvh]`}>
                    <TabsContent value="info"></TabsContent>
                    <TabsContent value="timeline"></TabsContent>
                    <TabsContent value="globe"></TabsContent>
                    <TabsContent value="particles"></TabsContent>
                    <TabsContent value="area"></TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default Content;