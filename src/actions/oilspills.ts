'use server';
import { fetchOilSpills, fetchOilSpillById, addOilSpill } from '@/lib/db/oilspills';

export const getOilSpills = async ({ 
  page = 1,
  size = 10,
  id,
  areaRange,
  durationRange,
  frequencyRange,
  sortField,
  sortDirection,
  startDate,
  endDate
}: { 
  page?: number,
  size?: number,
  id?: string,
  areaRange?: string,
  durationRange?: string,
  frequencyRange?: string,
  sortField?: 'latitude' | 'longitude' | 'area' | 'points' | 'duration' | 'frequency',
  sortDirection?: 'asc' | 'desc',
  startDate?: string,
  endDate?: string
}) => {
  return await fetchOilSpills(
    page,
    size,
    id,
    areaRange,
    durationRange,
    frequencyRange,
    sortField,
    sortDirection,
    startDate,
    endDate
  );
};

export const getOilSpillByID = async ({ 
  oilspill
}: { 
  oilspill: string 
}) => {
  return await fetchOilSpillById(oilspill);
};

export const createOilSpill = async ({
  data
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}) => {
  if (!data) {
    return { data: [] };
  }
  return await addOilSpill(data);
};
