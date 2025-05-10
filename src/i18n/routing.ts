import { defineRouting } from 'next-intl/routing';
 
export const locales = ['en', 'pt'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localeDetection: true
});