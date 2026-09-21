'use client';

import { usePathname } from 'next/navigation';
import { useMeetingAlerts } from '@/hooks/use-meeting-alerts';
import { MeetingAlertModal } from '@/components/meeting-alert-modal';
import { Sidebar } from '@/components/sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const { alert, dismiss } = useMeetingAlerts(isLogin);

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface bg-atmosphere text-ink lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
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
