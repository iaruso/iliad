import { NextRequest, NextResponse, userAgent } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default function middleware(request: NextRequest) {
  const response = createMiddleware(routing)(request)
  const { browser } = userAgent(request)
  console.log('browser:', browser)
  const supportsWebGPU = browser.name?.toLowerCase() === 'firefox' ? 'false' : 'true'
  response.headers.set('X-Supports-WebGPU', supportsWebGPU)
  return response
}

export const config = {
  matcher: ['/', '/(pt|en)/:path*']
};
