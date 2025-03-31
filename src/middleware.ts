import { NextRequest, userAgent } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from '@/i18n/routing';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const { browser } = userAgent(request)
  const supportsWebGPU = browser.name?.toLowerCase() === 'firefox' ? 'false' : 'true'
  response.headers.set('X-Supports-WebGPU', supportsWebGPU)
  return response
}

export const config = {
  matcher: ['/', '/(pt|en)/:path*']
};
