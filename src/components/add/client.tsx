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
import { createOilSpill } from '@/actions/oilspills';

const AddDialogButtonClient = () => {
  const t = useTranslations('globe.search.add');
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dragDepth = useRef(0);

  const handleFile = (file: File) => {
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setAlert(null);
    } else {
      setAlert({ type: 'error', message: t('dialog.errors.invalidFile') || 'Please drop a JSON file.' });
    }
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAlert(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    setAlert(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const formatted = formatToOilSpill(json);
          await createOilSpill({ data: formatted });
          setAlert({ type: 'success', message: t('dialog.success') || 'Added successfully!' });
          setSelectedFile(null);
        } catch {
          setAlert({ type: 'error', message: t('dialog.errors.parse') || 'Invalid JSON file.' });
        }
        setIsSubmitting(false);
      };
      reader.readAsText(selectedFile);
    } catch {
      setAlert({ type: 'error', message: t('dialog.errors.unknown') || 'An error occurred.' });
      setIsSubmitting(false);
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
          {alert && (
            <div className={`mb-2 text-sm rounded px-2 py-1 ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {alert.message}
            </div>
          )}
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/40 rounded-md w-full min-h-[120px] cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors
              ${dragActive ? 'border-primary/80 bg-muted/30' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            tabIndex={0}
            role='button'
            aria-label='Drop or select JSON file'
          >
            {selectedFile ? (
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm mb-2 user-select-none'>{selectedFile.name}</span>
                <Button size='sm' variant='ghost' onClick={handleRemoveFile} aria-label={t('dialog.actions.remove') || 'Remove file'}>
                  &times;
                </Button>
              </div>
            ) : (
              <span className='text-muted-foreground text-sm mb-2 user-select-none'>
                {dragActive ? t('dialog.drop') : t('dialog.file')}
              </span>
            )}
            <input
              ref={fileInputRef}
              type='file'
              accept='application/json,.json'
              className='hidden'
              onChange={handleFileChange}
              disabled={!!selectedFile}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{t('dialog.actions.cancel')}</Button>
            </DialogClose>
            <Button
              variant='default'
              onClick={handleAdd}
              disabled={!selectedFile || isSubmitting}
            >
              {isSubmitting ? t('dialog.actions.adding') || 'Adding...' : t('dialog.actions.add') || 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddDialogButtonClient
