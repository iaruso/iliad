import React, { useState } from 'react';
import { Button } from '../ui/button';

interface GUIButtonProps {
    isGUIEnabled: boolean;
    onToggle: () => void;
}

const GUIButton: React.FC<GUIButtonProps> = ({ isGUIEnabled, onToggle }) => {
    return (
        <Button variant={'outline'} onClick={onToggle} className={`${ isGUIEnabled ? '!bg-muted' : ''}`}>
            GUI
            <span className={`${ isGUIEnabled ? 'bg-background' : 'bg-muted'} text-[0.625rem] font-bold p-1 h-4 flex items-center justify-center rounded-sm hover:transition-colors hover:duration-500`}>0</span>
        </Button>
    );
};

export default GUIButton;