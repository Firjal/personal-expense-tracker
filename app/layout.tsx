import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jall-tracker.vercel.app'),
  title: 'JallTracker',
  applicationName: 'JallTracker',
  description: 'Kelola Keuangan Pribadi dengan Lebih Cerdas & Teratur',
  openGraph: {
    title: 'JallTracker',
    description: 'Kelola Keuangan Pribadi dengan Lebih Cerdas & Teratur',
    url: 'https://jall-tracker.vercel.app/',
    siteName: 'JallTracker',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JallTracker — Kelola Keuangan Pribadi dengan Lebih Cerdas & Teratur',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JallTracker',
    description: 'Kelola Keuangan Pribadi dengan Lebih Cerdas & Teratur',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${outfit.variable} dark`}>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
