import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Sidenav from '@/components/Sidenav';
import Breadcrumb from '@/components/Breadcrumb';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '管理后台',
  description: '管理后台系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='zh'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <Sidenav />
        <main className='pl-64'>
          <div className='p-4 sm:p-6 lg:p-8'>
            <Breadcrumb />
            <div className='mt-6'>{children}</div>
          </div>
        </main>
      </body>
    </html>
  );
}
