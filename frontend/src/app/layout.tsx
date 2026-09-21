import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meeting Scribe',
  description:
    'Transcrição em tempo real de reuniões Microsoft Teams e Google Meet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* Extensões do browser (ex.: ColorZilla) injetam attrs no <body> e geram falso hydration warning */}
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
