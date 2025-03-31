'use server';

import { fetchOilSpills, fetchOilSpillById } from '@/lib/db/oilspills';

export const getOilSpills = async ({ page = 1, size = 10 }) => {
  return await fetchOilSpills(page, size);
};

export const getOilSpillByID = async ({ id }: { id: string }) => {
  return await fetchOilSpillById(id);
};
