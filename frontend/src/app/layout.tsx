import type { Metadata } from 'next';
import { Outfit, Source_Sans_3 } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import { AppToaster } from '@/components/app-toaster';
import './globals.css';

const display = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Meeting Scribe',
  description:
    'Transcrição corporativa em tempo real de reuniões Microsoft Teams e Google Meet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
        <AppToaster />
      </body>
    </html>
  );
}
