'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  meetingCanModify,
  MeetingSessionStatus,
  validateMeetingSchedule,
} from '@meeting-scribe/shared';
import { api } from '@/lib/api';
import { DateTimeField } from '@/components/date-time-field';
import { AlertBanner, PageHeader, Panel } from '@/components/ui';

export default function EditMeetingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
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
        setStart(new Date(meeting.scheduledStart));
        setEnd(meeting.scheduledEnd ? new Date(meeting.scheduledEnd) : null);
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

    const validation = validateMeetingSchedule({
      scheduledStart: start,
      scheduledEnd: end,
      rejectPastStart: true,
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    if (!start) return;

    setBusy(true);
    try {
      await api.updateMeeting(id, {
        title: title.trim(),
        scheduledStart: start.toISOString(),
        scheduledEnd: end ? end.toISOString() : undefined,
        joinUrl: joinUrl.trim(),
      });
      router.push('/?agendada=1');
      router.refresh();
    } catch {
      setError(
        'Não foi possível salvar. Confira os dados ou se a agenda ainda não iniciou.',
      );
    } finally {
      setBusy(false);
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
        description="Altere horário ou link no calendário. Apenas agendas que ainda não iniciaram podem ser editadas."
      />

      <Panel className="p-6 sm:p-8">
        {error && !start ? (
          <AlertBanner tone="danger">{error}</AlertBanner>
        ) : (
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

            <DateTimeField
              label="Início"
              value={start}
              onChange={setStart}
              required
              minDate={new Date()}
            />

            <DateTimeField
              label="Fim"
              value={end}
              onChange={setEnd}
              optionalHint
              minDate={start ?? new Date()}
            />

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

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="ms-btn-primary"
              >
                {busy ? 'Salvando…' : 'Salvar alterações'}
              </button>
              <Link href="/" className="ms-btn-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
