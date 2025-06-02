'use client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui-custom/button'

export default function NotFoundPage() {
  const t = useTranslations('not-found')

  const handleGoHome = () => {
    window.location.href = '/?page=1&size=10'
  }

  return (
    <div className='flex flex-col items-center justify-center flex-1 h-full gap-2 p-4 text-center'>
      <h2>{t('title')}</h2>
      <p className='text-sm text-muted-foreground'>{t('description')}</p>
      <Button variant={'outline'} onClick={handleGoHome}>
        {t('back')}
      </Button>
    </div>
  )
}
