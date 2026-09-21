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

function PlatformChip({ platform }: { platform: string }) {
  return (
    <span className="inline-flex max-w-[11rem] truncate rounded-md border border-hairline bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft">
      {platformLabel(platform)}
    </span>
  );
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

  const countLabel =
    meetings.length === 0
      ? 'Nenhuma agenda ainda'
      : meetings.length === 1
        ? '1 reunião'
        : `${meetings.length} reuniões`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reuniões"
        description={`${countLabel}. Edite ou exclua só o que ainda não começou; depois disso, só visualizar e capturar.`}
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
              <tr className="border-b border-hairline bg-surface/90 text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5 font-semibold">Título</th>
                <th className="hidden px-5 py-3.5 font-semibold sm:table-cell">
                  Plataforma
                </th>
                <th className="px-5 py-3.5 font-semibold">Início</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="hidden px-5 py-3.5 font-semibold md:table-cell">
                  Trechos
                </th>
                <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr
                  key={meeting.id}
                  className="border-b border-hairline/70 last:border-0 transition hover:bg-brand-mist/35"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/meetings/${meeting.id}`}
                      className="font-semibold text-ink hover:text-brand"
                    >
                      {meeting.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted sm:hidden">
                      {platformLabel(meeting.platform)}
                    </p>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <PlatformChip platform={meeting.platform} />
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-muted">
                    <time dateTime={meeting.scheduledStart}>
                      {new Date(meeting.scheduledStart).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={meeting.status} />
                  </td>
                  <td className="hidden px-5 py-3.5 tabular-nums text-muted md:table-cell">
                    {meeting.segmentCount}
                  </td>
                  <td className="px-5 py-3.5 text-right align-middle">
                    <MeetingRowActions id={meeting.id} status={meeting.status} />
                  </td>
                </tr>
              ))}
              {!meetings.length && !error ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState title="Nenhuma reunião ainda">
                      Use{' '}
                      <TextLink href="/meetings/new">Agendar reunião</TextLink>{' '}
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
