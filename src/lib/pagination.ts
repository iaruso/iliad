import { PAGE_SIZE } from '@/lib/constants';

export const validateAndSetParams = (
  page: string | undefined,
  size: string | undefined,
) => {
  const validSize =
    isNaN(Number(size)) || !PAGE_SIZE.includes(Number(size))
      ? 10
      : Number(size);
  const validPage = isNaN(Number(page)) || Number(page) < 1 ? 1 : Number(page);

  return { validPage, validSize };
};

export function reloadPage() {
  window.location.reload();
}
