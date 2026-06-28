import { Unbounded, Newsreader, Space_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import PulseTicker from '@/components/PulseTicker';
import { isTemporadaActiva } from '@/lib/fase';
import { routing } from '@/i18n/routing';
import '../globals.css';

const unbounded = Unbounded({ subsets: ['latin'], weight: ['400','500','600','700','900'], variable: '--font-display-raw' });
const newsreader = Newsreader({ subsets: ['latin'], style: ['normal','italic'], weight: ['400','500'], variable: '--font-body-raw' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono-raw' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com'),
  title: 'MANCHA — Arte por temporadas',
  description: 'Una galería con pocos artistas a la vez. Subastas por temporada, tres piezas por artista, tres meses por temporada.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${unbounded.variable} ${newsreader.variable} ${spaceMono.variable}`}>
      <body>
        <NextIntlClientProvider>
          {children}
          {isTemporadaActiva() && <PulseTicker />}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
