import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/providers/query-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://projectzenith.app'),
  title: { default: 'Project Zenith | The Celestial Eye', template: '%s | Project Zenith' },
  description: 'Explore the cosmos in real-time. Track the ISS, view satellites, discover planets, and journey through time to witness celestial events.',
  keywords: ['astronomy', 'space', 'ISS', 'satellites', 'planets', 'constellations', 'stars', 'NASA'],
  applicationName: 'Project Zenith',
  authors: [{ name: 'Project Zenith' }],
  creator: 'Project Zenith',
  openGraph: { type: 'website', title: 'Project Zenith | The Celestial Eye', description: 'Explore live orbital and astronomical data from your browser.', siteName: 'Project Zenith' },
  twitter: { card: 'summary_large_image', title: 'Project Zenith | The Celestial Eye', description: 'Explore live orbital and astronomical data from your browser.' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
