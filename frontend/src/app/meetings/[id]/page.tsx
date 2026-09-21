import Link from 'next/link';
import { meetingCanModify, MeetingSessionStatus } from '@meeting-scribe/shared';
import { api } from '@/lib/api';
import { SpeakerLabel } from '@/components/speaker-label';
import { speakerColor } from '@/lib/speaker-color';
import { AlertBanner, EmptyState, PageHeader, Panel } from '@/components/ui';

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data: Awaited<ReturnType<typeof api.getTranscript>> | null = null;
  try {
    data = await api.getTranscript(id);
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <AlertBanner tone="danger">
        Transcrição não encontrada ou API indisponível.
      </AlertBanner>
    );
  }

  const status = String(data.session.status ?? 'SCHEDULED') as MeetingSessionStatus;
  const canModify = meetingCanModify(status);

  return (
    <div className="space-y-8">
      <PageHeader
        title={String(data.session.title)}
        description={`${data.segments.length} trecho${data.segments.length === 1 ? '' : 's'} transcrito${data.segments.length === 1 ? '' : 's'}`}
        action={
          <div className="flex flex-wrap gap-2">
            {canModify ? (
              <Link href={`/meetings/${id}/edit`} className="ms-btn-secondary">
                Editar agenda
              </Link>
            ) : null}
            <Link href={`/sessions/${id}/capture`} className="ms-btn-primary">
              {status === 'COMPLETED' ? 'Abrir sessão' : 'Continuar captura'}
            </Link>
          </div>
        }
      />

      <div className="space-y-3">
        {data.segments.map((segment) => (
          <article
            key={segment.id}
            className="rounded-2xl border border-hairline bg-panel p-5 shadow-soft"
            style={{
              borderLeftColor: speakerColor(segment.speakerLabel),
              borderLeftWidth: 3,
            }}
          >
            <header className="mb-2 flex items-center justify-between gap-3 text-xs text-muted">
              <SpeakerLabel
                name={segment.speakerLabel}
                className="text-sm font-semibold"
              />
              <time className="tabular-nums" dateTime={segment.startedAt}>
                {new Date(segment.startedAt).toLocaleTimeString('pt-BR')}
              </time>
            </header>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              {segment.text}
            </p>
          </article>
        ))}
        {!data.segments.length ? (
          <Panel>
            <EmptyState title="Ainda não há trechos">
              {canModify
                ? 'Edite a agenda ou inicie a captura quando chegar a hora.'
                : 'Esta reunião já ocorreu — apenas visualização.'}
            </EmptyState>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
