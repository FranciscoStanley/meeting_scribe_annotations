'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMeetingAlerts } from '@/hooks/use-meeting-alerts';
import { MeetingAlertModal } from '@/components/meeting-alert-modal';

const links = [
  { href: '/', label: 'Reuniões' },
  { href: '/settings', label: 'Calendários' },
];

const swaggerUrl =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : 'http://localhost:3001') + '/api/docs';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { alert, dismiss } = useMeetingAlerts();

  return (
    <div className="min-h-screen bg-surface bg-atmosphere text-ink">
      <header className="sticky top-0 z-40 border-b border-hairline/80 bg-panel/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="group min-w-0">
            <p className="font-display text-lg font-semibold tracking-tight text-ink transition group-hover:text-brand">
              Meeting Scribe
            </p>
            <p className="truncate text-xs text-muted">
              Transcrição corporativa · Teams & Meet
            </p>
          </Link>
          <nav className="flex shrink-0 items-center gap-1">
            {links.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-mist text-brand-ink'
                      : 'text-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href={swaggerUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-ink"
              title="Documentação OpenAPI (Swagger)"
            >
              API
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
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
