import ky from 'ky';
import { revalidatePath } from 'next/cache';

type ConstructUrlProps = {
  endpoint: string;
  page?: number;
  size?: number;
  sortField?: 'latitude' | 'longitude' | 'area' | 'points';
  sortDirection?: 'asc' | 'desc';
  id?: string;
  minArea?: string | number;
  maxArea?: string | number;
  oilspill?: string;
  startDate?: string;
  endDate?: string;
};

export async function getSession(): Promise<string | null> {
  return null;
}

export function constructUrl({
  endpoint, page, size, sortField, sortDirection, id, minArea, maxArea, oilspill, startDate, endDate
}: ConstructUrlProps): string {
  const params = new URLSearchParams();
  if (page !== undefined && !isNaN(page)) params.append('page', page.toString());
  if (size !== undefined && !isNaN(size)) params.append('size', size.toString());
  if (sortField) params.append('sortField', sortField);
  if (sortDirection) params.append('sortDirection', sortDirection);
  if (id) params.append('id', id.toString());
  if (minArea !== undefined) params.append('minArea', minArea.toString());
  if (maxArea !== undefined) params.append('maxArea', maxArea.toString());
  if (oilspill !== undefined) params.append('oilspill', oilspill.toString());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return `${endpoint}?${params.toString()}`;
}

export const constructHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json'
});

export const requestKy = ky.create({
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getSession();
        if (!token) throw new Error('401');
        Object.entries(constructHeaders()).forEach(([k, v]) => v && request.headers.set(k, String(v)));
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        const path = new URL(request.url).pathname || '/';
        const { method } = request;
        if (
          ['PUT', 'POST', 'PATCH', 'DELETE'].includes(method) &&
          [200, 201].includes(response.status)
        ) revalidatePath(path);
        if (
          ['PUT', 'POST', 'PATCH'].includes(method) &&
          [400, 405, 409].includes(response.status)
        ) revalidatePath(path);
        if (method === 'GET') {
          if (response.status === 401) throw new Error('401');
          if ([400, 404, 500].includes(response.status))
            throw new Error(`Server Error: ${await response.text()}`);
        }
      },
    ],
  },
});
