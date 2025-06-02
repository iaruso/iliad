'use client'
import ReactJson from 'react-json-view'
import ButtonTooltip from '@/components/ui-custom/button-tooltip'
import { Button } from '@/components/ui-custom/button'
import { useTranslations } from 'next-intl'

type DataViewerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export default function DataViewer({ data }: DataViewerProps) {
  const t = useTranslations('details')

  return (
    <div className='flex border rounded-md overflow-auto flex-1 bg-muted/20 relative' data-joyride='data-raw'>
      <ReactJson
        style={{
          height: '0px',
          width: '100%',
          padding: '1rem',
          fontSize: '0.625rem',
          backgroundColor: 'transparent',
        }}
        src={data}
        collapsed={2}
        enableClipboard={false}
        displayDataTypes={false}
        displayObjectSize={false}
        theme='grayscale'
      />
      <ButtonTooltip
        button={
          <Button
            variant='outline'
            className='sticky top-2 right-2 z-10 px-2 py-1 rounded-md gap-1 font-medium text-[10px] h-7'
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            }}
          >
            {t('copyData.label')}
          </Button>
        }
        tooltip={t('copyData.tooltip')}
      />
    </div>
  )
}