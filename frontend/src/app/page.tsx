import Link from 'next/link';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import { ScheduledBanner } from '@/components/scheduled-banner';
import { MeetingRowActions } from '@/components/meeting-row-actions';
import {
  AlertBanner,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  TextLink,
} from '@/components/ui';

function platformLabel(platform: string) {
  if (platform === 'TEAMS') return 'Microsoft Teams';
  if (platform === 'MEET') return 'Google Meet';
  return platform;
}

export default async function HomePage() {
  let meetings: Awaited<ReturnType<typeof api.listMeetings>> = [];
  let error: string | null = null;
  try {
    meetings = await api.listMeetings();
  } catch {
    error =
      'Não foi possível carregar reuniões. Verifique se a API está em execução.';
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reuniões"
        description="Agende com horário e link. Agendas que ainda não iniciaram podem ser editadas ou excluídas; as que já ocorreram ficam só para visualizar."
        action={
          <Link href="/meetings/new" className="ms-btn-primary">
            Agendar reunião
          </Link>
        }
      />

      <Suspense fallback={null}>
        <ScheduledBanner />
      </Suspense>

      {error ? <AlertBanner tone="danger">{error}</AlertBanner> : null}

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface/80 text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5 font-semibold">Título</th>
                <th className="px-5 py-3.5 font-semibold">Plataforma</th>
                <th className="px-5 py-3.5 font-semibold">Início</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Trechos</th>
                <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr
                  key={meeting.id}
                  className="border-b border-hairline/70 last:border-0 transition hover:bg-brand-mist/40"
                >
                  <td className="px-5 py-4 font-medium text-ink">{meeting.title}</td>
                  <td className="px-5 py-4 text-muted">
                    {platformLabel(meeting.platform)}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-muted">
                    {new Date(meeting.scheduledStart).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={meeting.status} />
                  </td>
                  <td className="px-5 py-4 tabular-nums text-muted">
                    {meeting.segmentCount}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <MeetingRowActions id={meeting.id} status={meeting.status} />
                  </td>
                </tr>
              ))}
              {!meetings.length && !error ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState title="Nenhuma reunião ainda">
                      Use <TextLink href="/meetings/new">Agendar reunião</TextLink>{' '}
                      com horário e link do Teams ou Meet.
                    </EmptyState>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
