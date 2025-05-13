'use client';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui-custom/button';

const useOilSpillsTableColumns = (
  handleOrderFilterChange: (field: string, direction: '' | 'asc' | 'desc') => void,
) => {
  const t = useTranslations('globe.table.header');
  const searchParams = useSearchParams();
  const fieldParams = searchParams.get('sortField') || undefined;
  const directionParams = searchParams.get('sortDirection') || undefined;

  const setOrder = (field: string) => {
    if (field === fieldParams) {
      if (directionParams === 'asc') {
        handleOrderFilterChange(field, 'desc');
      } else if (directionParams === 'desc') {
        handleOrderFilterChange(field, 'asc');
      }
    } else {
      handleOrderFilterChange(field, 'desc');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oilSpillsColumns: ColumnDef<any>[] = [
    {
      accessorKey: '_id',
      header: t('id'),
      cell: ({ row }) => (
        <div className='uppercase'>
          {row.getValue('_id')?.toString().slice(-9).padStart(9, '0')}
        </div>
      ),
    },
    {
      accessorKey: 'latitude',
      header: () => {
        return (
          <Button
            variant='tableOrder'
            size='tableOrder'
            onClick={() => setOrder('latitude')}
          >
            <span className='truncate'>{t('latitude')}</span>
            {
              fieldParams === 'latitude' ? (
                directionParams === 'asc' ? (
                  <ChevronUp className='!size-3.5'/>
                ) : (
                  <ChevronDown className='!size-3.5'/>
                )
              ) : (
                <ChevronsUpDown className='!size-3.5'/>
              )
            }
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <div>
            {row.original.coordinates[1]?.toFixed(5) || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'longitude',
      header: () => {
        return (
          <Button
            variant='tableOrder'
            size='tableOrder'
            onClick={() => setOrder('longitude')}
          >
            <span className='truncate'>{t('longitude')}</span>
            {
              fieldParams === 'longitude' ? (
                directionParams === 'asc' ? (
                  <ChevronUp className='!size-3.5' />
                ) : (
                  <ChevronDown className='!size-3.5' />
                )
              ) : (
                <ChevronsUpDown className='!size-3.5' />
              )
            }
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <div>
            {row.original.coordinates[0]?.toFixed(5) || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'area',
      header: () => {
        return (
          <Button
            variant='tableOrder'
            size='tableOrder'
            onClick={() => setOrder('area')}
          >
            <span className='truncate'>
              {
                t.rich('areaKm2', {
                  sup: (chunks) => <sup>{chunks}</sup>
                })
              }
            </span>
            {
              fieldParams === 'area' ? (
                directionParams === 'asc' ? (
                  <ChevronUp className='!size-3.5' />
                ) : (
                  <ChevronDown className='!size-3.5' />
                )
              ) : (
                <ChevronsUpDown className='!size-3.5' />
              )
            }
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <div>
            {row.original.area.toFixed(2) || '-'} km<sup>2</sup>
          </div>
        );
      },
    },
    {
      accessorKey: 'duration',
      header: () => {
        return (
          <Button
            variant='tableOrder'
            size='tableOrder'
            onClick={() => setOrder('duration')}
          >
            <span className='truncate'>
              {t('duration')}
            </span>
            {
              fieldParams === 'duration' ? (
                directionParams === 'asc' ? (
                  <ChevronUp className='!size-3.5' />
                ) : (
                  <ChevronDown className='!size-3.5' />
                )
              ) : (
                <ChevronsUpDown className='!size-3.5' />
              )
            }
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <div>
            {row.original.duration || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'frequency',
      header: () => {
        return (
          <Button
            variant='tableOrder'
            size='tableOrder'
            onClick={() => setOrder('frequency')}
          >
            <span className='truncate'>
              {t('frequency')}
            </span>
            {
              fieldParams === 'frequency' ? (
                directionParams === 'asc' ? (
                  <ChevronUp className='!size-3.5' />
                ) : (
                  <ChevronDown className='!size-3.5' />
                )
              ) : (
                <ChevronsUpDown className='!size-3.5' />
              )
            }
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <div>
            {row.original.frequency || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'points',
      header: () => {
        return (
          <Button
            variant='tableOrder'
            size='tableOrder'
            onClick={() => setOrder('points')}
          >
            <span className='truncate'>
              {t('points')}
            </span>
            {
              fieldParams === 'points' ? (
                directionParams === 'asc' ? (
                  <ChevronUp className='!size-3.5' />
                ) : (
                  <ChevronDown className='!size-3.5' />
                )
              ) : (
                <ChevronsUpDown className='!size-3.5' />
              )
            }
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <div>
            {row.original.points.toFixed(0) || '-'}
          </div>
        );
      },
    }
  ];
  return { oilSpillsColumns };
};

export default useOilSpillsTableColumns;
