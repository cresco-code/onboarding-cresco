import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://onboarding.cresco.so'),
  title: 'crescō · onboarding',
  description: 'Bienvenido a tu equipo. Tu onboarding en crescō — a tu ritmo.',
  applicationName: 'crescō onboarding',
  authors: [{ name: 'crescō' }],
  robots: { index: false, follow: false },
  openGraph: {
    title: 'crescō · onboarding',
    description: 'Bienvenido a tu equipo. ¿Listo para crecer?',
    siteName: 'crescō',
    url: 'https://onboarding.cresco.so',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'crescō · onboarding',
    description: 'Bienvenido a tu equipo. ¿Listo para crecer?',
  },
};

export const viewport: Viewport = {
  themeColor: '#EFEAE0',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
