import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from '@/i18n/routing';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  return response
}

export const config = {
  matcher: ['/', '/(pt|en)/:path*']
};
