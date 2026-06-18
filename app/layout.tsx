import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Project Zenith | The Celestial Eye',
  description: 'Explore the cosmos in real-time. Track the ISS, view satellites, discover planets, and journey through time to witness celestial events.',
  keywords: ['astronomy', 'space', 'ISS', 'satellites', 'planets', 'constellations', 'stars', 'NASA'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
