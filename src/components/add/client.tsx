'use client'
import { Button } from '@/components/ui-custom/button'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui-custom/dialog';
import { Plus } from 'lucide-react'
import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { formatToOilSpill } from '@/lib/add';

const AddDialogButtonClient = () => {
  const t = useTranslations('globe.search.add');
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Track drag depth to avoid flicker when moving inside the dropzone
  const dragDepth = useRef(0);

  const handleFile = (file: File) => {
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const formatted = formatToOilSpill(json);
          console.log(formatted);
        } catch (err) {
          console.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    } else {
      console.error('Please drop a JSON file.');
    }
    // Reset file input so user can upload the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current++;
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current--;
    if (dragDepth.current <= 0) {
      setDragActive(false);
      dragDepth.current = 0;
    }
  };

  return (
    <div className='flex' data-joyride='data-add'>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal>
        <DialogTrigger asChild>
          <ButtonTooltip
            button={
              <Button
                variant='outline'
                className='h-8 pr-2 pl-[calc(0.5rem-1px)] gap-1'
                aria-label={t('tooltip')}
                onClick={() => setDialogOpen(true)}
              >
                <Plus className='!size-4' />
              </Button>
            }
            tooltip={t('tooltip')}
          />
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/40 rounded-md w-full min-h-[120px] cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors
              ${dragActive ? 'border-primary/80 bg-muted/30' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            tabIndex={0}
            role='button'
            aria-label='Drop or select JSON file'
          >
            <span className='text-muted-foreground text-sm mb-2 user-select-none'>
              {dragActive ? t('dialog.drop') : t('dialog.file')}
            </span>
            <input
              ref={fileInputRef}
              type='file'
              accept='application/json,.json'
              className='hidden'
              onChange={handleFileChange}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{t('dialog.actions.cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddDialogButtonClient
