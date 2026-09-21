'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMeetingAlerts } from '@/hooks/use-meeting-alerts';
import { MeetingAlertModal } from '@/components/meeting-alert-modal';

const links = [
  { href: '/', label: 'Reuniões' },
  { href: '/settings', label: 'Calendários' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { alert, dismiss } = useMeetingAlerts();

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <header className="border-b border-white/10 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">
              Meeting Scribe
            </p>
            <p className="text-sm text-slate-400">
              Transcrição local · Teams & Meet
            </p>
          </div>
          <nav className="flex gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    active
                      ? 'bg-accent/20 text-white'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      {alert ? (
        <MeetingAlertModal
          title={alert.title}
          platform={alert.platform}
          startsInMinutes={alert.startsInMinutes}
          sessionId={alert.sessionId}
          joinUrl={alert.joinUrl}
          onDismiss={dismiss}
        />
      ) : null}
    </div>
  );
}
