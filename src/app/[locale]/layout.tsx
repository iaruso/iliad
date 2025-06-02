import type React from 'react'
import type { Metadata } from 'next'
import { Kumbh_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/providers/theme-provider'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '@/styles/globals.css'
import type { Locale } from '@/@types/locale'
import { JoyrideProvider } from '@/providers/joyride-provider'

const kumbhSans = Kumbh_Sans({
  weight: ['400', '500', '600', '700'],
  variable: '--font-kumbh-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Oil Spill Monitor - beta-v2',
  description: 'A web application to visualize oil spills on a globe',
}

export default async function RootLayout(
  props: {
    children: React.ReactNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Promise<any>
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const locale = params.locale as Locale

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${kumbhSans.variable} antialiased p-0 m-0`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <JoyrideProvider>
              <main className='flex h-screen w-screen p-4 justify-center items-center'>
                <div className='h-full w-full max-container border rounded-lg overflow-hidden bg-background max-h-[1080px]'>
                  {children}
                </div>
              </main>
            </JoyrideProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

