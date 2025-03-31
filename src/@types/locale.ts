import { locales } from '@/i18n/routing';
export type Locale = (typeof locales)[number];
export type Messages = typeof import ('../../messages/en.json');