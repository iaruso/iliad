import { FC } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const InfoButton: FC = () => {
  const t = useTranslations('navbar.options.info')
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='secondary' size='icon' className='h-6 w-6' asChild>
            <Link href='https://github.com/iaruso/globus' target='_blank' className='h-6! w-6! flex'>
              <Info className='h-4! w-4!'/>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('tooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoButton