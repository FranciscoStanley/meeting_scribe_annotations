import Link from 'next/link';
import {
  buildSpeakerColorMap,
  meetingCanCapture,
  meetingCanModify,
  MeetingSessionStatus,
  normalizeSpeakerKey,
  speakerColor,
} from '@meeting-scribe/shared';
import { api } from '@/lib/api';
import { BackLink } from '@/components/back-link';
import { TranscriptSegmentCard } from '@/components/transcript-segment-card';
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
  const canCapture = meetingCanCapture(status);
  const colorMap = buildSpeakerColorMap(
    data.segments.map((s) => s.speakerLabel),
  );

  const headerActions =
    canModify || canCapture ? (
      <div className="flex flex-wrap gap-2">
        {canModify ? (
          <Link href={`/meetings/${id}/edit`} className="ms-btn-secondary">
            Editar agenda
          </Link>
        ) : null}
        {canCapture ? (
          <Link href={`/sessions/${id}/capture`} className="ms-btn-primary">
            {status === 'LIVE' ? 'Continuar captura' : 'Iniciar captura'}
          </Link>
        ) : null}
      </div>
    ) : undefined;

  return (
    <div className="space-y-8">
      <BackLink href="/" label="Voltar para reuniões" />
      <PageHeader
        title={String(data.session.title)}
        description={`${data.segments.length} trecho${data.segments.length === 1 ? '' : 's'} transcrito${data.segments.length === 1 ? '' : 's'}`}
        action={headerActions}
      />

      <div className="space-y-3">
        {data.segments.map((segment) => (
          <TranscriptSegmentCard
            key={segment.id}
            speakerLabel={segment.speakerLabel}
            text={segment.text}
            startedAt={segment.startedAt}
            color={
              colorMap.get(normalizeSpeakerKey(segment.speakerLabel)) ??
              speakerColor(segment.speakerLabel)
            }
          />
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
