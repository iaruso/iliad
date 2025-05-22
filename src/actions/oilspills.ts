'use server';
import { fetchOilSpills, fetchOilSpillById } from '@/lib/db/oilspills';

export const getOilSpills = async ({ 
  page = 1,
  size = 10,
  id,
  areaRange,
  durationRange,
  frequencyRange,
  sortField,
  sortDirection
}: { 
  page?: number,
  size?: number,
  id?: string,
  areaRange?: string,
  durationRange?: string,
  frequencyRange?: string,
  sortField?: 'latitude' | 'longitude' | 'area' | 'points' | 'duration' | 'frequency',
  sortDirection?: 'asc' | 'desc'
}) => {
  return await fetchOilSpills(
    page,
    size,
    id,
    areaRange,
    durationRange,
    frequencyRange,
    sortField,
    sortDirection
  );
};

export const getOilSpillByID = async ({ 
  oilspill
}: { 
  oilspill: string 
}) => {
  return await fetchOilSpillById(oilspill);
};
