'use server';

import { fetchOilSpills, fetchOilSpillById } from '@/lib/db/oilspills';

export const getOilSpills = async ({ 
  page = 1, size = 10, id, minArea, maxArea, sortField, sortDirection
}: { 
  page?: number; size?: number; id?: string, minArea?: string, maxArea?: string, sortField?: 'area' | 'latitude' | 'longitude', sortDirection?: 'asc' | 'desc'
}) => {
  return await fetchOilSpills(page, size, id, minArea, maxArea, sortField, sortDirection);
};

export const getOilSpillByID = async ({ oilspill }: { oilspill: string }) => {
  return await fetchOilSpillById(oilspill);
};
