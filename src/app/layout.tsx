import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Project Aura — Sovereign Financial Infrastructure',
  description: 'Next-generation financial transparency and liquidity infrastructure for Ghana\'s downstream petroleum sector.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased noise-overlay">
        <div className="aurora-bg" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
