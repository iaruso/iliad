import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Controls from '../controls/controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface ContentProps {
    isGUIEnabled: boolean;
    data: any;
    selectedState: string;
    setSelectedState: React.Dispatch<React.SetStateAction<string>>;
}

const Content: React.FC<ContentProps> = ({ isGUIEnabled, data, selectedState, setSelectedState}) => {
    const t = useTranslations('content');

    // Extract states and timestamps from data
    const states = Object.keys(data?.["@definitions"]?.["@actors"]?.OilSpill?.["@state"] || {});
    const coreography = data?.["@coreography"] || {};

    return (
        <div className='w-full h-fit px-2 absolute bottom-14 flex justify-center items-center'>
            <Tabs defaultValue="info" className="w-full max-w-screen-lg flex flex-col gap-1.5">
                <div className='flex gap-1.5'>
                    <TabsList className={`${!isGUIEnabled && 'hidden'} w-full justify-start`}>
                        <TabsTrigger value="info">{t('info.title')}</TabsTrigger>
                        <TabsTrigger value="timeline">{t('timeline.title')}</TabsTrigger>
                        <TabsTrigger value="globe" disabled>{t('globe.title')}</TabsTrigger>
                        <TabsTrigger value="particles" disabled>{t('particles.title')}</TabsTrigger>
                        <TabsTrigger value="area" disabled>{t('area.title')}</TabsTrigger>
                    </TabsList>
                    <Controls />
                </div>
                <div className={`${!isGUIEnabled && 'hidden'} border rounded-md bg-muted h-[20dvh] overflow-y-auto`}>
                    <TabsContent value="info" className='p-2 m-0'>
                        <div className="oilspill-info">
                            <h1 className='text-lg mb-2'>Oil Spill Incident (NAO-3424)</h1>
                            <h2 className='text-md font-semibold my-1'>Location:</h2>
                            <p>North Atlantic Ocean</p>
                            <h2 className='text-md font-semibold my-1'>Event Details:</h2>
                            <ul>
                                <li>Type: Pollution Event</li>
                                <li>Region: Scotland's Outer Hebrides</li>
                                <li>Additional Description: Marine pollution affecting surrounding regions</li>
                            </ul>

                            <h2 className='text-md font-semibold my-1'>Environmental Impact</h2>
                            <p>
                                The spill could have significant implications on marine biodiversity, coastal environments,
                                and local communities. Monitoring and mitigation efforts are ongoing.
                            </p>
                        </div>
                    </TabsContent>
                    <TabsContent value="timeline" className='p-2 m-0'>
                        <h2 className='text-lg font-semibold mb-2'>Timeline</h2>
                        <div className="timeline-buttons flex flex-wrap gap-1">
                            {states.map((stateKey) => {
                                const stateIndex = parseInt(stateKey, 10);
                                const timestamp = coreography[stateIndex]?.["@timestamp"] || "Unknown Time";
                                const momentLabel = stateIndex; //`Moment ${stateIndex} - (${new Date(timestamp).toLocaleString()})`;

                                return (
                                    <Button
                                        variant={'outline'}
                                        className='aspect-square'
                                        key={stateIndex}
                                        onClick={() => setSelectedState(stateIndex.toString())}
                                    >
                                        {momentLabel}
                                    </Button>
                                );
                            })}
                        </div>
                        {selectedState !== null && (
                            <div className="state-details mt-4">
                                <h3 className='text-md font-semibold'>
                                    Selected Moment: {selectedState}
                                </h3>
                                <p>
                                    Timestamp:{" "}
                                    {new Date(coreography[selectedState]?.["@timestamp"] || "").toLocaleString()}
                                </p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="globe" className='p-2 m-0'>
                        <p className='text-muted-foreground'>{t('globe.info')}</p>
                    </TabsContent>
                    <TabsContent value="particles"></TabsContent>
                    <TabsContent value="area"></TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default Content;
