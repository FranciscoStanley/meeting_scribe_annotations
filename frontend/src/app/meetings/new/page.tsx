'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validateMeetingSchedule } from '@meeting-scribe/shared';
import { api } from '@/lib/api';
import { DateTimeField } from '@/components/date-time-field';
import { AlertBanner, PageHeader, Panel } from '@/components/ui';

export default function NewMeetingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [joinUrl, setJoinUrl] = useState('');

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
      await api.createMeeting({
        title: title.trim(),
        scheduledStart: start.toISOString(),
        scheduledEnd: end ? end.toISOString() : undefined,
        joinUrl: joinUrl.trim(),
      });
      router.push('/?agendada=1');
    } catch {
      setError(
        'Não foi possível agendar. Confira horário e link (com https://).',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        title="Agendar reunião"
        description="Escolha data e hora no calendário, informe o link do Teams ou Meet e deixe a aba aberta para o alerta na hora."
      />

      <Panel className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <label className="ms-label">
            Título
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex.: Daily Sync"
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
              placeholder="https://meet.google.com/…"
              className="ms-input"
            />
          </label>

          {error ? <AlertBanner tone="danger">{error}</AlertBanner> : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="ms-btn-primary w-full sm:w-auto"
            >
              {busy ? 'Agendando…' : 'Agendar — avisar na hora'}
            </button>
            <Link href="/" className="ms-btn-secondary w-full sm:w-auto">
              Cancelar
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
