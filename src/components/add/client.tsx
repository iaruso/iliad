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
  DialogTrigger,
} from '@/components/ui-custom/dialog'
import { Plus } from 'lucide-react'
import type React from 'react'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { formatToOilSpill } from '@/lib/add'
import { createOilSpill } from '@/actions/oilspills'
import { Loader, CheckCircle2, XCircle, X } from 'lucide-react'

const AddDialogButtonClient = () => {
  const t = useTranslations('globe.search.add')
  const [dialogOpen, setDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(4)
  const [stepMessage, setStepMessage] = useState<string>('')
  const [stepStatus, setStepStatus] = useState<'pending' | 'success' | 'error' | null>(null)
  const [processingComplete, setProcessingComplete] = useState(false)
  const dragDepth = useRef(0)

  const steps = [
    t('dialog.steps.timestamps'),
    t('dialog.steps.actors'),
    t('dialog.steps.dates'),
    t('dialog.steps.geometry'),
  ]

  const resetSteps = () => {
    setCurrentStep(0)
    setStepMessage('')
    setStepStatus(null)
    setTotalSteps(4)
    setProcessingComplete(false)
  }

  const handleFile = (file: File) => {
    if (file && file.type === 'application/json') {
      setSelectedFile(file)
      resetSteps()
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current = 0
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current++
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current--
    if (dragDepth.current <= 0) {
      setDragActive(false)
      dragDepth.current = 0
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    resetSteps()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAdd = async () => {
    if (!selectedFile) return
    setIsSubmitting(true)
    resetSteps()
    setProcessingComplete(false)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string)
          const formatted = await formatToOilSpill(json, (step, total, status, message) => {
            setCurrentStep(step)
            setTotalSteps(total)
            setStepStatus(status)
            setStepMessage(message || steps[step - 1] || '')
          })
          await createOilSpill({ data: formatted })
          setProcessingComplete(true)
          setStepMessage(t('dialog.steps.success'))
          setStepStatus('success')

          setTimeout(() => {
            setSelectedFile(null)
            setDialogOpen(false)
            resetSteps()
            setIsSubmitting(false)
            window.location.reload();
          }, 5000)
        } catch {
          setStepStatus('error')
          setStepMessage(t('dialog.steps.error'))
          setIsSubmitting(false)
        }
      }
      reader.readAsText(selectedFile)
    } catch {
      setStepStatus('error')
      setStepMessage(t('dialog.steps.error'))
      setIsSubmitting(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!isSubmitting || stepStatus === 'error') {
      setDialogOpen(open)
      if (!open) {
        resetSteps()
        setSelectedFile(null)
      }
    }
  }

  const getStepIcon = () => {
    if (stepStatus === 'error') {
      return <XCircle className='text-destructive' size={20} />
    } else if (stepStatus === 'success' && processingComplete) {
      return <CheckCircle2 className='text-foreground/80' size={20} />
    } else {
      return (
        <Loader className={`animate-spin text-muted-foreground`} size={16} />
      )
    }
  }

  return (
    <div className='flex' data-joyride='data-add'>
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose} modal>
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
            e.preventDefault()
          }}
        >
          <div className={`flex flex-col gap-4 ${stepStatus === 'success' ? 'animate-pulse' : undefined}`}>
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>
          {!selectedFile &&(
            <div
              className={`flex flex-col items-center justify-center border border-dashed border-muted-foreground/40 rounded-md w-full h-40 cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors text-muted-foreground
                ${dragActive ? 'border-primary/80 bg-muted/30' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onClick={() => !selectedFile && !isSubmitting && fileInputRef.current?.click()}
              tabIndex={0}
              role='button'
              aria-label='Drop or select JSON file'
            >
              <span className=' text-sm user-select-none'>
                {dragActive ? t('dialog.drop') : t('dialog.file')}
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type='file'
            accept='application/json,.json'
            className='hidden'
            onChange={handleFileChange}
            disabled={!!selectedFile || isSubmitting}
          />
          {selectedFile && (
            <div className='flex flex-col gap-4 h-40'>
              <div className='flex items-center rounded-md border bg-muted/20 py-2 w-fit max-w-full h-8 overflow-hidden'>
                <span className='text-muted-foreground text-sm user-select-none px-2 truncate text-ellipsis'>{selectedFile.name}</span>
                {!isSubmitting && (
                  <Button
                    variant='ghost'
                    className='w-8 h-8 p-0 rounded-l-none border-l'
                    onClick={handleRemoveFile}
                    aria-label={t('dialog.actions.remove') || 'Remove file'}
                  >
                    <X className='!size-3' />
                  </Button>
                )}
              </div>
            {(isSubmitting || stepStatus === 'error') ? (
              <div className={`flex items-center gap-2 ${stepStatus === 'error' ? 'text-destructive' : stepStatus === 'success' ? 'text-foreground/80' : 'text-muted-foreground/80'}`}>
                {getStepIcon()}
                <span className={`text-sm font-medium`}>
                  {stepMessage}
                </span>
                {stepStatus !== 'success' && (
                  <div className='flex items-center gap-2 text-sm'>
                    <span>
                      ({currentStep}/{totalSteps})
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center'>
                <span className='text-muted-foreground/80 text-sm'>{t('dialog.steps.proceed')}</span>
              </div>
            )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' disabled={isSubmitting && stepStatus !== 'error'}>
                {t('dialog.actions.cancel')}
              </Button>
            </DialogClose>
            <Button
              variant='secondary'
              onClick={handleAdd}
              disabled={!selectedFile || (isSubmitting && stepStatus !== 'error')}
            >
              {isSubmitting && stepStatus !== 'error'
                ? t('dialog.actions.adding')
                : stepStatus === 'error'
                  ? t('dialog.actions.retry')
                  : t('dialog.actions.add')
              }
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddDialogButtonClient
