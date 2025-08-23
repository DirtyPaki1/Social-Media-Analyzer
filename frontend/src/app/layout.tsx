'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>Social Media Analyzer</title>
        <meta name="description" content="Analyze social media sentiment with vibrant visuals" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100`}>
        <Providers>
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20"></div>
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            <header className="mb-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-4">
                Social Media Analyzer
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover insights and sentiment trends from social media
              </p>
            </header>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              {children}
            </div>
            
            <footer className="mt-10 text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} Social Media Analyzer. All rights reserved.</p>
            </footer>
          </main>
        </Providers>
      </body>
    </html>
  );
}