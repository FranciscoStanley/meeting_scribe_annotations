'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { meetingCanModify, MeetingSessionStatus } from '@meeting-scribe/shared';
import { api } from '@/lib/api';
import { AlertBanner, PageHeader, Panel } from '@/components/ui';

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditMeetingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [status, setStatus] = useState<MeetingSessionStatus | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const meeting = await api.getMeeting(id);
        if (!meeting.canModify) {
          router.replace(`/meetings/${id}`);
          return;
        }
        setTitle(meeting.title);
        setScheduledStart(toLocalInput(meeting.scheduledStart));
        setScheduledEnd(
          meeting.scheduledEnd ? toLocalInput(meeting.scheduledEnd) : '',
        );
        setJoinUrl(meeting.joinUrl ?? '');
        setStatus(meeting.status);
      } catch {
        setError('Reunião não encontrada.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await api.updateMeeting(id, {
        title,
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: scheduledEnd
          ? new Date(scheduledEnd).toISOString()
          : undefined,
        joinUrl,
      });
      router.push('/?agendada=1');
      router.refresh();
    } catch {
      setError(
        'Não foi possível salvar. Confira os dados ou se a agenda ainda não iniciou.',
      );
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Carregando agenda…</p>;
  }

  if (status && !meetingCanModify(status)) {
    return (
      <AlertBanner tone="warn">
        Esta reunião já iniciou ou foi concluída — somente visualização.
      </AlertBanner>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        title="Editar agenda"
        description="Altere horário ou link. Apenas agendas que ainda não iniciaram podem ser editadas."
      />

      <Panel className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <label className="ms-label">
            Título
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="ms-input"
            />
          </label>
          <label className="ms-label">
            Início
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              required
              className="ms-input"
            />
          </label>
          <label className="ms-label">
            Fim <span className="font-normal text-muted">(opcional)</span>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="ms-input"
            />
          </label>
          <label className="ms-label">
            Link Meet / Teams
            <input
              type="url"
              value={joinUrl}
              onChange={(e) => setJoinUrl(e.target.value)}
              required
              className="ms-input"
            />
          </label>
          {error ? <AlertBanner tone="danger">{error}</AlertBanner> : null}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="ms-btn-primary">
              Salvar alterações
            </button>
            <button
              type="button"
              className="ms-btn-secondary"
              onClick={() => router.push('/')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
