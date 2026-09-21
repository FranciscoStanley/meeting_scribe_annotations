import { Suspense } from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<p className="text-slate-400">Carregando…</p>}>{children}</Suspense>;
}
